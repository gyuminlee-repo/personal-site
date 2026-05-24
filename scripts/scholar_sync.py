#!/usr/bin/env python3
"""Daily Google Scholar sync for personal-site.

Fetches publications + author metrics from Google Scholar profile cnTN6OkAAAAJ
and writes them to src/data/publications.json and src/data/scholar_metrics.json.

Designed for GitHub Actions cron. Idempotent. On failure (rate limit, captcha,
network), keeps previous JSON and logs the skip, never produces partial state.

Requires: pip install scholarly
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = REPO_ROOT / "src" / "data"
PUBS_FILE = DATA_DIR / "publications.json"
METRICS_FILE = DATA_DIR / "scholar_metrics.json"
SCHOLAR_ID = os.environ.get("SCHOLAR_ID", "cnTN6OkAAAAJ")

logging.basicConfig(
    level=logging.INFO,
    format="[scholar-sync] %(message)s",
    stream=sys.stderr,
)
log = logging.getLogger("scholar-sync")


def fetch_scholar_data(scholar_id: str) -> dict:
    """Hit Google Scholar via scholarly; may raise on captcha/rate limit."""
    from scholarly import scholarly

    author = scholarly.search_author_id(scholar_id)
    author_full = scholarly.fill(
        author, sections=["basics", "indices", "counts", "publications"]
    )
    publications = []
    for pub in author_full.get("publications", [])[:100]:
        filled = scholarly.fill(pub)
        bib = filled.get("bib", {})
        authors_raw = bib.get("author", "")
        authors = authors_raw.split(" and ") if authors_raw else []
        publications.append(
            {
                "title": bib.get("title", "").strip(),
                "authors": authors,
                "year": bib.get("pub_year", ""),
                "journal": bib.get(
                    "journal", bib.get("conference", bib.get("publisher", ""))
                ),
                "volume": bib.get("volume", ""),
                "pages": bib.get("pages", ""),
                "abstract": (bib.get("abstract", "") or "")[:600],
                "url": filled.get("pub_url", ""),
                "citations": filled.get("num_citations", 0),
                "citedby_url": filled.get("citedby_url", ""),
            }
        )
        time.sleep(1.0)

    def sort_key(pub: dict) -> tuple:
        try:
            year_int = int(str(pub.get("year") or "0"))
        except ValueError:
            year_int = 0
        return (year_int, pub.get("citations", 0))

    publications.sort(key=sort_key, reverse=True)
    metrics = {
        "name": author_full.get("name", ""),
        "affiliation": author_full.get("affiliation", ""),
        "interests": author_full.get("interests", []),
        "h_index": author_full.get("hindex", 0),
        "h_index_5y": author_full.get("hindex5y", 0),
        "i10_index": author_full.get("i10index", 0),
        "i10_index_5y": author_full.get("i10index5y", 0),
        "total_citations": author_full.get("citedby", 0),
        "total_citations_5y": author_full.get("citedby5y", 0),
        "cites_per_year": author_full.get("cites_per_year", {}),
        "scholar_url": f"https://scholar.google.com/citations?user={scholar_id}",
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }
    return {"publications": publications, "metrics": metrics}


def load_fallback() -> dict | None:
    """Return previous JSON payload, or None if missing or corrupt."""
    if not (PUBS_FILE.exists() and METRICS_FILE.exists()):
        return None
    try:
        pubs_payload = json.loads(PUBS_FILE.read_text())
        metrics_payload = json.loads(METRICS_FILE.read_text())
    except json.JSONDecodeError as exc:
        log.warning("fallback JSON corrupted: %s", exc)
        return None
    return {
        "publications": pubs_payload.get("publications", []),
        "metrics": metrics_payload,
    }


def write_outputs(data: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    PUBS_FILE.write_text(
        json.dumps(
            {"publications": data["publications"]}, indent=2, ensure_ascii=False
        )
        + "\n"
    )
    METRICS_FILE.write_text(
        json.dumps(data["metrics"], indent=2, ensure_ascii=False) + "\n"
    )
    log.info(
        "wrote %d publications, h-index %d",
        len(data["publications"]),
        data["metrics"]["h_index"],
    )


def seed_minimal() -> dict:
    """Seed fallback if no previous JSON exists.

    Hard-coded from CV (260523_양동수교수_세미나_이력서.md). Marked with
    seeded=true so the UI can render a hint about awaiting first Scholar sync.
    """
    return {
        "publications": [
            {
                "title": (
                    "Methylorubrum extorquens AM1 methanol stress adaptation "
                    "via 700+ generation ALE"
                ),
                "authors": ["Lee, G."],
                "year": "2026",
                "journal": "in submission",
                "volume": "",
                "pages": "",
                "abstract": "",
                "url": "",
                "citations": 0,
                "citedby_url": "",
            },
            {
                "title": "Phage characterization (co-first)",
                "authors": ["...", "Lee, G."],
                "year": "2025",
                "journal": "J. Virol.",
                "volume": "",
                "pages": "",
                "abstract": "",
                "url": "",
                "citations": 0,
                "citedby_url": "",
            },
            {
                "title": "Methanotroph pan-genome (first author)",
                "authors": ["Lee, G."],
                "year": "2022",
                "journal": "Biotech. Bioprocess Eng.",
                "volume": "",
                "pages": "",
                "abstract": "",
                "url": "",
                "citations": 0,
                "citedby_url": "",
            },
            {
                "title": "Pathogen comparative genomics (first author)",
                "authors": ["Lee, G."],
                "year": "2020",
                "journal": "Plant Pathol. J.",
                "volume": "",
                "pages": "",
                "abstract": "",
                "url": "",
                "citations": 0,
                "citedby_url": "",
            },
            {
                "title": "Clostridium drakei autotrophy (co-author)",
                "authors": ["...", "Lee, G."],
                "year": "2020",
                "journal": "PNAS",
                "volume": "",
                "pages": "",
                "abstract": "",
                "url": "",
                "citations": 0,
                "citedby_url": "",
            },
        ],
        "metrics": {
            "name": "Gyu Min Lee",
            "affiliation": "KRIBB",
            "interests": [],
            "h_index": 0,
            "h_index_5y": 0,
            "i10_index": 0,
            "i10_index_5y": 0,
            "total_citations": 0,
            "total_citations_5y": 0,
            "cites_per_year": {},
            "scholar_url": "https://scholar.google.com/citations?user=cnTN6OkAAAAJ",
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "seeded": True,
        },
    }


def main() -> int:
    try:
        data = fetch_scholar_data(SCHOLAR_ID)
    except (RuntimeError, OSError, ValueError, ImportError) as exc:
        log.error("FAILED: %s: %s", type(exc).__name__, exc)
        traceback.print_exc(file=sys.stderr)
        fallback = load_fallback()
        if fallback is not None:
            log.warning("keeping previous JSON (no changes written)")
            return 0
        log.warning("no previous JSON, seeding minimal fallback from CV")
        write_outputs(seed_minimal())
        return 0
    write_outputs(data)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
