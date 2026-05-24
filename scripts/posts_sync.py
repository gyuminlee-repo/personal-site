"""
posts_sync.py — vault → src/content/posts converter.

Scans an Obsidian vault folder for *.md files, parses frontmatter,
rewrites ![[wikilink]] attachments to /images/posts/<slug>/<filename>,
copies attachments to public/images/posts/<slug>/, and writes converted
markdown to src/content/posts/<YYMMDD>-<slug>.md.

Usage:
    python3 scripts/posts_sync.py --vault-dir /path/to/vault/999.Public/posts
    python3 scripts/posts_sync.py --vault-dir ... --dry-run

Exit codes:
    0 — completed (or dry-run completed, vault may be absent)
    1 — fatal argument / IO error
"""

from __future__ import annotations

import argparse
import logging
import re
import shutil
import sys
from datetime import date, datetime
from pathlib import Path

import frontmatter

LOG = logging.getLogger("posts_sync")

# Repo root = script's parent's parent (.../personal-site)
REPO_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = REPO_ROOT / "src" / "content" / "posts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "posts"

WIKILINK_IMG = re.compile(r"!\[\[([^\]]+)\]\]")


def slugify(value: str) -> str:
    """Lowercase, hyphenated slug; strips non-alnum except hyphens."""
    value = value.strip().lower()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[-\s]+", "-", value).strip("-")
    return value or "untitled"


def derive_slug_and_date(md_path: Path, post: frontmatter.Post) -> tuple[str, date]:
    """Derive slug + date from filename `YYMMDD-slug.md` or frontmatter."""
    name = md_path.stem
    m = re.match(r"^(\d{6})-(.+)$", name)
    if m:
        yymmdd, slug = m.group(1), m.group(2)
        try:
            year = 2000 + int(yymmdd[:2])
            month = int(yymmdd[2:4])
            day = int(yymmdd[4:6])
            return slug, date(year, month, day)
        except ValueError:
            pass

    fm_date = post.metadata.get("date")
    if isinstance(fm_date, datetime):
        fm_date = fm_date.date()
    if isinstance(fm_date, date):
        return slugify(name), fm_date

    # Fallback: use file mtime
    LOG.warning("No date found for %s — using file mtime", md_path)
    mtime = datetime.fromtimestamp(md_path.stat().st_mtime).date()
    return slugify(name), mtime


def find_attachment(filename: str, vault_dir: Path, post_dir: Path) -> Path | None:
    """Locate attachment in vault/attachments first, then post_dir sibling."""
    candidates = [
        vault_dir / "attachments" / filename,
        post_dir / "attachments" / filename,
        post_dir / filename,
    ]
    for c in candidates:
        if c.is_file():
            return c
    return None


def convert_post(
    md_path: Path, vault_dir: Path, dry_run: bool
) -> tuple[Path, str, list[tuple[Path, Path]]] | None:
    """Convert single .md. Returns (out_path, body_text, copy_pairs) or None on skip."""
    try:
        post = frontmatter.load(md_path)
    except (OSError, ValueError) as exc:
        LOG.error("Failed to parse %s: %s", md_path, exc)
        return None

    slug, post_date = derive_slug_and_date(md_path, post)
    out_filename = f"{post_date.strftime('%y%m%d')}-{slug}.md"
    out_path = CONTENT_DIR / out_filename

    body = post.content
    copy_pairs: list[tuple[Path, Path]] = []

    def repl(match: re.Match) -> str:
        target = match.group(1).split("|")[0].strip()
        src = find_attachment(target, vault_dir, md_path.parent)
        if src is None:
            LOG.warning("Attachment not found for %s in post %s", target, md_path.name)
            return match.group(0)
        dest = IMAGES_DIR / slug / src.name
        copy_pairs.append((src, dest))
        return f"![](/images/posts/{slug}/{src.name})"

    body = WIKILINK_IMG.sub(repl, body)

    # Ensure date in frontmatter (Astro collection requires it)
    post.metadata["date"] = post_date.isoformat()
    if "title" not in post.metadata:
        post.metadata["title"] = slug.replace("-", " ").title()

    out_text = frontmatter.dumps(post, sort_keys=False) + "\n"
    # frontmatter.dumps returned full doc; replace body
    out_post = frontmatter.Post(body, **post.metadata)
    out_text = frontmatter.dumps(out_post, sort_keys=False) + "\n"

    return out_path, out_text, copy_pairs


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Sync vault posts to Astro content")
    parser.add_argument("--vault-dir", required=True, type=Path,
                        help="Directory containing vault *.md post files")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print intended changes without writing")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    vault_dir: Path = args.vault_dir
    if not vault_dir.is_dir():
        LOG.error("vault-dir does not exist or is not a directory: %s", vault_dir)
        return 1 if not args.dry_run else 0

    md_files = sorted(vault_dir.glob("*.md"))
    LOG.info("Found %d markdown files in %s", len(md_files), vault_dir)

    if not args.dry_run:
        CONTENT_DIR.mkdir(parents=True, exist_ok=True)
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    written = 0
    copied = 0
    for md_path in md_files:
        result = convert_post(md_path, vault_dir, args.dry_run)
        if result is None:
            continue
        out_path, out_text, copy_pairs = result

        if args.dry_run:
            LOG.info("[dry-run] would write %s (%d bytes)", out_path, len(out_text))
            for src, dest in copy_pairs:
                LOG.info("[dry-run] would copy %s -> %s", src, dest)
            continue

        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(out_text, encoding="utf-8")
        written += 1
        LOG.info("wrote %s", out_path)

        for src, dest in copy_pairs:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            copied += 1
            LOG.info("copied %s -> %s", src, dest)

    LOG.info("Done. wrote=%d copied=%d dry_run=%s", written, copied, args.dry_run)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
