---
name: Personal academic homepage spec
description: Self-promotion site for Gyu Min Lee, KRIBB postdoc, with live Google Scholar integration and EN/KO toggle
type: design-spec
date: 2026-05-13
project: personal-site
author: gml
status: draft-for-review
---

# Personal Academic Homepage: Design Spec

## 1. Overview

Build a personal academic homepage that replaces `sites.google.com/view/sysbio-gyumin` with a fully controlled static site. Used for self-promotion at internal KRIBB seminars and external academic conferences. Showcases the owner as a scientist who engineers C1 microbes through biofoundry automation and AI-driven design tooling, supported by published peer-reviewed evidence and demonstrable software artifacts.

## 2. Goals & Non-Goals

### Goals

- Five-second identity recognition for both academic and software-builder audiences via a hybrid hero plus 3-card grid
- Live Google Scholar integration with automatic exclusion of conference abstracts and posters
- EN/KO bilingual support with a top-bar toggle, browser-language default, and persistence
- Honest framing of credentials with no overstatement (PhD subject precisely stated, current postdoc role precisely stated)
- Soft disclosure of in-house tools (KURO, PrimerBench) at the level already exposed in the recruitment CV, no deeper
- Accessibility from KRIBB internal network and external networks alike, with fast TTFB in Korea
- Zero recurring cost
- Maintainable by the owner alone, with quarterly content updates

### Non-Goals

- Custom domain purchase (use Cloudflare Pages subdomain)
- Interactive demos of KURO or PrimerBench inside the homepage (separate Streamlit demo can link out later if needed)
- Blog or news feed
- Real-time interactive data visualizations
- User authentication or comment system
- Mobile-first design (responsive yes, but desktop-first because seminar audience uses both)

## 3. Audience & Success Criteria

### Primary audiences

| Audience | Entry context | Decision they want to make |
|---|---|---|
| External seminar attendees | Speaker introduction slide, link in talk title | Is this person worth following or contacting after the talk? |
| Internal KRIBB seminar attendees | Internal calendar invite, intranet | What does this postdoc actually work on, and which projects overlap with mine? |
| Academic collaborators | Email signature, advisor reference | Is the publication record real, and what tools could we share? |
| Hiring committees | CV reference link, future faculty applications | Does this person have the rare bioinformatics + wet-lab + AI software triple? |
| Korean students or postdocs | Word of mouth, Korean academic SNS | Should I reach out about postdoc opportunities or collaboration? |

### Success criteria

- Within 5 seconds of landing, audience can name the owner research domain and one concrete software tool
- Within 30 seconds, audience finds at least one peer-reviewed first-author paper and one media reference
- Korean audience can read the entire site in Korean without browser auto-translation
- External link clicks (GitHub, Scholar, Linktree) trackable through Cloudflare Analytics
- Page weight under 200 KB initial transfer
- Lighthouse score of 95 or higher across all four pillars

## 4. Information Architecture

Single-page scrollable layout, sections in this order. Navigation bar fixed top with anchor links.

