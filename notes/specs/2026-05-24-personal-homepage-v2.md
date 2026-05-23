---
name: Personal homepage v2 spec (vibe-first redesign)
description: HTML site for Gyu Min Lee that itself demonstrates vibe coding and agentic engineering through design + interactivity (no explicit AI-built badge).
type: design-spec
date: 2026-05-24
project: personal-site
author: gml
status: draft-for-review
supersedes: notes/_archive/2026-05-13-personal-homepage.md
---

# Personal Homepage v2, Spec

## 1. Context

Owner already runs `sites.google.com/view/sysbio-gyumin`. That asset is fine for inert credentials but cannot demonstrate the owner secondary identity: an engineer who composes systems with AI agents (vibe coding, Claude Code, Codex). The earlier spec (`notes/_archive/2026-05-13-personal-homepage.md`) leaned academic-first and disclosed the AI workflow explicitly (footer badge "Made with 0 hand-typed lines", clickable build-pipeline SVG). The owner has since rejected that explicit framing as the wrong signal, it reads as a confession instead of an artifact.

This redesign keeps the same root site, replaces the framing with **show, not tell**: the site itself should make a visitor think "this was not hand-typed alone" through (a) visual polish well beyond a personal page template, (b) interactive elements that are non-trivial to assemble (Cmd+K palette, AI Q&A widget, embedded primer demo), (c) automation visible in the data (daily Scholar sync surfacing as a quiet last-updated stamp, not a boast). No "Built with Claude Code" badge, no agent-trace page, no build-log surface.

Target audience:
- Academic visitors arriving from seminar speaker introductions, paper signatures, or word-of-mouth (advisor referrals)
- Tech-adjacent visitors (collaborators in biofoundry automation, KRIBB tooling partners, future hiring committees) who recognize the AI tool stack by sight

The site is one of the owner positioning artifacts as a "합성생물학 + AI(Claude Code)" specialist. KURO and PrimerBench remain at soft-disclosure level (name + one line, no source link) per existing PI agreement.

## 2. Goals (verifiable)

| # | Goal | Verification |
|---|------|--------------|
| G1 | 5-second test passes: a first-time visitor can name (a) who Gyumin is and (b) one concrete thing he builds | Manual cohort test of 5 readers, ≥4 pass |
| G2 | "This was not hand-typed alone" impression delivered through visual + interactive polish, not explicit AI badges | Cohort test: ≥3 of 5 readers spontaneously mention "polished", "engineered", "built", or equivalent without prompting |
| G3 | Mobile-first responsive (375 / 768 / 1024 / 1440) | Playwright screenshots at all 4 breakpoints, no horizontal scroll, no overlapping content |
| G4 | Lighthouse performance / accessibility / SEO each ≥90 on production deploy | `bun run lighthouse` against deployed URL |
| G5 | Initial transfer ≤200 KB gzipped | Network panel snapshot on cold load |
| G6 | Korean and English mirrors both feel native (no machine-translation odor) | Owner reviews KO diff before each release |
| G7 | Scholar pipeline runs daily for 30 consecutive days without manual intervention | GitHub Actions run history check at day 30 |

## 3. Non-Goals (explicit)

- **No "Built with Claude Code" badge** in body, hero, footer, or about. The explicit anti-pattern.
- **No build-log / agent-trace / "how this site was made" page** that exposes the AI workflow as content.
- **No blog or news feed** in this iteration.
- **No custom domain in v1**, ship on Cloudflare Pages default `*.pages.dev` (or `gyuminlee-repo.github.io` fallback). Custom domain deferred to v2.
- **No real-time interactive data visualizations** beyond the Vibe Layer items in §8.
- **No comments, no contact form, no auth.**

## 4. Tech Stack (locked decisions)

| Layer | Choice | Reason |
|---|---|---|
| Static framework | Astro 4.x | Built-in i18n, MDX, partial hydration, ships near-zero JS on static sections |
| Language | TypeScript (strict) | Type safety across content + island components |
| Runtime / package manager | Bun | Owner default; faster install and dev server vs npm |
| Styling | Tailwind CSS | Workspace standard, design tokens portable |
| Component primitives | shadcn/ui via React islands | Accessible defaults, owner familiar |
| Interactive islands | React 18 | Mounted only for Typewriter, CmdK palette, AskWidget, KuroDemo |
| Hosting | Cloudflare Pages | Free tier, Seoul PoP, no cold start |
| Server functions | Cloudflare Pages Functions | Backs `/api/ask` for Q&A widget |
| CI / cron | GitHub Actions | Daily Scholar sync + auto-deploy on push to main |
| Repo | `gyuminlee-repo/personal-site` (public) | Required for free Pages + Actions tier |

