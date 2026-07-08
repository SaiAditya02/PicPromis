/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2440',
        'ink-soft': '#2A2620',
        parchment: '#F6F1E7',
        'parchment-deep': '#EDE4D3',
        sindoor: '#B33A3A',
        'sindoor-deep': '#8E2C2C',
        marigold: '#D9A441',
        'marigold-soft': '#F1DCA8',
        sage: '#3F7D58',
        brand: {
          white: '#FFFEFB',
          grey: '#6B6456',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'stamp': 'stamp 1.1s cubic-bezier(.2,.9,.25,1.2) 1',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'counter': 'counter 2s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        stamp: {
          '0%': { transform: 'scale(2.2) rotate(-18deg)', opacity: '0' },
          '55%': { transform: 'scale(0.94) rotate(4deg)', opacity: '1' },
          '75%': { transform: 'scale(1.04) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(-8deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        counter: {
          '0%': { '--num': '0' },
          '100%': { '--num': 'var(--target)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(179, 58, 58, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(179, 58, 58, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