```
1. Top Bar
   - Logo / name (left)
   - Section anchors: Now · Research · Software · Publications · About · Contact
   - EN / KO toggle (right)
   - Theme toggle, optional dark mode (right, secondary)

2. Hero (above the fold)
   - Headline (Q1 decision, see Section 5)
   - Subline with affiliation and PhD origin
   - Profile photo (existing site asset, repositioned)

3. Now (2026)
   - 3 bullets, quarterly refresh

4. Above-Fold Grid (3 cards, equal weight)
   - Research themes summary
   - Software & tools summary
   - Selected publications summary

5. Featured Publication
   - 2026 J Biol Eng paper (first author)
   - Links to UNIST press release and 뉴스1 coverage

6. Research Interests
   - Five themes, inherited verbatim from existing site

7. Education
   - PhD UNIST (completed 2026.02), Advisor Prof. Donghyuk Kim
   - BS Kyung Hee University (2017), Advisor Prof. In Sik Chung

8. Experience
   - KRIBB Synthetic Biology Research Center, Postdoctoral researcher (2026.03 to present), under Dr. Hyewon Lee
   - Earlier research positions inherited from existing site

9. Skills
   - Four subcategories inherited from existing site
   - Updated to add AlphaFold3, Boltz-2, ESM-2, Tauri, React

10. Software & Tools (NEW)
    - KURO (one line description, no source link, screenshot only if cleared)
    - PrimerBench (same disclosure level)
    - kuma (public, link to github.com/gyuminlee-repo/kuma)
    - Claude Code tooling: claude-goal, declaw, maku-clip, claude_monitor (public links)
    - md2pdf, ClipStock, kribb-meal (public links)

11. Publications
    - Live Scholar feed, abstract-filtered (see Section 9)
    - 4 first-author papers pinned at top with manual ordering
    - Full list collapsible

12. Presentations
    - Oral presentations only by default
    - Korean Society for Biotechnology and Bioengineering listing inherited

13. Awards & Media
    - 한국을 빛낸 사람들 등재 (2 entries)
    - UNIST press release link
    - 뉴스1 coverage link

14. About
    - 3 to 4 paragraph bio in narrative form
    - Brief paragraph on AI-augmented coding philosophy (Vibe Coding mentioned here, not in hero)

15. References
    - Prof. Donghyuk Kim (UNIST, advisor)
    - Dr. Hyewon Lee (KRIBB, current PI), pending owner confirmation
    - Prof. In Sik Chung (KHU, undergrad advisor), optional

16. Contact
    - Email primary: sysbio.gyumin@gmail.com
    - Email institutional: kyumin1012@unist.ac.kr (kept as alumni address)
    - GitHub: github.com/gyuminlee-repo
    - Google Scholar link
    - Linktree: linktr.ee/sysbio_gyumin
```

## 5. Hero & Above-Fold Content

### Headline (final)

> Engineering C1 microbes with biofoundry automation and AI-driven design

Rationale: leads with active verb "Engineering" stating the scientific identity, names the organism family ("C1 microbes" covering both methylotroph PhD and methanotroph postdoc), and surfaces both methodological pillars (biofoundry automation, AI-driven design) in one breath.

### Subline (final)

> Postdoctoral researcher · KRIBB Synthetic Biology Research Center
> PhD (UNIST 2026), systems-level methanol-stress response in *Methylorubrum extorquens*

Rationale: sub-line carries the credential that the headline cannot. "PhD (UNIST 2026)" signals recency. Italicized organism name follows scientific convention and narrows the PhD subject precisely.

### Now (2026) card

Three bullets, quarterly refresh:

- Building KURO, AI-driven primer design tool (React + Tauri + Python)
- Biofoundry DBTL workflow automation at KRIBB
- PA1 ALE characterization, *Bioresource Technology* under revision

## 6. Section Content Sources

| Section | Source | Update mode |
|---|---|---|
| Hero, Now | This spec | Manual, quarterly |
| Research Interests | Existing site, 5 themes | Manual, annual |
| Education | CV docx | Manual, on PhD or position change |
| Experience | CV docx + existing site | Manual, on position change |
| Skills | CV docx + existing site | Manual, semi-annual |
| Software & Tools | This spec, GitHub repo metadata | Manual on new repo, automated stars/last-updated via GitHub API |
| Publications | Google Scholar live | Automated daily 04:00 KST |
| Presentations | CV + manual additions | Manual, after each presentation |
| Awards & Media | CV + existing site | Manual, on new award |
| About | New, written by owner | Manual, annual |
| References | CV + existing site | Manual, semi-annual |
| Contact | Existing site | Manual, on email change |

## 7. KURO and PrimerBench Disclosure Policy

Soft disclosure (option B from brainstorming Q3).

| Item | Disclose | Reason |
|---|---|---|
| Tool name | Yes | Already in CV submitted to KRIBB recruitment |
| One-line description | Yes | Already in CV |
| Screenshot | Optional, owner decision per quarter | Visual evidence valuable, but increases identifiability of internal IP |
| Source repo link | No | Repos are private or not on `gyuminlee-repo` |
| Internal mechanism details | No | Out of scope for self-promotion site |
| Demo link | No | Reserve for separate Streamlit demo if owner decides later |

Reason: maintains consistency with the recruitment CV, which is already a public document at this exposure level, while preserving PI agreement around limited external broadcast.

