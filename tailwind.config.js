/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', // Adjust this path to match where your components are located
  './components/**/*.{js,ts,jsx,tsx}', // Adjust this path as needed
  './node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}' // Ensure Tremor's components are included
],
  theme: {
    extend: {},
  },
  plugins: [],
}

