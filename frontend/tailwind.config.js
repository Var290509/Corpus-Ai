/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          DEFAULT: '#6F4E37',
          50: '#FBF9F7',
          100: '#F4ECE6',
          200: '#E6D4C6',
          300: '#D2B49D',
          400: '#A77D5E',
          500: '#8A5F40',
          600: '#6F4E37',
          700: '#5A3D29',
          800: '#462E1E',
          900: '#322014',
        },
        platinum: {
          DEFAULT: '#E5E4E2',
          50: '#FAFAFA',
          100: '#F4F4F3',
          200: '#E5E4E2',
          300: '#D5D3CF',
          400: '#B8B5AE',
          500: '#9B978F',
          600: '#7E7A72',
          700: '#5F5C56',
          800: '#403E3A',
          900: '#22211F',
        },
        lavender: {
          DEFAULT: '#E6E0F0',
          50: '#FAF9FD',
          100: '#F4F1FA',
          200: '#E6E0F0',
          300: '#D4C8E4',
          400: '#BCABD4',
          500: '#9E88BE',
          600: '#8169A3',
          700: '#64517E',
          800: '#473A5A',
          900: '#2C2337',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(111, 78, 55, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(111, 78, 55, 0.14)',
        'glass-subtle': '0 4px 20px 0 rgba(111, 78, 55, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
