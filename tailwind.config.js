/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glow: '0 18px 60px rgba(15, 23, 42, 0.18)',
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.72' },
        },
      },
    },
  },
  plugins: [],
};
