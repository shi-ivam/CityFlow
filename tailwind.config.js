/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        slate: {
          850: '#111827',
          900: '#0f172a',
          950: '#070b14',
        },
        accent: {
          linked: '#38bdf8',     // Sky/Blue for Linked duty
          unlinked: '#f59e0b',   // Amber for Unlinked duty
          rest: '#10b981',       // Emerald for Rest compliance
          conflict: '#f43f5e',   // Rose/Crimson for Violations
          hub: '#a855f7',        // Purple for Interchange Hub
          standby: '#34d399',    // Mint for Standby pool
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-sky': '0 0 25px -5px rgba(56, 189, 248, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.3)',
      }
    },
  },
  plugins: [],
}
