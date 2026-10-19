/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          navy: '#1E3A8A',
          blue: '#2563EB',
          indigo: '#4338CA',
          teal: '#0D9488',
          'teal-light': '#F0FDFA',
          'teal-dark': '#0F766E',
          light: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          dark: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        'popup': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'marquee-rtl': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
      animation: {
        'marquee-rtl': 'marquee-rtl 35s linear infinite',
      },
    },
  },
  plugins: [],
}
