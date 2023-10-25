/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          3: '#5DB075',
          4: '#379255',
          5: '#277441',
        },
        gray: {
          1: '#F6F6F6',
          2: '#E8E8E8',
          3: '#BDBDBD',
        },
      },
      fontSize: {
        title: ['30px', { fontWeight: 600 }],
      },
      boxShadow: {
        outline: 'inset 0px 0px 0px 2px #5DB075',
      },
    },
  },
  plugins: [],
}
