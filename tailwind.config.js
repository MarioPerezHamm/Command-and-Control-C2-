/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hmi: {
          bg:           "#0d0f14",
          surface:      "#141720",
          card:         "#1a1e2a",
          'card-hover': "#1f2436",
          border:       "#252a38",
          'border-alt': "#2e3548",
          blue:         "#0ea5e9",
          'blue-dim':   "#0284c7",
          'blue-faint': "#0c2340",
          cyan:         "#06b6d4",
          'cyan-faint': "#082832",
          green:        "#22c55e",
          'green-faint':"#0a2318",
          amber:        "#f59e0b",
          'amber-faint':"#2a1a00",
          red:          "#ef4444",
          'red-faint':  "#2a0a0a",
          muted:        "#4b5568",
          subtle:       "#6b7280",
          text:         "#e2e8f0",
          'text-dim':   "#94a3b8",
          'text-muted': "#64748b",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,42,56,0.8)',
        'card-blue':'0 0 0 1px rgba(14,165,233,0.3), 0 4px 16px rgba(14,165,233,0.08)',
        'blue-glow':'0 0 12px rgba(14,165,233,0.4)',
        'green-glow':'0 0 10px rgba(34,197,94,0.5)',
        'amber-glow':'0 0 10px rgba(245,158,11,0.5)',
        'red-glow':  '0 0 10px rgba(239,68,68,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        blink:        'blink 1s step-end infinite',
        fadeIn:       'fadeIn 0.2s ease-out',
      },
      keyframes: {
        blink:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}


