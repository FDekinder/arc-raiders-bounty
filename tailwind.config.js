/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Arc Raiders light color palette inspired by official website
        'arc-cream': {
          DEFAULT: '#ece2d0', // Main background - warm cream
          light: '#f5f0e6',
          dark: '#e0d4bf',
        },
        'arc-beige': {
          DEFAULT: '#d9cdb8', // Card background
          light: '#e6dccb',
          dark: '#c9bbaa',
        },
        'arc-brown': {
          DEFAULT: '#8b7355', // Text and borders
          light: '#a68968',
          dark: '#6e5943',
        },
        'arc-cyan': {
          DEFAULT: '#5fffff', // Bright cyan accent
          light: '#8fffff',
          dark: '#00d4ff',
        },
        'arc-green': {
          DEFAULT: '#046b04ff', // Bright green accent
          light: '#22bc65ff',
          dark: '#016f33ff',
        },
        'arc-yellow': {
          DEFAULT: '#ffea00', // Bright yellow accent
          light: '#fff04d',
          dark: '#ccbb00',
        },
        'arc-red': {
          DEFAULT: '#ff0000', // Bright red accent
          light: '#ff3333',
          dark: '#cc0000',
        },
        'arc-dark': {
          DEFAULT: '#130918', // Dark text
          light: '#2a1f2e',
          lighter: '#4a3f4e',
        },
        'arc-card': {
          DEFAULT: '#ebddc7', // Light card background
          hover: '#ffffff',
          border: '#d9cdb8',
        },
      },
    },
  },
  plugins: [],
}
