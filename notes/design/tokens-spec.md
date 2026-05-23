---
date: 2026-05-24
type: design-spec
project: personal-site
phase: 1.2
owner: gyumin
status: draft-for-merge
updated: 2026-05-24
tags: [design-system, tokens, color, typography]
---

# Personal Site — Design Tokens Spec

Scope: foundation tokens for the static personal homepage scaffold (Phase 1.3). All component-level styling derives from this file. Naming follows shadcn/ui convention so the token file (`tokens.css.draft`) drops into a shadcn-initialized project without renaming.

Constraints carried from Phase 1.1 (archived spec) and `~/.claude/references/design/web-design-principles.md`:

1. 3-color rule: background, foreground, accent. Borders are neutral, not a fourth color.
2. WCAG AA on text (4.5:1) and accent buttons (3:1 for large text, 4.5:1 if used on body-size text).
3. No glassmorphism, no gradient backgrounds, no purple-to-blue, no emoji as UI element.
4. Component border radius cap: 12px (0.75rem). Pills only for chips and tags.
5. Bold Academic visual register, not SaaS landing register.

---

## 1. Color Tokens

### 1.1 Accent decision — TEAL

Chosen: **`#0F766E`** (Tailwind `teal-700`).

Rationale (one line per criterion):
- **Differentiation**: nearly every AI-generated portfolio defaults to indigo or violet, teal sidesteps the cliche.
- **Domain fit**: teal reads as scientific instrumentation, oceanography, and lab labels — congruent with C1 microbe research.
- **Continuity**: the mockup at `/Users/gml/_workspace/personal-site/mockup/preview.html` already validated teal against real content; switching now would invalidate visual review.
- **Contrast**: `#0F766E` on `#FAFAF7` measures 5.63:1, passing AA for body text and AAA for large text. The indigo alternative `#4338CA` measures 8.04:1 but visually competes with body text weight.
- **Dark mode forward path**: teal `oklch()` lift to `#2DD4BF` for dark mode reads as natural saturation increase; indigo would need hue rotation.

Indigo `#4338CA` is documented as an owner override but not the default token value.

### 1.2 Full color table

| Token | Hex | Notes |
|---|---|---|
| `--background` | `#FAFAF7` | Warm off-white, avoids projector glare |
| `--foreground` | `#0A0A0A` | Near-black, softened to 0A from pure black for less optical vibration |
| `--card` | `#FFFFFF` | Card surface, lifts above background |
| `--card-foreground` | `#0A0A0A` | Same as foreground for body text inside cards |
| `--popover` | `#FFFFFF` | Cmd+K palette, tooltips |
| `--popover-foreground` | `#0A0A0A` | — |
| `--primary` | `#0F766E` | Accent teal, the only saturated color in the system |
| `--primary-foreground` | `#FAFAF7` | Text on teal buttons, matches body background warmth |
| `--secondary` | `#F4F4F1` | Muted surface (input fill, secondary buttons) |
| `--secondary-foreground` | `#1F1F1C` | Text on secondary surfaces |
| `--muted` | `#F4F4F1` | Identical to secondary by design, single muted surface |
| `--muted-foreground` | `#525252` | Captions, meta text, placeholder. 7.5:1 on bg |
| `--accent` | `#E6F4F2` | Subtle tinted background for accent-related hover states |
| `--accent-foreground` | `#0F766E` | Teal text on subtle teal-tint background |
| `--destructive` | `#B91C1C` | Subdued crimson, not bright red. Reserved for true delete/error |
| `--destructive-foreground` | `#FAFAF7` | — |
| `--success` | `#15803D` | Subdued forest green. Reserved for confirmed-success state |
| `--success-foreground` | `#FAFAF7` | — |
| `--warning` | `#A16207` | Subdued amber. Reserved for caveats |
| `--warning-foreground` | `#FAFAF7` | — |
| `--border` | `#E5E5E0` | Dividers, card outlines. Warmer than gray-200 to match warm bg |
| `--input` | `#E5E5E0` | Same as border for input field outline |
| `--ring` | `#0F766E` | Focus ring uses accent at full opacity, paired with 3px offset |

### 1.3 Visual swatches

