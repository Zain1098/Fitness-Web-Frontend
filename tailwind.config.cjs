module.exports = {
  content: [
    './index.html',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'canopy-x': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'canopy-y': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
      },
      animation: {
        'canopy-horizontal': 'canopy-x var(--duration) infinite linear',
        'canopy-vertical': 'canopy-y var(--duration) infinite linear',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}