Locked. Any change to this table is a new spec, not an in-line revision.

## 5. Information Architecture

**Single page with anchored sections plus `/ko` mirror.** Same DOM shape per locale, content swapped at build time. Section order:

```
Top Bar (sticky)
  Logo · [Now] [About] [Software] [Publications] [Contact] · ⌘K chip · EN | KO

1. Hero
2. About (bio + research narrative)
3. Software (project cards, contains KURO mini-demo island)
4. Publications (Scholar list + metrics + small chart)
5. Now (current focus, optional, collapsed by default if empty)
6. Contact

Vibe Layer (overlaid globally, not a section):
  · Typewriter inside Hero
  · ⌘K palette
  · AI Q&A widget (floating bottom-right button → modal)
  · KURO mini-demo (embedded inside Software → KURO card)

Footer
  Last build timestamp · Scholar last synced · © Gyu Min Lee · license note
```

Rationale for ordering change vs old spec: About moves up to satisfy G1 within the first scroll. Publications and Now swap because publications are the heavier credibility payload and a quiet Now card works better as denouement than as second-screen content. Featured Publication, Research Interests, Education, Experience, Skills, Awards, References from old spec collapse into About narrative paragraphs + a compact CV-style table near the bottom of About, long-form lists belong on the CV PDF (linked), not on the homepage.

## 6. Content Sources (path-explicit)

| Section | Source path | Update mode |
|---|---|---|
| Bio / Education / Experience / Skills | `/Users/gml/_workspace/cc/obsidian/010.KRIBB/090.대외활동/260523_양동수교수_세미나_이력서.md` | Manual transcription into `src/content/en/about.mdx`; quarterly refresh |
| Publications baseline (8 papers) | Same CV file | Seed `src/content/publications.json`; overridden by Scholar sync (§7) |
| KURO project card | `/Users/gml/_workspace/cc/kuro/README.md` (if exists) + owner one-liner | One-liner authored in `src/data/software.json` |
| PrimerBench card | `/Users/gml/_workspace/cc/primerbench/README.md` + owner one-liner | Same as KURO |
| kuma card | `/Users/gml/_workspace/cc/kuma/README.md` | GitHub repo public, metadata via GitHub API |
| hermes_universe card | `/Users/gml/_workspace/cc/hermes_universe/README.md` | Same |
| scout-feed card | `/Users/gml/_workspace/cc/star-scout/` or `cc/scout-feed/README.md` (path to verify at Phase 2) | Same |
| qol card | `/Users/gml/_workspace/cc/qol/README.md` (if exists) or `CLAUDE.md` | Same |
| Profile photo | TBD, placeholder `src/assets/profile-placeholder.svg` at v1 | Owner to supply |
| Scholar profile | `https://scholar.google.com/citations?user=cnTN6OkAAAAJ` | Daily cron (§7) |

Soft-disclosure preserved: KURO, PrimerBench cards include name + one line + no source link (`github_repo: null`, `show_repo_link: false`). Public tools (kuma, hermes_universe, scout-feed, qol) include repo link + stars + last-updated.

## 7. Google Scholar Integration (user-emphasized requirement)

Owner has explicitly emphasized this requirement. Daily-fresh metrics are part of how the site signals "this is alive, not a frozen CV."

### 7.1 Pipeline

1. GitHub Actions workflow `.github/workflows/scholar-sync.yml` runs daily at 04:00 KST (19:00 UTC previous day).
2. Python script `scripts/scholar_sync.py` calls `scholarly` library against profile `cnTN6OkAAAAJ`.
3. Script writes:
   - `src/content/publications.json`, array of `{title, authors, year, journal, doi, citations, scholar_id}`
   - `src/content/scholar_metrics.json`, `{h_index, i10_index, total_citations, citations_per_year: {...}, last_synced: ISO8601}`
