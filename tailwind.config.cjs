/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        'sans-kr': ['var(--font-sans-kr)'],
        mono: ['var(--font-mono)']
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.6' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.3' }],
        '2xl':['1.5rem',   { lineHeight: '1.25' }],
        '3xl':['1.875rem', { lineHeight: '1.25' }],
        '4xl':['2.25rem',  { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        '5xl':['3rem',     { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '6xl':['3.75rem',  { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
        '7xl':['4.5rem',   { lineHeight: '1.1',  letterSpacing: '-0.025em' }]
      },
      spacing: {
        128: '32rem',
        144: '36rem',
        160: '40rem'
      },
      maxWidth: {
        body:   'var(--container-body)',
        grid:   'var(--container-grid)',
        chrome: 'var(--container-chrome)'
      },
      borderRadius: {
        none: '0',
        sm:   'calc(var(--radius) - 4px)',
        DEFAULT: 'var(--radius)',
        md:   'calc(var(--radius) + 2px)',
        lg:   'calc(var(--radius) + 4px)',
        xl:   'calc(var(--radius) + 8px)',
        full: '9999px'
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
        'focus-strong': 'var(--shadow-focus-strong)',
        none: 'none'
      },
      transitionDuration: {
        fast:    'var(--duration-fast)',
        DEFAULT: 'var(--duration)',
        slow:    'var(--duration-slow)',
        slower:  'var(--duration-slower)'
      },
      transitionTimingFunction: {
        DEFAULT:    'var(--ease-default)',
        emphasized: 'var(--ease-emphasized)',
        decel:      'var(--ease-decel)',
        accel:      'var(--ease-accel)'
      },
      letterSpacing: {
        tighter: '-0.025em',
        tight:   '-0.02em',
        normal:  '0',
        wide:    '0.025em',
        wider:   '0.05em',
        widest:  '0.1em'
      },
      zIndex: {
        base:    'var(--z-base)',
        raised:  'var(--z-raised)',
        sticky:  'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal:   'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast:   'var(--z-toast)'
      },
      keyframes: {
        blink: { '50%': { opacity: '0' } },
        'pulse-dot': {
          '0%':   { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.5)' },
          '70%':  { boxShadow: '0 0 0 8px rgb(16 185 129 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0)' }
        }
      },
      animation: {
        blink:       'blink 1s steps(2, start) infinite',
        'pulse-dot': 'pulse-dot 2s ease-out infinite'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