### UI rendering rules for Software cards

The Software & Tools section renders cards driven by an explicit allowlist in `src/data/software.json`. Each entry has these fields:

```json
{
  "id": "kuro",
  "name": "KURO",
  "description": "AI-driven primer design (React + Tauri + Python)",
  "github_repo": null,
  "show_repo_link": false,
  "show_screenshot": false,
  "show_metadata": false
}
```

For KURO and PrimerBench: `github_repo: null`, all `show_*` flags false. The build-time GitHub API fetcher (Section 10) skips entries where `github_repo` is null. Even if the entry later gains a repo URL, `show_repo_link: false` overrides display. This separates data presence from display permission.

For public repos (kuma, claude-goal, etc.): `github_repo` populated, `show_repo_link: true`, `show_metadata: true` to surface stars and last-updated.

## 8. i18n Strategy (EN/KO)

Option B from brainstorming Q7: English authored manually, Korean auto-generated by Claude API at build time, owner reviews KO before commit.

### Workflow

1. Owner authors EN content in `src/content/en/*.md`
2. Build script invokes Claude API with the EN content plus a glossary file (`i18n/glossary.json`) of academic term mappings
3. Claude API returns KO draft to `src/content/ko/*.md`
4. Owner reviews KO diff, edits as needed, commits both files
5. Astro builds both locale routes: `/en/*` and `/ko/*`

### Glossary file (`i18n/glossary.json`)

Mandatory term mappings to prevent translation drift on jargon:

```json
{
  "methanotroph": "메탄자화균",
  "methylotroph": "메탄올자화균",
  "Methylorubrum extorquens": "Methylorubrum extorquens",
  "adaptive laboratory evolution": "적응 진화 (ALE)",
  "biofoundry": "바이오파운드리",
  "DBTL cycle": "DBTL 사이클",
  "genome-scale metabolic model": "유전체 규모 대사 모델 (GEM)",
  "C1 microbe": "C1 미생물",
  "synthetic biology": "합성생물학",
  "systems biology": "시스템 생물학",
  "pan-genome": "범유전체",
  "comparative genomics": "비교유전체학",
  "Postdoctoral researcher": "박사후연구원",
  "Synthetic Biology Research Center": "합성생물학연구센터"
}
```

### Default locale

- Detect `navigator.language` on first visit, set Korean if `ko*`, else English
- Persist choice to `localStorage` under key `personal-site:locale`
- URL paths: `/` redirects to `/en/` or `/ko/` based on persisted choice or detection

### Translation failure fallback policy

If the Claude API call during build fails (rate limit, network, auth, model availability):

1. Build script logs the failure with file name and error code
2. If a previous KO version exists at the target path, build proceeds using the previous KO content (cached)
3. If no previous KO exists, build proceeds with EN content placed at the KO path, plus a top-of-file HTML comment marker `<!-- KO translation pending -->`
4. Build never fails the site over translation issues
5. CI logs surface the marker count, owner sees pending count in the next commit dashboard
6. Manual rerun: `bun run i18n:translate --file=<path>` retries one file

## 9. Google Scholar Live Sync (Cron Pipeline)

Option A from brainstorming Q6.

### Pipeline

1. GitHub Actions workflow `.github/workflows/scholar-sync.yml` runs daily at 04:00 KST (19:00 UTC previous day)
2. Python script `scripts/scholar_sync.py` calls `scholarly` library to fetch the profile at `https://scholar.google.com/citations?user=cnTN6OkAAAAJ`
3. Script applies abstract filter rules (see below)
4. Script writes filtered output to `src/data/publications.json`
5. If diff vs committed version, script opens an auto-merging PR labeled `scholar-sync`
6. PR triggers Cloudflare Pages preview build
7. After CI passes, PR auto-merges to main
8. Production rebuild and deploy via Cloudflare Pages webhook

### Sync frequency rationale

Daily chosen over weekly or monthly because: (a) new publication or citation count change is the primary live signal worth showing, (b) `scholarly` library rate limits are well below daily, (c) GitHub Actions free tier has 2000 minutes per month, daily 5-minute runs use about 150 minutes, (d) any failure surfaces within 24 hours rather than 7 days. Hourly is excluded because Scholar IP-blocks aggressive scrapers.