4. Script applies abstract / poster / conference-proceedings filter (same patterns as old spec §9, reused verbatim for parity).
5. If diff vs committed JSON, script commits to `main` directly with message `chore(scholar): daily sync YYYY-MM-DD`. Cloudflare Pages webhook fires production rebuild.
6. Astro reads both JSON files at build time → renders `<PublicationList>`, `<ScholarMetrics>` (h-index / i10 / total citations chips in Publications header), `<ScholarChart>` (citations-per-year bar, ~120px tall, neutral palette).

Direct commit to main is acceptable for Scholar sync because (a) the script is bounded to two JSON files, (b) failure modes fall back silently (§7.2), (c) PR review overhead is wasted on a daily mechanical update.

### 7.2 Failure handling (fail-safe)

| Failure | Behavior |
|---|---|
| `scholarly` HTTP 429 / captcha / block | Workflow exits 0, no commit, log warning. Previous JSON stays in place. |
| `scholarly` returns empty array | Same as above (treat as suspected block, never overwrite with empty) |
| 7 consecutive soft-fails | Discord webhook ping to owner (`DISCORD_WEBHOOK_URL` env in repo secrets) |
| 14 consecutive soft-fails | Workflow disables itself by writing `paused: true` to `.github/workflows/scholar-sync.config.yml`; site continues to use last good JSON until owner re-enables |
| Hard fail (missing auth, repo permissions broken) | Discord ping immediately |

Build never fails the site because of Scholar issues. Last good JSON is always the published source.

### 7.3 ORCID / Crossref fallback (documented, not implemented v1)

If `scholarly` becomes unworkable long-term:
- Owner ORCID: TBD (to register if not already)
- Crossref API: `https://api.crossref.org/works?query.author=Gyu+Min+Lee&filter=affiliation:KRIBB,affiliation:UNIST`, provides DOI + metadata but not citation counts
- Fallback path: `scripts/orcid_crossref_sync.py` (stub only in v1) replaces `scholar_sync.py` as cron target; metrics chips degrade gracefully (citations chip hidden if metric file lacks `total_citations`)

Implementation gated on `scholarly` actually failing for 14+ days, not preemptive.

### 7.4 Manual pinning

`src/content/publications.pinned.json` lists 4 first-author papers in canonical display order (matching CV §70-78). UI shows pinned first, then chronological remainder (most recent first).

## 8. Vibe Layer Specs

Each Phase 4 element below has a 1-paragraph description plus binary acceptance criteria.

### 8.1 Typewriter (Hero)

Hero subline contains a typewriter line that cycles through three role labels: `["Methanotroph Engineer", "Synthetic Biology Postdoc", "Vibe Coder"]`. Monospace (JetBrains Mono) for the cycled word, blinking cursor (8×20px, accent color), 60ms keystroke insertion, 1500ms pause at full word, then deletion and next word. Vanilla JS island (no library). Respects `prefers-reduced-motion: reduce` by rendering only the first label statically with no cursor animation.

Acceptance:
- AC8.1.1: Three labels cycle in defined order
- AC8.1.2: `prefers-reduced-motion` test passes (DevTools emulation), only first label shown, no animation
- AC8.1.3: No layout shift during typing (reserved min-width on the typewriter span)

### 8.2 Cmd+K Palette

Linear/Vercel-style spotlight overlay using `cmdk` library wrapped in shadcn/ui dialog. Triggered by ⌘K (mac) or Ctrl+K (other). Discoverable via `⌘K` chip in nav bar on desktop, button on mobile. Categories in order: **Sections** (jump-to-anchor), **Projects** (open project card / external link), **Links** (Scholar, GitHub, email copy), **Ask AI** (opens AskWidget). Keyboard-first: arrow keys + Enter, ESC closes, fuzzy filter on input. Mobile breakpoint (<768px): tap a floating ⌘K button bottom-left to open same modal.

Acceptance:
- AC8.2.1: ⌘K opens palette on macOS, Ctrl+K on others (detected via `navigator.platform` or modifier event)
- AC8.2.2: Arrow + Enter navigation works without mouse
- AC8.2.3: Mobile button visible at <768px, hidden ≥768px
- AC8.2.4: Fuzzy search returns expected matches for 3 test queries (e.g., "pub" → Publications, "kuro" → KURO project, "email" → Copy email)

### 8.3 AI Q&A Widget

