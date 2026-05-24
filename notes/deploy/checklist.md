# Personal Site v0.02 — Deploy Checklist

Generated 2026-05-24. Owner runs each step manually. Subagent did NOT push or deploy.

## Pre-flight (local) — verified by subagent

- [x] 12 commits on `feat/v0.02-rebuild` (latest `fa45656` KURO demo)
- [x] `bun install` — 0 changes (lockfile in sync, 532 deps)
- [x] `bun run typecheck` — 0 errors, 0 warnings, 20 files
- [x] `bun run build` — exit 0, 2 pages, 1.05 s, 1.7 MB dist
- [x] Dev server smoke — `/` 200, `/ko/` 200
- [x] Bundle sizes within budget (CSS 52 KB)
- [x] Lighthouse — see scores below

## Lighthouse scores (local, headless Chrome)

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| `/` (EN) | **74** | 96 | 96 | 100 |
| `/ko/` | 94 | 96 | 96 | 100 |

EN performance hit by CLS=0.375 (Pretendard CDN font load + Typewriter swap). Best Practices 96 hit by 1 console error (SVG height="auto" in `ScholarChart.astro`). All others ≥90. See `notes/verify/lighthouse-en.json` and `lighthouse-ko.json` for full audits.

## GitHub setup (owner action)

- [ ] Create repo:
  ```
  gh repo create gyuminlee-repo/personal-site --public --source=. \
       --remote=origin --description "Personal homepage — Gyumin Lee"
  ```
- [ ] Push branches:
  ```
  cd /Users/gml/_workspace/personal-site
  git push -u origin main
  git push -u origin feat/v0.02-rebuild
  ```
- [ ] Optional: open PR `feat/v0.02-rebuild` → `main`, or merge locally then push main

## Cloudflare Pages (owner action)

- [ ] Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → select `gyuminlee-repo/personal-site`
- [ ] Build config:
  - Framework preset: **Astro**
  - Build command: `bun run build`
  - Build output directory: `dist`
  - Root directory: *(blank)*
  - Production branch: `main` (or `feat/v0.02-rebuild` until merged)
- [ ] Environment variables (Production + Preview):
  - `ANTHROPIC_API_KEY` = *(owner's key from console.anthropic.com — required for build-time KO translation via `src/lib/translate.ts`)*
  - Optional `SCHOLAR_ID` = `cnTN6OkAAAAJ` (also hardcoded as fallback in workflow)
- [ ] First deploy: trigger from Cloudflare UI (~2 min)

## GitHub Actions (owner action)

- [ ] Repo Settings → Secrets and variables → Actions → New repo variable
  - `SCHOLAR_ID` = `cnTN6OkAAAAJ` (or owner profile if different)
- [ ] Workflow `.github/workflows/scholar-sync.yml` already in place; first cron at 03:00 KST
- [ ] Manual test: Actions tab → Scholar Sync → Run workflow
- [ ] If Google Scholar rate-limits, fallback path keeps previous JSON; no broken builds

## Post-deploy smoke test (owner action)

- [ ] Visit production URL (e.g. `personal-site-xxx.pages.dev`)
- [ ] `/` renders Hero + Nav + About + Software + KURO demo + Publications + Footer
- [ ] `/ko/` renders Korean throughout (translator hits cache after first build)
- [ ] ⌘K opens command palette, fuzzy search works
- [ ] KURO demo: type sequence, position, base → 3 primer candidates with copy buttons
- [ ] Scholar metrics row shows current numbers (286 cites, h-index 6)
- [ ] Re-run Lighthouse mobile audit against prod URL — confirm scores ≥90 (TLS + headers may shift numbers vs local)

## Known issues to fix before public launch

Flagged during verification, not blocking deploy:

1. **SVG `height="auto"` console error** — `src/components/ScholarChart.astro` line ~14. SVG attribute spec requires a length or percentage, not the keyword `auto`. Visual unchanged, but throws DOM error and hits Best Practices score. Fix: remove `height="auto"` (let the explicit `viewBox` handle aspect ratio) or replace with a percentage. One-line change.
2. **Favicon 404** — no `public/favicon.svg` or `.ico`. Add a tiny SVG (initials `GL` on the accent color) or remove the `<link rel="icon">` if any.
3. **CLS 0.375 on EN** — caused by Pretendard CDN font swap + Typewriter island swapping height. Mitigations: (a) preload Pretendard subset locally (`@fontsource/pretendard` then `display: swap`), (b) reserve fixed height on Typewriter wrapper. Not blocking deploy; bring perf back to 90+ in a follow-up.
4. **Form fields without `id`/`name`** — CmdK search input. Add `name="query"` for a11y conformance.

## Owner confirmation items (collected from all phases)

Decisions deferred during planning. Sweep before announcing the site:

1. **Scholar name mismatch** — profile reads "Gyu Min Lee" (UNIST), site uses "Gyumin Lee". Update Scholar profile name.
2. **Public email** — Hero uses `rbals1012@gmail.com`; CV used `sysbio.gyumin@gmail.com`. Pick one and align.
3. **KRIBB lab label** — Hero/Footer say "C1 Team", CV/About say "C1 Refinery Research Center". Pick one tone.
4. **Scholar profile ID** — `cnTN6OkAAAAJ` was inherited from old spec; verify it's owner's actual account.
5. **Accent color** — teal `#0F766E` confirmed. To switch to indigo, swap `--primary` in `src/styles/global.css` `:root`.
6. **KURO mini-demo** is intentionally a dummy Tm calculator. Replace `src/islands/KuroDemo.tsx` compute functions if richer scoring desired.
7. **Profile photo** — none yet. Add `src/assets/profile.{jpg,webp}` and wire into Hero or About.
8. **Custom domain** — deferred (e.g. `gyuminlee.dev`). Add via Cloudflare Pages → Custom domains when ready.

## Future iterations

- Dark mode (tokens already prepped with `[data-theme="dark"]` placeholder)
- Blog/notes section
- Per-paper detail pages (Publications is summary only)
- ⌘K palette: inline preview pane for projects
