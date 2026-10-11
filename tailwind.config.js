/** @type {import('tailwindcss').Config} */
module.exports = {
  // إبقاء darkMode كـ class، لكن سنفعله دائما في التطبيق
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};