Floating button bottom-right (56px circle, accent color, chat-bubble icon). Clicking opens a modal with a chat input. On submit, POST to `/api/ask` (Cloudflare Pages Function) with `{question, locale}`. The function calls Claude API (Sonnet 4.6 or Haiku for cost) with a system prompt that includes site-content context (bio + publications + project descriptions, assembled at build time and shipped to the function as a static string). Response streams back as markdown, rendered into the modal. Modal stays open until user closes.

Rate limit: per-IP 5 requests/hour enforced in the function (Cloudflare KV counter). Daily token cap: $1/day spend ceiling enforced by a soft check before each call (function reads a daily usage counter from KV; if exceeded, returns canned "ask quota exhausted, try email" message). Owner can flip to maintenance mode via `MAINTENANCE_MODE=true` env var.

Acceptance:
- AC8.3.1: Button visible on all viewports, opens modal
- AC8.3.2: Submitting a known question (e.g., "What's your PhD topic?") returns a coherent response sourced from CV bio
- AC8.3.3: Rate limit returns 429 with friendly message after 6th request in same hour
- AC8.3.4: Maintenance mode returns canned message when env var set

### 8.4 KURO Mini-Demo

Embedded inside Software section → KURO card → "Try it" CTA → opens a shadcn dialog. Inside: two inputs (short DNA sequence ≤200 bp, integer mutation position) + a button. Output: 3 candidate primers with calculated Tm (2(A+T)+4(G+C) formula), GC%, length 18–24 bp, Tm spread ≤5°C across the trio.

**Default implementation = dummy primer Tm calculator** (no BLAST, no specificity, no real KURO algorithm) to avoid any KRIBB IP exposure. Footer text inside the dialog:

> Simplified primer Tm preview. The full KURO tool includes AI-driven specificity prediction, Gibson Assembly aware design, and database integration, available on request: sysbio.gyumin@gmail.com

Client-side JavaScript only. No server cost. No network call. Algorithm in `src/lib/primer-demo.ts`, pure functions, unit tested.

Acceptance:
- AC8.4.1: Dialog opens from KURO card CTA
- AC8.4.2: Valid input (e.g., 50 bp seq, position 25) produces 3 primer rows with Tm/GC%/length columns
- AC8.4.3: Invalid input (seq <30 bp, position out of range) shows inline error, no crash
- AC8.4.4: Disclosure footer text present, exactly as quoted above

## 9. i18n Strategy

EN is source of truth. `/ko/` mirror auto-generated at build time.

### 9.1 Translation pipeline

1. Owner authors EN content in `src/content/en/*.mdx`
2. `scripts/translate_build.ts` (Bun-runnable TypeScript) walks `src/content/en/`, hashes each file, compares to `i18n/translation-cache.json`
3. For files whose hash changed (or new files), calls Claude API (Sonnet 4.6) with system prompt + glossary + EN content, writes `src/content/ko/*.mdx`, updates cache hash
4. Glossary file `i18n/glossary.json` carries forward from old spec §8 (methanotroph → 메탄자화균, ALE, biofoundry, etc.), reused verbatim
5. Astro `i18n` config emits `/en/*` and `/ko/*` routes; root `/` redirects based on `navigator.language` first-visit detection + `localStorage` persistence
6. Cache committed to repo → only changed sections re-translated, build cost stays near-zero

### 9.2 Korean tone (translation system prompt)

System prompt to Claude includes:

```
You are translating English content for a Korean academic homepage.
- Use 평서체 (declarative, e.g. "~다", "~한다"), NOT 존댓법 (no "~합니다")
- Academic but concise, avoid 한자어 nominalization where Korean verbs work
- Preserve Latin organism names in italics (e.g., Methylorubrum extorquens)
- Apply glossary mappings exactly when terms appear
- Do not invent credentials or numbers not in source
- Avoid em-dash (U+2014); use comma or sentence split
```

### 9.3 Failure fallback

Same as old spec §8.4: if API call fails, keep previous KO file. If none exists, fall back to EN content at the KO path with HTML comment marker `<!-- KO translation pending -->`. Build never fails over translation.

## 10. Design System Reference

High-level direction set here. Concrete tokens (CSS variables, font stacks, exact spacing scale) defined in `src/styles/tokens.css` during Phase 1.2 (per the approved plan, that is a separate sub-task).

