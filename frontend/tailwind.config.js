/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f2f7f4',
          100: '#e0ede5',
          200: '#c2dccb',
          300: '#96c2a5',
          400: '#64a37d',
          500: '#3d8459',
          600: '#2f6a47',
          700: '#275539',
          800: '#22432e',
          900: '#1d3827',
          950: '#0f2017',
        },
        sand: {
          50:  '#faf8f3',
          100: '#f4f1e8',
          200: '#e8e0ce',
          300: '#d9c9a8',
          400: '#c9ad7e',
          500: '#bd9660',
          600: '#ae8050',
          700: '#916843',
          800: '#75543a',
          900: '#604531',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft':  '0 4px 24px rgba(0,0,0,0.06)',
        'card':  '0 8px 32px rgba(0,0,0,0.08)',
        'lifted':'0 16px 48px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