### Retry and SLA policy

- Retry: 3 attempts within the workflow with exponential backoff (60s, 240s, 960s)
- If all 3 attempts fail with HTTP 429 or block signals, treat as soft failure (no PR, no commit, log only)
- If 7 consecutive daily runs soft-fail, send Discord webhook notification to owner
- If 14 consecutive daily runs fail, fall back to read-only manual mode: owner edits `publications.manual.json` directly, sync workflow disabled by setting workflow input `paused: true`
- Hard-fail conditions (auth missing, repo permissions broken) immediately notify via Discord

### Abstract filter rules (apply in order, exclude on any match)

```python
import re

# Note: these are Python raw strings. \b inside r"..." is a word-boundary
# regex token, not a literal backslash-b. Verified with:
#   re.findall(r"\bAbstract\b", "Annual Meeting Abstract Book") == ["Abstract"]

EXCLUDE_VENUE_PATTERNS = [
    r"한국생물공학회\s*학술대회",
    r"Korean Society for Biotechnology.*Conference",
    r"학술발표.*초록",
    r"\bAbstract\b",
    r"\bPoster\b",
    r"Proceedings of.*Meeting",
    r"Annual Meeting of",
]
EXCLUDE_TYPE_PATTERNS = [
    "abstract",
    "poster",
    "proceedings",
]
INCLUDE_OVERRIDE = [
    # Manually whitelisted entries that the filter would otherwise miss
]

# Implementation must include unit tests for each pattern.
# Test fixtures live in tests/scholar_sync_fixtures.json with at least
# 5 known-positive (excluded) and 5 known-negative (kept) cases.
```

### Fallback behavior

- If Scholar request fails or returns empty, retain previous `publications.json`, log warning, send notification (optional Discord webhook)
- If Scholar blocks IP, fall back to manual update (committed `publications.json` becomes source of truth)
- Maintain `publications.manual.json` for entries not yet appearing on Scholar (e.g., in-revision *Bioresource Technology* paper)

### Manual pinning

`src/data/publications.pinned.json` lists the 4 first-author papers in canonical display order. UI shows pinned first, then chronological remainder.

## 10. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Static site generator | Astro 4.x | Built-in i18n, MDX support, partial hydration, fastest static output for content sites |
| Styling | Tailwind CSS | Used elsewhere in workspace, design tokens portable |
| Component library | shadcn-style React islands where interactive (locale toggle, theme toggle, expandable sections) | Owner familiar with shadcn, accessible defaults |
| Content authoring | Markdown / MDX | Source of truth for non-data sections |
| Data layer | JSON files for publications, GitHub repos, awards | Build-time generation, no runtime DB |
| Translation | Claude API (Sonnet 4.6) at build time | Glossary-aware, owner-reviewed |
| Scholar fetcher | Python `scholarly` library | Established academic Scholar scraper |
| GitHub repo metadata | GitHub REST API at build time | Pull stars, last-updated, description for software cards |
| Hosting | Cloudflare Pages | Seoul PoP, generous free tier, built-in analytics, no cold start |
| CI / cron | GitHub Actions | Free for public repos, daily Scholar sync |
| Repo | `gyuminlee-repo/personal-site` (public) | Allows GitHub Actions free tier and Cloudflare Pages free tier |
| Local path | `/Users/gml/_workspace/personal-site` | Owner-specified location |
| Deploy URL | `personal-site.pages.dev` (Cloudflare auto-assigned) | No custom domain purchase |

## 11. Visual Design Guidelines

Reference document: `~/.claude/references/design/web-design-principles.md` (workspace standard).

### Palette

- Background: near-white with subtle warm tint (`#FAFAF7`)
- Primary text: near-black (`#1A1A1A`)
- Accent default: deep teal (`#0F766E`). Reason: maps closer to scientific instrumentation and lab equipment palette than indigo, distinguishes link color from generic SaaS purple, accessible contrast against the warm-tinted background. Owner override in Phase 1 if preferred.
- Alternate accent (if owner prefers cooler tone): muted indigo (`#4338CA`)
- No more than 3 colors total in the visible palette
- Avoid pure white backgrounds (academic seminar projector glare)

