import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['var(--font-copy)'],
        title: ['var(--font-title)'],
      },
      fontSize: {
        /** Page / document title — 48px → 56px @ md */
        'display-h1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-h1-md': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        /** Section titles — 28px → 32px @ md */
        'display-h2': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'display-h2-md': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              '--tw-prose-links': 'hsl(var(--primary))',
              '--tw-prose-bold': 'var(--text)',
              fontSize: '1rem',
              lineHeight: '1.7',
              maxWidth: '65ch',
              h1: {
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                fontWeight: '700',
                marginBottom: '0.25em',
              },
              h2: {
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
                lineHeight: '1.25',
                letterSpacing: '-0.02em',
                fontWeight: '700',
                marginTop: '1.75em',
                marginBottom: '0.5em',
              },
              h3: {
                fontFamily: 'var(--font-title)',
                fontSize: '1.25rem',
                lineHeight: '1.35',
                fontWeight: '600',
              },
              h4: {
                fontFamily: 'var(--font-copy)',
                fontSize: '1rem',
                lineHeight: '1.7',
                fontWeight: '400',
              },
              p: {
                fontFamily: 'var(--font-copy)',
                fontWeight: 400,
                marginTop: '0.75em',
                marginBottom: '0.75em',
              },
              blockquote: {
                fontFamily: 'var(--font-copy)',
                fontSize: '1rem',
                lineHeight: '1.6',
                fontWeight: '400',
                fontStyle: 'normal',
              },
              a: {
                color: 'hsl(var(--primary))',
                fontWeight: '500',
                textDecorationLine: 'underline',
                textUnderlineOffset: '0.2em',
              },
              'a:hover': {
                color: 'hsl(var(--primary) / 0.88)',
              },
            },
          ],
        },
        invert: {
          css: {
            '--tw-prose-invert-links': 'hsl(var(--primary))',
            a: {
              color: 'hsl(var(--primary))',
              fontWeight: '500',
            },
            'a:hover': {
              color: 'hsl(var(--primary) / 0.88)',
            },
            blockquote: {
              fontSize: '1rem',
              lineHeight: '1.6',
            },
          },
        },
        base: {
          css: [
            {
              fontSize: '1rem',
              lineHeight: '1.7',
            },
          ],
        },
        md: {
          css: [
            {
              fontSize: '1.125rem',
              lineHeight: '1.625',
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