**Direction:** bold academic + tech sensibility. Mostly neutral background (warm near-white `#FAFAF7`), single confident accent color (see §14 open decision, default deep teal `#0F766E`), strong typography hierarchy (48/32/20/16 px scale at desktop, 36/24/18/16 mobile), generous whitespace (96 px between major sections desktop), subtle motion (200–300ms ease, hover lift + shadow only, no scale, no parallax, no glassmorphism, no gradient text, gated by `prefers-reduced-motion`).

Mockup at `/Users/gml/_workspace/personal-site/mockup/preview.html` is the canonical visual reference for Phase 1.2. Tokens file extracts the values from the mockup, not re-derives them.

## 11. File Layout

Echoing the architecture from the approved plan, summarized:

```
personal-site/
├── astro.config.mjs              # i18n config, integrations
├── tailwind.config.cjs
├── package.json                  # Bun-managed
├── tsconfig.json                 # strict
├── public/
│   ├── favicon.svg
│   └── og-image.png              # 1200×630, generated once
├── src/
│   ├── pages/
│   │   ├── index.astro           # redirects to /en or /ko
│   │   ├── en/index.astro        # EN homepage
│   │   └── ko/index.astro        # KO homepage
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Software.astro
│   │   ├── Publications.astro
│   │   ├── Now.astro
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   └── islands/
│   │       ├── Typewriter.tsx
│   │       ├── CmdKPalette.tsx
│   │       ├── AskWidget.tsx
│   │       ├── KuroDemo.tsx
│   │       └── ScholarChart.tsx
│   ├── content/
│   │   ├── en/                   # MDX bio + about content
│   │   ├── ko/                   # mirror, generated
│   │   ├── publications.json     # Scholar-synced
│   │   ├── publications.pinned.json
│   │   └── scholar_metrics.json  # Scholar-synced
│   ├── data/
│   │   └── software.json         # card allowlist (KURO/PrimerBench/...)
│   ├── lib/
│   │   ├── primer-demo.ts        # KURO dummy algorithm
│   │   └── fuzzy.ts              # CmdK search
│   └── styles/
│       ├── tokens.css            # design tokens (Phase 1.2)
│       └── globals.css
├── functions/
│   └── api/ask.ts                # Cloudflare Pages Function
├── scripts/
│   ├── scholar_sync.py
│   ├── translate_build.ts
│   └── build_ask_context.ts      # bundles site content into Q&A context string
├── tests/
│   ├── primer_demo.test.ts
│   └── scholar_sync_fixtures.json
├── i18n/
│   ├── glossary.json
│   └── translation-cache.json
├── .github/workflows/
│   ├── scholar-sync.yml
│   └── deploy.yml                # Cloudflare Pages deploy on push to main
└── notes/                        # spec + plans (this folder, untouched by build)
```

## 12. Phases (mirror approved plan waves 0–4)

| Wave | Phase ID | Output | Done when |
|---|---|---|---|
| 0 | 1.1 | This spec | Owner approves |
| 0 | 1.2 | `src/styles/tokens.css` + mockup-derived design tokens | Tokens match mockup, owner confirms accent |
| 1 | 2.1 | Astro scaffold + i18n routing + Tailwind + Pretendard/Inter | `bun run dev` renders empty bilingual skeleton |
| 1 | 2.2 | Top bar + footer + locale toggle | EN/KO toggle persists across reload |
| 2 | 3.1 | Hero + About + Software + Publications + Now + Contact static content (EN) | All sections render with seed data |
| 2 | 3.2 | KO translation pipeline + first KO mirror | `/ko/` renders, owner-reviewed |
| 2 | 3.3 | Scholar sync script + GitHub Actions workflow | First successful daily run, JSON updated |
| 3 | 4.1 | Typewriter island | AC8.1.* pass |
| 3 | 4.2 | Cmd+K palette | AC8.2.* pass |
| 3 | 4.3 | AI Q&A widget + Pages Function | AC8.3.* pass |
| 3 | 4.4 | KURO mini-demo | AC8.4.* pass |
| 4 | 5.1 | Cloudflare Pages deploy + Analytics + OG image + favicon | Production URL live, Lighthouse ≥90 |
| 4 | 5.2 | Playwright screenshot regression at 4 breakpoints | All 4 captures clean |