### Typography

- Headings: a humanist sans-serif (Inter, Source Sans 3, or Pretendard for Korean)
- Body: same family or paired serif (Source Serif 4) for readability of bio paragraphs
- Code: JetBrains Mono or Fira Code for software section
- Korean: Pretendard (open license, comprehensive Korean coverage)

### Layout

- Maximum content width: 880px on desktop
- Section vertical rhythm: 96px between major sections
- Card grid: 3-column on desktop (>= 768px), 1-column on mobile (< 768px), no 2-column intermediate
  - Reason: tablet portrait (768px-1024px) seminar use is rare; the audience is either projector at 1920px+ or phone in landscape. A 2-column intermediate produces awkward card aspect ratios and unbalanced text density. Single breakpoint reduces visual QA surface.
- Hero photo: square crop, 240px max edge, positioned right of headline on desktop, centered above headline on mobile

### Tone

- Density: low to medium. Each section uses prose paragraphs over dense bullet lists where possible.
- No emojis
- No exclamation marks
- No hedging language ("might", "perhaps", "should be able to")
- No marketing superlatives ("cutting-edge", "groundbreaking")

## 12. Photos & Assets

- Profile photo: reuse the existing `sites.google.com/view/sysbio-gyumin` photo, downloaded and stored at `src/assets/profile.jpg`
- Optional second photo: lab or fieldwork shot for About section (deferred to owner)
- Software screenshots: deferred per Section 7 disclosure policy
- Favicon: derived from initials (G + L) or generated minimal monogram, owner picks
- Open Graph image: 1200x630, name + headline + photo, generated once and committed

## 13. Privacy & Analytics

- Cloudflare Web Analytics enabled (no cookies, GDPR-compliant)
- No third-party trackers (no Google Analytics, no Facebook Pixel)
- No contact form (mailto links only, prevents spam scraping concerns and removes server-side dependency)
- Email addresses obfuscated by basic JavaScript reveal on click

## 14. Build & Deploy Workflow

### Local development

```bash
cd /Users/gml/_workspace/personal-site
bun install
bun run dev    # Astro dev server on localhost:4321
```

### Translation refresh (manual trigger)

```bash
bun run i18n:translate    # Calls Claude API for all en files, writes ko drafts
```

Owner reviews `git diff src/content/ko/`, edits, commits.

### Scholar sync (manual trigger or cron)

```bash
python scripts/scholar_sync.py    # Same script GitHub Actions runs
```

### Production deploy

- Push to `main` branch triggers Cloudflare Pages build
- Cloudflare runs `bun run build`, deploys `dist/`
- Build artifacts cached, cold deploys around 30 seconds, hot deploys under 10

### GitHub API failure fallback (during build)

The build script reads cached repo metadata from `src/data/github-repos.cache.json`. The cache refresh policy:

1. If `--refresh-github` flag passed (or scheduled refresh runs), the build script calls GitHub REST API for each entry in `software.json` where `github_repo` is set
2. On 200 response, update cache entry
3. On 403 (rate limit), 404, or network error, retain previous cache entry, log warning
4. If cache file missing entirely, build proceeds with empty stars and "unknown" last-updated, page still renders
5. Cache TTL: 7 days. After 7 days, cards display the data with a faint "metadata cached" timestamp
6. Auth: GitHub Actions uses repo `GITHUB_TOKEN` for higher rate limit. Local development uses unauthenticated requests within 60-per-hour budget.

## 15. Roadmap & Phases

### Phase 0: Spec review (current)

- This document at `notes/specs/2026-05-13-personal-homepage.md`
- @verifier review
- User final review and approval

### Phase 1: Skeleton (target: 1 day)

- Astro project scaffold with i18n routing
- Tailwind, Pretendard font setup
- Top bar with EN/KO toggle (no content yet)
- Empty section placeholders
- Cloudflare Pages connected, first deploy verifying URL

### Phase 2: Static content (target: 2 days)

- Hero, Now, About, Education, Experience, Skills, Awards, References, Contact authored in EN
- Korean translation generated and reviewed
- Profile photo integrated
- Visual style finalized