```
Background     Foreground   Card        Primary      Secondary   Muted-fg    Border
#FAFAF7        #0A0A0A      #FFFFFF     #0F766E      #F4F4F1     #525252     #E5E5E0
[warm white]   [near-blk]   [pure wht]  [teal-700]   [stone-100] [neutral]   [warm gray]

Destructive    Success      Warning     Accent-tint  Ring
#B91C1C        #15803D      #A16207     #E6F4F2      #0F766E
[crimson-700]  [green-700]  [amber-700] [teal-50]    [primary]
```

### 1.4 Dark mode (deferred to v2)

Reserved tokens documented for forward compatibility, not yet implemented:

- `--background` dark candidate: `#0F1411` (warm near-black, not pure 000)
- `--foreground` dark candidate: `#F2F2EE`
- `--primary` dark candidate: `#2DD4BF` (teal-400, lift saturation for dark surface)
- `--border` dark candidate: `#27272A`

Implement via `[data-theme="dark"]` block after v1 ships and user requests it. Phase 1.3 should structure `tokens.css` to allow a single-file dark mode addition without restructuring component styles.

---

## 2. Typography Tokens

### 2.1 Font stacks

| Stack | Use | Order |
|---|---|---|
| Sans (EN) | English body, headings | `Inter`, system-ui, -apple-system, BlinkMacSystemFont, sans-serif |
| Sans (KR) | Korean body, headings | `Pretendard`, system-ui, -apple-system, sans-serif |
| Mono | Code blocks, kbd, monospace UI | `JetBrains Mono`, `IBM Plex Mono`, ui-monospace, SFMono-Regular, monospace |

**Font loading strategy**: self-host via `@fontsource/inter` and Pretendard's CDN/dynamic-subset. JetBrains Mono via `@fontsource/jetbrains-mono`. Weights to load: 400, 500, 600, 700. Use `font-display: swap` and preload only the 400 + 700 .woff2 variants critical for the hero.

Language detection: HTML `lang` attribute switches the body class. Inter is the default; `[lang="ko"]` body sections receive `font-family: Pretendard, ...` with `line-height: 1.7`.

### 2.2 Type scale (rem, font-size)

| Token | rem | px (16px base) | Use |
|---|---|---|---|
| `text-xs` | 0.75 | 12 | Footnotes, kbd, small captions |
| `text-sm` | 0.875 | 14 | Caption, meta, table cells |
| `text-base` | 1 | 16 | Body (minimum size, per principles) |
| `text-lg` | 1.125 | 18 | Lead paragraph, large body |
| `text-xl` | 1.25 | 20 | H3, card title |
| `text-2xl` | 1.5 | 24 | H2 mobile |
| `text-3xl` | 1.875 | 30 | H2 desktop, in-page divider |
| `text-4xl` | 2.25 | 36 | H1 mobile |
| `text-5xl` | 3 | 48 | H1 desktop |
| `text-6xl` | 3.75 | 60 | Hero display (reserve) |
| `text-7xl` | 4.5 | 72 | Hero display large (reserve, unused by default) |

### 2.3 Line height

| Token | Value | Use |
|---|---|---|
| `leading-tight` | 1.1 | Display headings (H1) |
| `leading-snug` | 1.25 | H2, H3 |
| `leading-normal` | 1.5 | Default body |
| `leading-relaxed` | 1.6 | EN body paragraphs (paragraph rhythm) |
| `leading-loose` | 1.7 | KR body paragraphs (Korean readability target) |

### 2.4 Letter spacing

| Token | Value | Use |
|---|---|---|
| `tracking-tighter` | -0.025em | Display headings (very large H1 only) |
| `tracking-tight` | -0.02em | H1, H2 |
| `tracking-normal` | 0 | Body, default |
| `tracking-wide` | 0.025em | Section marks, ALL-CAPS labels |
| `tracking-widest` | 0.1em | Demo dividers, small caps eyebrows |

### 2.5 Font weight tokens

| Token | Value | Use |
|---|---|---|
| `font-normal` | 400 | Body |
| `font-medium` | 500 | UI labels, captions, nav links |
| `font-semibold` | 600 | H2, H3, button text |
| `font-bold` | 700 | H1, key metrics |

Owner's instruction holds: no italic + bold + underline combination. Strategic emphasis means one bolded sentence per section, max.

---

## 3. Spacing Tokens (4px base)

