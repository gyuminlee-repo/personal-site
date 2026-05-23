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
1. Top Bar (fixed, 64px)
   - Logo / name (left)
   - Section anchors: Now · Research · Software · Publications · About · Contact
   - Cmd+K hint chip (Vibe Layer, see Section 4.5.3)
   - EN / KO toggle (right)
   - Theme toggle, optional dark mode (right, secondary)

2. Hero (above the fold)
   - Headline (Q1 decision, see Section 5)
   - Typewriter cycling identity line (Vibe Layer, see Section 4.5.1)
   - Subline with affiliation and PhD origin
   - Profile photo (existing site asset, repositioned)
   - Live counter chips (Vibe Layer, see Section 4.5.2)

3. Now (2026)
   - 3 bullets, quarterly refresh

4. Above-Fold Grid (3 cards, equal weight)
   - Research themes summary
   - Software & tools summary
   - Selected publications summary

4.5. KURO Mini-Demo (Vibe Layer, see Section 4.5.5)
   - Inline interactive primer design demo

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
    - AI Q&A widget (Vibe Layer, see Section 4.5.4)
    - Build Pipeline diagram (Vibe Layer, see Section 4.5.6)

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

17. Footer
    - Build status line (Vibe Layer, see Section 4.5.7)
    - Copyright and license note
```

## 4.5. Vibe Layer (MID Tier)

Vibe coding identity is demonstrated, not described. The site itself functions as proof artifact through 5 interactive elements layered on the conservative academic base.

### 4.5.1 Hero Typewriter Cycle

Below the static headline, a single-line typewriter cycles through 5 identity statements every 4 seconds with 60ms keystroke delay and 1.5s pause between statements.

```
Engineering C1 microbes with biofoundry automation and AI-driven design

I am [building KURO ▍]
     [analyzing M. extorquens transcriptome ▍]
     [shipping Tauri apps for KRIBB ▍]
     [running ALE in real bioreactors ▍]
     [prompting Claude Code at 3am ▍]
```

Implementation: vanilla JS typewriter (no library), respects `prefers-reduced-motion: reduce` by showing only the first statement statically. Statements editable in `src/data/identities.json`.

### 4.5.2 Live Counter Chips (Hero footer)

Four chips below the hero photo show animated count-up on scroll-into-view:

```
[286 citations]  [h-index 6]  [9 public repos]  [3 in-house tools]
```

Numbers pulled at build time from `publications.json` (citations, h-index), GitHub API (repo count), and `software.json` (tool count). Animation: 1.2s ease-out count from 0. No animation if reduced-motion.

### 4.5.3 Cmd+K Command Palette

Linear/Vercel-style spotlight overlay triggered by `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux). Discoverable via small `⌘K` chip in nav bar.

Categories and commands:

```
NAVIGATE
  > Go to Now
  > Go to Software
  > Go to Publications
  > Go to About

ACTIONS
  > Switch language to EN/KO
  > Toggle theme (light/dark)
  > Copy email to clipboard
  > Open Google Scholar
  > Open GitHub profile

DEMOS
  > Try KURO mini-demo
  > Ask AI about my work

SEARCH
  > Search publications by title or year
  > Search software by name or stack
```

Implementation: cmdk React island (shadcn/ui pattern), keyboard-first navigation (arrow keys + Enter), fuzzy search. Mounted as a single React component with the rest of the site staying static Astro.

### 4.5.4 AI Q&A Widget

Located at the end of the About section. Free-text input that sends question + selected context to Claude Haiku via a Cloudflare Pages Function endpoint `/api/ask`.

Context corpus assembled at build time:
- All publication titles + abstracts (where available via Scholar)
- About bio paragraphs
- Research Interests section
- Education + Experience sections
- Software section descriptions

Prompt template:

```
You are answering questions about Gyu Min Lee, a postdoctoral researcher at KRIBB.
Answer based ONLY on the context below. If the question is unrelated or unanswerable
from context, say so and suggest contacting via email.

Context:
{corpus}

Question: {user_question}

Answer in the same language as the question (Korean or English). Cite specific
publications inline using the format [Author Year, Journal] when relevant.
```

Rate limiting: Cloudflare Pages Function with 5 requests per IP per hour, returns 429 with explanation message. Caches identical questions for 24h.

Cost guard: estimated 100-500 queries per month at Haiku pricing equals approximately 1-5 USD per month. If owner sees abuse, function flips to maintenance mode via env var.

### 4.5.5 KURO Mini-Demo

Embedded primer design demo on the Software section, positioned right after the KURO card.

Functionality (client-side JS only, no API call):
- Input: paste a DNA sequence (50-2000 bp)
- Button: "Design primers"
- Output: forward + reverse primer sequences with calculated Tm, GC%, length