### Phase 3: Software section (target: 1 day)

- Software & Tools cards
- GitHub API integration for repo metadata
- KURO, PrimerBench cards at soft-disclosure level

### Phase 4: Publications and Scholar sync (target: 2 days)

- Featured Publication block
- Static publications list from existing CV (commit fallback)
- `scholar_sync.py` script with abstract filter
- GitHub Actions cron workflow
- Auto-merge PR mechanism
- Manual pinning JSON
- Test Scholar sync against current profile

### Phase 5: Polish and launch (target: 1 day)

- Lighthouse audit, address regressions to maintain 95+
- Cloudflare Analytics activation
- Open Graph image generation
- Favicon
- README in repo for future maintenance

### Phase 6: Post-launch

- Quarterly Now card update reminder (calendar event)
- Annual About refresh
- New publication: automatic via Scholar sync
- New tool: manual PR adding to Software section
- Award or talk: manual PR

## 16. Open Questions

- Owner picks single accent color (deep teal vs muted indigo)
- Owner confirms `Dr. Hyewon Lee` listed as reference
- Owner decides whether to include lab/fieldwork second photo
- Owner decides whether KURO screenshots cleared for inclusion (default: no)
- Future: separate Streamlit demo subdomain for KURO/PrimerBench live demo (out of scope for v1)

## 17. Load-Bearing Assumptions

These assumptions, if invalidated, would require spec revision. Listed for explicit owner acknowledgment.

| Assumption | If invalidated, impact |
|---|---|
| Claude API remains accessible at build time with sufficient rate limit | Phase 2 translation pipeline degrades to fallback (Section 8). KO content may stall. |
| `scholarly` Python library continues to extract Google Scholar profiles without authenticated session | Phase 4 Scholar sync fails. Manual mode (publications.manual.json) becomes primary source. |
| Cloudflare Pages free tier (500 builds/month, unlimited bandwidth) sufficient | At current cadence (daily Scholar sync + occasional content edits), usage is approximately 60 builds/month. Headroom 8x. |
| GitHub Actions free tier (2000 minutes/month for public repos) sufficient | At 5 minutes per daily Scholar sync run, usage is approximately 150 minutes/month. Headroom 13x. |
| GitHub REST API unauthenticated rate limit (60 req/hour) handled by Actions auth | Local dev hits the unauthenticated cap if rebuilding more than 60 times per hour. Cache mitigates. |
| Owner has GitHub account with Cloudflare integration permissions | Setup blocker if not. Verified in advance: account `gyuminlee-repo` exists. |
| Korean academic audience accepts machine-translated content with owner review | If terminology errors slip through, fallback is full manual KO authoring (Section 8 option A). |
| Existing `sites.google.com/view/sysbio-gyumin` profile photo is owner-licensed for reuse | Owner self-confirmed during brainstorming. |
| KRIBB PI (Dr. Hyewon Lee) accepts soft-disclosure level for KURO/PrimerBench (matching CV) | If PI requests stricter, adjust to disclosure option C (full anonymization to "internal tools"). |

## 18. Out of Scope

- Custom domain purchase
- Server-side dynamic features (auth, comments, contact form server)
- Blog or news feed
- Real-time interactive visualizations of KURO outputs
- Mobile-app companion
- Korean academic SNS integration (DBpia, RISS)
- LinkedIn integration
- ResearchGate integration
- ORCID integration (deferred to Phase 6 if requested)

## 19. Success Definition

The site is considered successful at v1 launch if:

- An external seminar audience member, given the URL during a talk, lands and immediately understands the owner identity within 5 seconds
- A KRIBB internal collaborator, browsing the site, finds at least one software tool overlap or research theme overlap within 30 seconds
- Korean and English audiences both report the content reads naturally without translation friction
- Scholar sync runs daily for 30 consecutive days without manual intervention
- Page weight stays under 200 KB initial transfer
- Lighthouse all four pillars 95 or higher
- Owner can update the Now card in under 5 minutes per quarter

---

End of spec. Spec progression: brainstorming complete → @verifier review next → owner final approval → write-plan skill for implementation plan.
