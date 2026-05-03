/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pixel: {
          bg: '#0d0c22',
          panel: '#161530',
          panelHover: '#14103A',
          border: '#1E1A4A',
          primary: '#1400AC',
          primaryStart: '#1400AC',
          primaryEnd: '#2563EB',
          accent: '#60A5FA',
          textBlue: '#60A5FA',   /* Azul vibrante, alejándonos del tono morado */
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #1400AC 0deg, #4D00FF 180deg, #7B2FFF 360deg)',
      }
    }
  },
  plugins: [],
};