## 13. Verification Criteria

Echoing approved plan, consolidated:

| ID | Criterion | Check |
|---|---|---|
| V1 | Single page works EN and KO with locale switch | Manual visit `/en` and `/ko`, toggle, reload |
| V2 | All vibe-layer ACs in §8 pass | Run through AC8.1.* through AC8.4.* manually + automated where possible |
| V3 | Scholar sync writes valid JSON, last_synced timestamp surfaces in footer | Inspect `publications.json` after first run |
| V4 | Lighthouse perf / a11y / SEO each ≥90 on production deploy | `bun run lighthouse` |
| V5 | Initial transfer ≤200 KB gzipped | Network tab cold load |
| V6 | Mobile breakpoints 375 / 768 / 1024 / 1440 render without horizontal scroll or overflow | Playwright screenshots |
| V7 | `prefers-reduced-motion` respected across Typewriter, hover animations, section reveals | DevTools emulation |
| V8 | No "Built with Claude Code" text anywhere | `grep -ri "claude code\|built with\|made with claude" src/ public/` returns zero matches |
| V9 | KURO / PrimerBench cards have no repo link, no screenshot | Visual inspection + `software.json` audit |

V8 is the explicit anti-pattern check. Wire it into a pre-commit hook in Phase 4.

## 14. Open Decisions to Confirm Before Implementation

| # | Decision | Default | Confirm before |
|---|---|---|---|
| OD1 | Accent color | Deep teal `#0F766E` (matches mockup) | Phase 1.2 starts |
| OD2 | KURO demo: real algorithm vs dummy Tm calculator | **Dummy** + "real version on request" footer note | Phase 4.4 starts |
| OD3 | Profile photo | **Placeholder SVG** at v1; owner supplies real photo when ready | Phase 3.1 starts (placeholder is fine to ship) |
| OD4 | Custom domain | **Deferred to v2** (use `*.pages.dev` default) | Phase 5.1 starts |

Defaults above are what gets built if owner is silent at the gate. Any change requires a one-line revision note appended to this spec, not a full rewrite.

## 15. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | `scholarly` library breaks due to Google Scholar HTML change | Medium | Medium (publications metrics go stale) | Fail-safe in §7.2 keeps last good JSON; ORCID/Crossref fallback path documented (§7.3) |
| R2 | Claude API costs from Q&A widget exceed budget | Low | Low ($1/day cap in §8.3) | KV-backed per-IP rate limit + daily token cap |
| R3 | KO translation drift on jargon (e.g., methylotroph mistranslated) | Medium | Medium (academic credibility) | Glossary enforced via system prompt; owner reviews KO diff before each release |
| R4 | "This was not hand-typed alone" goal misreads as "AI slop" if visual polish drops | Medium | High (defeats core G2) | Mockup is the floor for visual quality; reject any Phase 3.1 output below mockup polish; explicit anti-patterns from old spec §11.9 carry forward |
| R5 | Cloudflare Pages Functions cold start hurts AskWidget UX | Low | Low | Functions warm quickly; modal UX (no auto-load) hides perceived latency |
| R6 | Owner adds a real KURO demo later that exposes KRIBB IP | Low | High (PI relationship) | OD2 default is dummy; any switch requires explicit PI consultation, not a unilateral commit |

## 16. Out of Scope

- Custom domain purchase / DNS configuration
- Server-side dynamic features beyond the Q&A widget (no auth, no comments, no contact form server)
- Blog or news feed
- Real-time KURO/PrimerBench outputs beyond the v1 dummy demo
- Mobile-app companion
- LinkedIn / ResearchGate / DBpia / RISS / ORCID integration (ORCID documented as fallback path only in §7.3)
- A second photo (lab / fieldwork), owner decision deferred
- Dark mode toggle (mockup is light-only; dark mode deferred to v2)
- Build-pipeline SVG diagram (old spec §4.5.6, removed because it exposes the AI workflow, against §3)
- Footer build-status boast line (old spec §4.5.7, removed for the same reason; the footer carries only neutral last-build / last-synced timestamps)
- Live counter chips animated count-up (old spec §4.5.2, removed; static metric chips in Publications header carry the same numbers without the showy animation)

---

End of spec. Next: Phase 1.2 (tokens), then Phase 2.1 (scaffold), per §12.
