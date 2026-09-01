/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          linked: '#3b82f6',
          unlinked: '#f59e0b',
          rest: '#10b981',
          conflict: '#ef4444',
          hub: '#8b5cf6',
          standby: '#10b981',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        duty: {
          linked: {
            bg: "hsl(var(--duty-linked-bg))",
            border: "hsl(var(--duty-linked-border))",
            text: "hsl(var(--duty-linked-text))",
          },
          unlinked: {
            bg: "hsl(var(--duty-unlinked-bg))",
            border: "hsl(var(--duty-unlinked-border))",
            text: "hsl(var(--duty-unlinked-text))",
          },
        },
        rest: {
          valid: {
            bg: "hsl(var(--rest-valid-bg))",
            text: "hsl(var(--rest-valid-text))",
          },
          violation: {
            bg: "hsl(var(--rest-violation-bg))",
            text: "hsl(var(--rest-violation-text))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'popover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        'glow-blue': '0 0 20px -5px rgba(37, 99, 235, 0.3)',
        'glow-amber': '0 0 20px -5px rgba(217, 119, 6, 0.3)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
