/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgba(44, 71, 63, 0.20)',
          300: '#486B63',
          500: '#2C473F',
        },
        accent: {
          200: '#FFBF7A',
          400: '#F28C28',
        },
        'bg-light': '#F6F8F7',
        'bg-dark': '#1A1A1A',
        fg: {
          DEFAULT: '#1A1A1A',
          invert: '#FFFFFF',
        },
        // 기존 색상들 (호환성 유지)
        neutral: {
          600: '#4B5563',
          800: '#161B22',
          900: '#0D1117',
        },
        foreground: {
          DEFAULT: '#F1F5F9',
          muted: '#9CA3AF',
        },
      },
      fontFamily: {
        'retro': ['Courier New', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'dashBlink': 'dashBlink 1s infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 
            'box-shadow': '0 0 5px #F28C28, 0 0 10px #F28C28, 0 0 15px #F28C28',
          },
          '100%': { 
            'box-shadow': '0 0 10px #F28C28, 0 0 20px #F28C28, 0 0 30px #F28C28',
          },
        },
        dashBlink: {
          '0%': { 
            'border-color': '#F28C28',
            'opacity': '1',
          },
          '100%': { 
            'border-color': '#F28C28',
            'opacity': '0.6',
          },
        },
      },
      minHeight: {
        'desktop': '768px',
      },
      minWidth: {
        'desktop': '1366px',
      },
    },
  },
  plugins: [],
} 