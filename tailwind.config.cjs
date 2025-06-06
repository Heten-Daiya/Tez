module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  safelist: [
    // Safelist all the color variations used in the footer button
    { pattern: /from-(indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|rose|pink|fuchsia|purple|violet|slate|gray|zinc|neutral|stone)-[4-9]00/ },
    { pattern: /to-(indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|rose|pink|fuchsia|purple|violet|slate|gray|zinc|neutral|stone)-[6-9]00/ },
    { pattern: /shadow-(indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|rose|pink|fuchsia|purple|violet|slate|gray|zinc|neutral|stone)-900/ },
  ],
};