Algorithm: simple greedy primer pair search using basic Tm formula `2*(A+T) + 4*(G+C)`, GC content 40-60%, length 18-24 bp, Tm difference < 5°C between pair. No BLAST, no specificity check, no advanced KURO features.

Disclosure footer text:

> This is a 100-line subset of KURO basic primer design. Full KURO includes
> AI-driven specificity prediction, Gibson Assembly aware design, and database
> integration. Available on request: sysbio.gyumin@gmail.com

Implementation: pure JS function in `src/lib/primer-demo.js`, no external library, no network call.

### 4.5.6 Build Pipeline Diagram (About section)

Inline vertical flow diagram showing how the site itself was built:

```
GitHub commit (owner)
        ↓
GitHub Actions cron (04:00 KST daily)
        ↓
scholarly fetch → abstract filter → publications.json
        ↓
Claude API (Sonnet 4.6) translates EN → KO
        ↓
Astro static build
        ↓
Cloudflare Pages global edge deploy

Made with AI-augmented coding (Vibe Coding).
Verified by author. No template, no manual deploys.
```

Implementation: SVG diagram authored in Bold Academic v4 style (per `~/.claude/references/design/academic-svg-style.md`). Nodes are clickable; clicking a node reveals a small modal with the actual command or workflow file path that runs that step (e.g., clicking "scholarly fetch" shows `.github/workflows/scholar-sync.yml`).

### 4.5.7 Footer Build Status

Always visible at page bottom:

```
Last build: 2h ago · Scholar synced 47 pubs · 3 abstracts auto-excluded
KO translated by Claude API in 12s · Made with 0 hand-typed lines
```

All values dynamic, set at build time via Astro environment variables. The "0 hand-typed lines" claim is intentional vibe coding signature, qualified by author note in About section explaining what counts as hand-typed (zero raw configuration; prompted code is the work).

### 4.5.8 Subtle Motion (scroll-linked)

- Card hover: 1° rotation tilt + 4px lift + shadow change, transition 200ms
- Section reveal: stagger fade-in (children offset 80ms), single direction (bottom-up 12px translate)
- All motion gated by `prefers-reduced-motion: reduce`, falling back to static state
- No parallax background, no particle effects, no shaders (anti-pattern per design references)

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

Reference documents (workspace standards):
- `~/.claude/references/design/web-design-principles.md`
- `~/.claude/references/design/anti-patterns.md`
- `~/.claude/references/design/design-review-protocol.md`
- `~/.claude/references/design/pre-coding-design-process.md`
- `~/.claude/references/design/academic-svg-style.md` (for inline SVG diagrams)

### 11.1 Palette (3-color rule)

- Background: warm near-white `#FAFAF7` (avoids projector glare)
- Primary text: near-black `#1A1A1A` (softer than pure black)
- Accent default: deep teal `#0F766E` (scientific instrumentation tone)
- Borders and dividers: gray `#E5E5E5` (counts as part of background, not as a 4th color)
- Owner override option in Phase 1: muted indigo `#4338CA`
- WCAG AA compliance verified: text-on-bg contrast ratio 17.8:1, accent-on-bg ratio 5.6:1

### 11.2 Typography

| Role | Font | Size desktop | Size mobile | Line height |
|---|---|---|---|---|
| Body (KO) | Pretendard | 16px | 16px | 1.7 |
| Body (EN) | Inter | 16px | 16px | 1.5 |
| H1 (Hero) | Pretendard / Inter | 48px | 36px | 1.15 |
| H2 (Section) | Pretendard / Inter | 32px | 24px | 1.25 |
| H3 (Card title) | Pretendard / Inter | 20px | 18px | 1.3 |
| Caption / Meta | Pretendard / Inter | 14px | 13px | 1.5 |
| Code | JetBrains Mono | 14px | 13px | 1.5 |

- Language detection drives font stack (HTML lang attribute)
- `text-wrap: pretty` applied to all H1, H2, H3
- Strategic emphasis: at most one bolded sentence per section, no italic+bold+underline combination
- Pretendard chosen over Noto Sans CJK for license clarity and lighter weight

### 11.3 Container & Layout

| Layer | Max width | Reason |
|---|---|---|
| Outer chrome (nav, footer) | 1280px (XL) | Standard web page width per design principles |
| Hero, Now, 3-card grid, Featured pub | 1024px (Large) | Visual breathing room without forcing eye movement |
| Body text in CV sections (About, Bio paragraphs) | 680px (Medium) | Readability limit for prose |
| Card internal content | 100% of card | Standard |

Spacing scale (4px units):

| Use | px |
|---|---|
| Icon-text gap | 4 |
| Button internal padding | 8 |
| Small card internal padding | 12 |
| Card padding (general) | 16 |
| Mobile horizontal padding | 16 |
| Section internal element gap | 24 |
| Desktop horizontal padding | 32 |
| Section vertical (general) | 48 |
| Hero / CTA vertical | 64 |
| Major page section vertical | 96 |

