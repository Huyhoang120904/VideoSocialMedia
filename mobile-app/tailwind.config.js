/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./src/Components/**/*.{js,jsx,ts,tsx}",
    "./src/Navigation/**/*.{js,jsx,ts,tsx}",
    "./src/Srceens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class",
};
