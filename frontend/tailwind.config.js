/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          teal: '#0D9488',
          dark: '#115E59',
          light: '#14B8A6',
        },
        secondary: {
          sage: '#84CC16',
          warm: '#F59E0B',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          600: '#475569',
          800: '#1E293B',
        },
        accent: {
          rose: '#E11D48',
          sky: '#0EA5E9',
          emerald: '#059669',
        },
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
};