### 11.4 Responsive Strategy

Mobile-first. Tailwind breakpoints used:

| Class | Range | Behavior |
|---|---|---|
| (default) | 0-639px | Mobile, single column, photo above headline, hamburger menu |
| `md:` | 768px+ | Desktop layout activates: 3-column grid, photo right of headline, full nav bar visible |
| `lg:` | 1024px+ | No layout change, optional dark mode and reduced UI density toggle becomes available |
| `xl:` | 1280px+ | Outer chrome reaches max width |

Single layout breakpoint at `md:` (no 2-column tablet intermediate). Reason: seminar use is bimodal (phone or projector), tablet portrait would produce awkward card aspect ratios and unbalanced density.

### 11.5 Card 4-State Specifications

Every data-driven card (Software cards with GitHub metadata, Publications cards with Scholar data) implements all 4 states:

| State | Trigger | Visual |
|---|---|---|
| Loading | Initial render before data resolved | Skeleton with animated shimmer (subtle, 1.5s loop, gated by reduced-motion) |
| Empty | Data fetched, zero results | Centered text "No items yet" plus appropriate CTA (e.g., "View on Scholar") |
| Error | Fetch failed | Error message in muted tone plus "Retry" button (calls fetch again) |
| Success | Data resolved with content | Standard card render |

For Software cards: at build time data resolves, so Loading is brief or absent, Empty is rare. Error mainly during owner local dev.

For Publications: build-time resolution from `publications.json`, fallback to `publications.manual.json`.

### 11.6 Buttons & Interactions

- Semantic markup: `<a>` for navigation, `<button>` for actions, no `<div onClick>`
- Button hierarchy: 1 primary CTA per visible section, secondary for retry or cancel, ghost for dismiss
- Required states: Default, Hover, Focus (visible ring), Active, Disabled
- Cursor: `cursor-pointer` on all `<a>` and `<button>` elements
- Transitions: `transition-colors duration-200` (all interactive elements)
- Hover never causes layout shift (no scale on hover, only color/shadow changes)

### 11.7 Motion

- Default: subtle motion as specified in Section 4.5.8
- All motion respects `prefers-reduced-motion: reduce`
- No background animations, no particle effects, no parallax, no shaders (per anti-patterns)
- Page transitions: none (single-page anchor scrolling, smooth scroll behavior CSS)

### 11.8 Tone (writing within UI)

- Density: low to medium. Prose over dense bullet lists.
- No emojis (SVG icons only, from Heroicons or Lucide)
- No exclamation marks
- No hedging language ("might", "perhaps", "should be able to")
- No marketing superlatives ("cutting-edge", "groundbreaking", "state-of-the-art")
- Form error messages follow "what is wrong + how to fix" pattern

### 11.9 Anti-Patterns to Avoid (explicit)

| Anti-pattern | Why excluded |
|---|---|
| Glassmorphism (blur + transparent + glow border) | AI-slop signature, hurts readability on warm bg |
| Purple-to-blue gradient backgrounds | Generic SaaS, dilutes scientific identity |
| Gradient text on headings or metrics | Same as above |
| Multiple colors in palette | 3-color rule, prevents visual noise |
| Identical card grid with infinite repeat | Use hierarchy, not uniformity |
| Card-within-card nesting | Flat structure, use spacing for grouping |
| Border-radius > 16px on cards | Looks toy-like, use 8-12px max |
| Particles, neon glow, animated mesh backgrounds | Hurts gravitas of academic context |
| Emoji icons | Use Heroicons or Lucide SVGs only |
| Floating "AI assistant" bubble in corner | Use the Cmd+K palette and embedded Q&A widget instead |

### 11.10 SVG Style for Inline Diagrams

Diagrams in the Build Pipeline (Section 4.5.6) and any inline figures follow Bold Academic v4 (`~/.claude/references/design/academic-svg-style.md`):
- Stroke width 2-3px
- Solid colors only, no gradients
- Editable text (no rasterized paths)
- Color subset: text color, accent color, gray for borders
- Clear node-edge structure, generous whitespace

## 12. UI Design 3-Documents

Per `pre-coding-design-process.md`, before any code is written, three documents must exist. They follow.

### 12.1 Mood Document

Tone keywords:
- Editorial academic (think *Quanta Magazine* article layouts, not enterprise SaaS dashboards)
- Quietly technical (build status visible but not boastful)
- Spacious and confident (generous whitespace, no information overload)
- Bilingual-native (KO and EN both feel like first-class, not translation)

Visual references (open in browser to anchor expectations):
- `https://patrickcollison.com` (clean, content-driven, high information density done well)
- `https://andymatuschak.org` (academic, has /now page pattern)
- `https://lilianweng.github.io` (researcher portfolio with publications focus)
- `https://www.linear.app` (Cmd+K palette implementation reference, motion discipline)
- `https://vercel.com` (Cmd+K, build status panel patterns)

