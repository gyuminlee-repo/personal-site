/* ============================================================================
 * Personal Site — Tailwind theme.extend (Phase 1.2 draft)
 *
 * Status:  draft for merge into tailwind.config.cjs after Phase 1.3 scaffold
 * Source:  /Users/gml/_workspace/personal-site/notes/design/tokens-spec.md
 * Pair:    /Users/gml/_workspace/personal-site/notes/design/tokens.css.draft
 * Updated: 2026-05-24
 *
 * Usage:
 *   // tailwind.config.cjs
 *   const themeExtend = require('./notes/design/tailwind-extend.draft.cjs');
 *   module.exports = {
 *     darkMode: ['class', '[data-theme="dark"]'],
 *     content: ['./src/**\/*.{astro,html,js,ts,jsx,tsx,svelte,vue}'],
 *     theme: {
 *       extend: themeExtend,
 *     },
 *     plugins: [require('tailwindcss-animate')],
 *   };
 *
 * Or copy the object literal directly into theme.extend.
 *
 * All color values reference CSS variables defined in tokens.css.draft,
 * so the source of truth stays in one place (the CSS file) and Tailwind
 * just exposes utility class shortcuts.
 * ========================================================================== */

module.exports = {
  /* --------------------------------------------------------------------
   * Color — shadcn/ui naming. Uses hsl(var(--token)) so Tailwind alpha
   * modifiers (bg-primary/50) work correctly.
   * ------------------------------------------------------------------ */
  colors: {
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    },
    muted: {
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    },
    success: {
      DEFAULT: 'hsl(var(--success))',
      foreground: 'hsl(var(--success-foreground))',
    },
    warning: {
      DEFAULT: 'hsl(var(--warning))',
      foreground: 'hsl(var(--warning-foreground))',
    },
    card: {
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    },
    popover: {
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))',
    },
  },

  /* --------------------------------------------------------------------
   * Font family — references CSS variables so the stack is set once.
   * Pretendard is loaded via CDN link in <head>; Inter and JetBrains
   * Mono via @fontsource packages imported in the root layout.
   * ------------------------------------------------------------------ */
  fontFamily: {
    sans: ['var(--font-sans)'],
    'sans-kr': ['var(--font-sans-kr)'],
    mono: ['var(--font-mono)'],
  },

  /* --------------------------------------------------------------------
   * Font size — explicit rem values to lock the scale.
   * (Tailwind defaults are close but not identical to this spec.)
   * Each entry is [fontSize, { lineHeight, letterSpacing }].
   * ------------------------------------------------------------------ */
  fontSize: {
    xs:   ['0.75rem',  { lineHeight: '1rem' }],
    sm:   ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem',     { lineHeight: '1.6' }],          // 1.6 EN body
    lg:   ['1.125rem', { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',  { lineHeight: '1.3' }],          // H3
    '2xl':['1.5rem',   { lineHeight: '1.25' }],          // H2 mobile
    '3xl':['1.875rem', { lineHeight: '1.25' }],          // H2 desktop
    '4xl':['2.25rem',  { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
    '5xl':['3rem',     { lineHeight: '1.15', letterSpacing: '-0.02em' }],   // H1 desktop
    '6xl':['3.75rem',  { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
    '7xl':['4.5rem',   { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
  },

  /* --------------------------------------------------------------------
   * Spacing — extends (does NOT replace) Tailwind defaults.
   * Tailwind already provides 0–96 on the same 4px scale; we only add
   * the larger reserve values used for hero / major-section vertical.
   * ------------------------------------------------------------------ */
  spacing: {
    128: '32rem',   // 512px
    144: '36rem',   // 576px
    160: '40rem',   // 640px
  },

  /* --------------------------------------------------------------------
   * Container max-widths — used by max-w-body etc.
   * ------------------------------------------------------------------ */
  maxWidth: {
    body:    'var(--container-body)',    // 680px
    grid:    'var(--container-grid)',    // 1024px
    chrome:  'var(--container-chrome)',  // 1280px
  },

  /* --------------------------------------------------------------------
   * Border radius — references --radius so a single change at the CSS
   * variable propagates. Matches shadcn/ui convention.
   * ------------------------------------------------------------------ */
  borderRadius: {
    none: '0',
    sm:   'calc(var(--radius) - 4px)',   // 4px
    DEFAULT: 'var(--radius)',             // 8px component default
    md:   'calc(var(--radius) + 2px)',   // 10px card general
    lg:   'calc(var(--radius) + 4px)',   // 12px hero card max
    xl:   'calc(var(--radius) + 8px)',   // 16px modal/palette
    full: '9999px',
  },

  /* --------------------------------------------------------------------
   * Box shadow — references CSS variables.
   * ------------------------------------------------------------------ */
  boxShadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    DEFAULT: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    focus: 'var(--shadow-focus)',
    'focus-strong': 'var(--shadow-focus-strong)',
    none: 'none',
  },

  /* --------------------------------------------------------------------
   * Transition duration.
   * ------------------------------------------------------------------ */
  transitionDuration: {
    fast:   'var(--duration-fast)',     // 150ms
    DEFAULT:'var(--duration)',           // 200ms
    slow:   'var(--duration-slow)',     // 350ms
    slower: 'var(--duration-slower)',   // 500ms
  },

  /* --------------------------------------------------------------------
   * Transition timing function (easings).
   * ------------------------------------------------------------------ */
  transitionTimingFunction: {
    DEFAULT:     'var(--ease-default)',
    emphasized:  'var(--ease-emphasized)',
    decel:       'var(--ease-decel)',
    accel:       'var(--ease-accel)',
  },

  /* --------------------------------------------------------------------
   * Letter spacing — extends Tailwind defaults.
   * ------------------------------------------------------------------ */
  letterSpacing: {
    tighter: '-0.025em',
    tight:   '-0.02em',
    normal:  '0',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },

  /* --------------------------------------------------------------------
   * Z-index tokens.
   * ------------------------------------------------------------------ */
  zIndex: {
    base:    'var(--z-base)',
    raised:  'var(--z-raised)',
    sticky:  'var(--z-sticky)',
    overlay: 'var(--z-overlay)',
    modal:   'var(--z-modal)',
    popover: 'var(--z-popover)',
    toast:   'var(--z-toast)',
  },

  /* --------------------------------------------------------------------
   * Keyframes + animation utilities for hero ambient motion.
   * Apply via motion-safe:animate-blink or motion-safe:animate-pulse-dot.
   * ------------------------------------------------------------------ */
  keyframes: {
    blink: {
      '50%': { opacity: '0' },
    },
    'pulse-dot': {
      '0%':   { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.5)' },
      '70%':  { boxShadow: '0 0 0 8px rgb(16 185 129 / 0)' },
      '100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0)' },
    },
  },
  animation: {
    blink:       'blink 1s steps(2, start) infinite',
    'pulse-dot': 'pulse-dot 2s ease-out infinite',
  },
};