| Token | rem | px | Use |
|---|---|---|---|
| `space-0` | 0 | 0 | Reset |
| `space-1` | 0.25 | 4 | Icon-text gap |
| `space-2` | 0.5 | 8 | Button internal padding (Y) |
| `space-3` | 0.75 | 12 | Small card internal padding |
| `space-4` | 1 | 16 | Card padding, mobile horizontal padding |
| `space-6` | 1.5 | 24 | Section internal element gap |
| `space-8` | 2 | 32 | Desktop horizontal padding |
| `space-12` | 3 | 48 | Section vertical (general default) |
| `space-16` | 4 | 64 | Hero / CTA vertical |
| `space-24` | 6 | 96 | Major page section vertical |
| `space-32` | 8 | 128 | Hero-to-section large breathing |
| `space-48` | 12 | 192 | Reserve (rarely used) |
| `space-64` | 16 | 256 | Reserve |
| `space-96` | 24 | 384 | Reserve |
| `space-128` | 32 | 512 | Reserve |

These follow Tailwind's default numeric scale. The named gaps in Phase 1.1 (16 / 24 / 32 / 48 / 64 / 96) map directly. Tokens `space-48` and larger are reserve, not expected to appear in v1 layouts.

---

## 4. Border Radius Tokens

| Token | rem | px | Use |
|---|---|---|---|
| `radius-none` | 0 | 0 | Sharp edges (tables, dividers) |
| `radius-sm` | 0.25 | 4 | Small inputs, kbd, badges |
| `radius` | 0.5 | 8 | **Component default**: buttons, inputs, cards (small) |
| `radius-md` | 0.625 | 10 | Card (general), matches mockup |
| `radius-lg` | 0.75 | 12 | Hero card, featured publication card. Maximum for cards |
| `radius-xl` | 1 | 16 | Cmd+K palette container only |
| `radius-full` | 9999px | — | Chips, pulse dot, avatar circle |

Hard rule from Phase 1.1: no border-radius above 16px on rectangular surfaces. `radius-full` is reserved for shapes that are intrinsically round (chips, dots, avatars).

---

## 5. Shadow Tokens

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Inputs at rest |
| `shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)` | Cards at rest |
| `shadow-md` | `0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)` | Card hover, dropdown |
| `shadow-lg` | `0 10px 20px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Cmd+K palette overlay |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.04)` | Modal (reserve) |
| `shadow-focus` | `0 0 0 3px rgba(15,118,110,0.2)` | Focus ring for buttons, inputs |
| `shadow-focus-strong` | `0 0 0 3px rgba(15,118,110,0.4)` | Focus ring for high-contrast contexts |

All shadows use neutral black at low alpha. The accent color enters the shadow system only via the focus ring tokens, never as a colored drop shadow on cards (a typical AI-slop pattern).

---

## 6. Motion Tokens

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 150ms | Hover color changes |
| `duration` | 200ms | Default transition, button states |
| `duration-slow` | 350ms | Card lift on hover, modal enter |
| `duration-slower` | 500ms | Pulse dot, ambient feedback only |
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material standard, default for most transitions |
| `easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Card lift, modal enter (more pronounced start) |
| `easing-decel` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `easing-accel` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |

Global rule: all `@keyframes` animations and `transition` declarations are wrapped or queried by `@media (prefers-reduced-motion: reduce)`, collapsing duration to 0.01ms.

Hero typewriter cursor and pulse dot are the only ambient animations. Both must honor reduced motion.

---

## 7. Breakpoint Tokens

| Token | px | Use |
|---|---|---|
| `screen-sm` | 640 | Tailwind `sm:` |
| `screen-md` | 768 | Tailwind `md:`, layout breakpoint (single jump) |
| `screen-lg` | 1024 | Tailwind `lg:`, large container max |
| `screen-xl` | 1280 | Tailwind `xl:`, outer chrome max width |
| `screen-2xl` | 1536 | Tailwind `2xl:`, reserve (unused by default) |

Single layout breakpoint at `md:` matches Phase 1.1 spec. No tablet portrait special-casing.

---

## 8. Container Max-Width Tokens

| Token | px | Use |
|---|---|---|
| `container-body` | 680 | Long-form prose (About, Bio paragraphs) |
| `container-grid` | 1024 | Hero, Now, 3-card grid, featured pub |
| `container-chrome` | 1280 | Top nav, footer |

---

## 9. Z-Index Tokens

| Token | Value | Use |
|---|---|---|
| `z-base` | 0 | Default |
| `z-raised` | 10 | Sticky elements within sections |
| `z-sticky` | 20 | Sticky top nav |
| `z-overlay` | 30 | Backdrop |
| `z-modal` | 40 | Cmd+K palette, modal |
| `z-popover` | 50 | Tooltip, popover |
| `z-toast` | 60 | Notification toast |

---

## 10. Items flagged for owner confirmation

1. **Accent: teal `#0F766E` is the committed default.** Indigo override is documented but not pre-built. If owner wants indigo at scaffold time, swap `--primary` and `--ring`, then regenerate one mockup screenshot for visual check.
2. **Dark mode**: deferred. Document records candidate values but tokens.css.draft does not include the `[data-theme="dark"]` block. Confirm v2 timing before adding.
3. **Korean line-height**: spec sets 1.7 for `[lang="ko"]`. Mockup used 1.7 globally on `.lang-ko`. Confirm if mixed-language paragraphs should pick the lower or higher of the two.
4. **Destructive / success / warning saturation**: chosen subdued at 700 weight. If used on a critical CTA the owner may want brighter. Currently none of the v1 pages use these — they exist for future form validation only.
5. **`shadow-focus` opacity 0.2**: subtle on the warm bg. If accessibility audit (Phase 2.5) flags it as insufficient, swap to `shadow-focus-strong` (0.4) globally.