Avoid references:
- Generic Vercel/Next.js template starters
- Tailwind UI marketing templates
- Personal brand sites with lifestyle imagery

### 12.2 Content Flow

Information hierarchy and user path:

```
ENTRY (5 seconds)
  Hero headline → audience knows: what does this person do
  Hero photo → visual anchor
  Live counter chips → "this is real, current, and substantial"
  Now section → "this is what is happening right now"

CONFIDENCE BUILDING (30 seconds)
  3-card grid → quick triage by audience interest (research/software/papers)
  Featured publication → social proof (peer-reviewed + media coverage)
  KURO mini-demo → "wait, I can try something he built right here"

DEPTH VERIFICATION (3-5 minutes)
  Research Interests → academic legitimacy
  Education + Experience + Skills → credential and capability
  Software & Tools full list → product-builder evidence
  Publications full list (Scholar live) → bibliographic depth

CONNECTION (decision moment)
  About + AI Q&A widget → "I can ask him anything"
  Build Pipeline diagram → "this is how he works"
  References → trust transfer
  Contact → action
```

CTAs by section:
- Hero: implicit (scroll), no button
- Software cards: "View on GitHub" or "Read more" per disclosure flag
- Publications: "View on Scholar" (full list link)
- AI Q&A widget: "Ask" button (primary CTA of About section)
- Contact: email link as the page-level primary CTA

### 12.3 Sketch (wireframe)

Wireframes already documented in Section 4 (textual IA) and Section 11.3 (container widths). The brainstorming conversation produced ASCII wireframes for desktop and mobile that serve as the canonical sketch reference. These are the source of truth during Phase 1 implementation, not retrofitted Figma files.

## 13. Photos & Assets

- Profile photo: reuse the existing `sites.google.com/view/sysbio-gyumin` photo, downloaded and stored at `src/assets/profile.jpg`
- Optional second photo: lab or fieldwork shot for About section (deferred to owner)
- Software screenshots: deferred per Section 7 disclosure policy
- Favicon: derived from initials (G + L) or generated minimal monogram, owner picks
- Open Graph image: 1200x630, name + headline + photo, generated once and committed

## 14. Privacy & Analytics

- Cloudflare Web Analytics enabled (no cookies, GDPR-compliant)
- No third-party trackers (no Google Analytics, no Facebook Pixel)
- No contact form (mailto links only, prevents spam scraping concerns and removes server-side dependency)
- Email addresses obfuscated by basic JavaScript reveal on click

## 15. Build & Deploy Workflow

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

## 16. Roadmap & Phases

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

### Phase 5: Vibe Layer (target: 2 days)

- Hero typewriter cycle (Section 4.5.1)
- Live counter chips (Section 4.5.2)
- Cmd+K command palette (Section 4.5.3)
- AI Q&A widget with Cloudflare Pages Function backend (Section 4.5.4)
- KURO mini-demo (Section 4.5.5)
- Build pipeline SVG diagram (Section 4.5.6)
- Footer build status line (Section 4.5.7)
- Subtle motion on cards and section reveals (Section 4.5.8)
- prefers-reduced-motion verified across all motion

### Phase 6: Polish and launch (target: 1 day)

- Lighthouse audit, address regressions to maintain 95+
- Cloudflare Analytics activation
- Open Graph image generation
- Favicon
- 3-Lens Design Review per `~/.claude/references/design/design-review-protocol.md` (Visual / Usability / Detail)
- Pre-Delivery Checklist verification
- Playwright screenshot verification at 4 breakpoints (375 / 768 / 1024 / 1440)
- README in repo for future maintenance

### Phase 7: Post-launch

- Quarterly Now card update reminder (calendar event)
- Annual About refresh
- New publication: automatic via Scholar sync
- New tool: manual PR adding to Software section
- Award or talk: manual PR

## 17. Open Questions

- Owner picks single accent color (deep teal vs muted indigo)
- Owner confirms `Dr. Hyewon Lee` listed as reference
- Owner decides whether to include lab/fieldwork second photo
- Owner decides whether KURO screenshots cleared for inclusion (default: no)
- Future: separate Streamlit demo subdomain for KURO/PrimerBench live demo (out of scope for v1)

## 18. Load-Bearing Assumptions

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

## 19. Out of Scope

- Custom domain purchase
- Server-side dynamic features (auth, comments, contact form server)
- Blog or news feed
- Real-time interactive visualizations of KURO outputs
- Mobile-app companion
- Korean academic SNS integration (DBpia, RISS)
- LinkedIn integration
- ResearchGate integration
- ORCID integration (deferred to Phase 6 if requested)

## 20. Success Definition

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
