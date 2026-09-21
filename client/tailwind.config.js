/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        typewriter: ['"Courier Prime"', 'monospace'],
        caveat: ['"Caveat"', 'cursive'],
        dancing: ['"Dancing Script"', 'cursive'],
        patrick: ['"Patrick Hand"', 'cursive'],
        sacramento: ['"Sacramento"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#fcf8f0',
          200: '#f7f1e3',
          300: '#efe5ce',
          400: '#e5d3b0',
          500: '#d5bd8e',
          900: '#3e2e1e',
        },
        postal: {
          dark: '#090d16',       /* Deep Dark Obsidian for Night Mode */
          wood: '#0f172a',       /* Dark Slate Mahogany */
          mahogany: '#1e1b4b',   /* Deep Indigo Dark */
          navy: '#1e293b',       /* Dark Slate Navy */
          teal: '#0f766e',
          brass: '#f59e0b',
          gold: '#d97706',
          waxRed: '#dc2626',
          waxGold: '#d97706',
          waxViolet: '#7c3aed',
          waxEmerald: '#059669',
        },
        ink: {
          sepia: '#5B4031',
          midnight: '#1E293B',
          fountainBlue: '#0369A1',
          crimson: '#9F1239',
          emerald: '#065F46',
          charcoal: '#334155',
        }
      },
      boxShadow: {
        'envelope': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'letter': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 0, 0, 0.2)',
        'wax': '0 4px 10px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
      },
      backgroundImage: {
        'airmail-pattern': "repeating-linear-gradient(135deg, #dc2626 0 12px, #ffffff 12px 24px, #2563eb 24px 36px, #ffffff 36px 48px)",
      }
    },
  },
  plugins: [],
}