---

## 11. Merge instructions for downstream phases

**Phase 1.3 (Scaffold owner)**:
1. After running `npx shadcn@latest init`, replace the generated `src/styles/tokens.css` (or `globals.css` shadcn variable block) with the contents of `tokens.css.draft` from this directory. Delete the shadcn-default `--radius: 0.5rem` line if duplicated.
2. Merge `tailwind-extend.draft.cjs` into the `theme.extend` section of `tailwind.config.cjs`. Do not overwrite Tailwind's defaults outside `extend` — the spacing scale extends rather than replaces.
3. Install fonts via:
   ```
   bun add @fontsource/inter @fontsource/jetbrains-mono
   ```
   and add Pretendard via its CDN link in the `<head>` (per mockup line 8):
   ```html
   <link rel="stylesheet" as="style" crossorigin
     href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
   ```
4. Import `tokens.css` once in the root layout, before any component CSS.

**Phase 2.1 (Component build owner)**:
1. Reference tokens by Tailwind utility class only (`bg-primary`, `text-muted-foreground`, `rounded-md`, `shadow-sm`, etc.). Do not hardcode hex values inside components.
2. For the hero typewriter cursor, use `bg-primary` and the `animate-blink` keyframe defined in `tokens.css.draft`. Wrap in `motion-safe:` Tailwind variant.
3. For the section-mark eyebrow element, use `border-primary text-primary` with `text-xs tracking-wide uppercase font-medium`. Matches the mockup `.section-mark` class.
4. Card hover: `transition-shadow duration-slow ease-emphasized hover:shadow-md`. No transform on hover (Phase 1.1 anti-pattern: rotation on hover is mockup-only, not for production).

**Verification (Phase 2.5)**:
1. Run an axe-core audit on the scaffold page using the tokens. Expect 0 contrast failures.
2. Verify focus ring visibility on `bg-background`, `bg-card`, and `bg-muted` surfaces.
3. Verify `prefers-reduced-motion` collapses all transitions in browser devtools.

---

## Appendix A. Token-to-Tailwind class mapping (quick reference)

| Token | Tailwind class |
|---|---|
| `--primary` | `bg-primary`, `text-primary`, `border-primary`, `ring-primary` |
| `--muted-foreground` | `text-muted-foreground` |
| `--card` | `bg-card` |
| `--border` | `border` (default), `border-border` |
| `radius-md` | `rounded-md` |
| `shadow-sm` | `shadow-sm` |
| `duration` | `duration-200` |
| `easing-default` | `ease-[cubic-bezier(0.4,0,0.2,1)]` or custom `ease-default` from extend |
| `space-12` | `py-12`, `px-12`, etc. |

## Appendix B. References

- Mockup baseline: `/Users/gml/_workspace/personal-site/mockup/preview.html` lines 11–52
- Original spec section 11: `/Users/gml/_workspace/personal-site/notes/_archive/2026-05-13-personal-homepage.md` lines 520–650
- Workspace principles: `/Users/gml/.claude/references/design/web-design-principles.md`
- shadcn/ui CSS variable naming: https://ui.shadcn.com/docs/theming
