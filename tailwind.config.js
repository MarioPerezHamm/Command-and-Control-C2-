/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg:            "#000000",
          panel:         "#050505",
          border:        "#0d1f0d",
          'border-bright': "#1a3a1a",
          green:         "#00ff41",
          'green-dim':   "#00c132",
          'green-muted': "#004d15",
          'green-faint': "#001a07",
          amber:         "#ffaa00",
          red:           "#ff3333",
          gray:          "#2a2a2a",
          'gray-mid':    "#444444",
          'gray-light':  "#888888",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow:      '0 0 10px rgba(0,255,65,0.45)',
        'glow-lg': '0 0 24px rgba(0,255,65,0.2)',
        'glow-sm': '0 0 5px rgba(0,255,65,0.35)',
        'glow-red':'0 0 8px rgba(255,51,51,0.5)',
      },
      animation: {
        blink:  'blink 1s step-end infinite',
        fadeIn: 'fadeIn 0.25s ease-in',
        ping:   'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        blink:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}


