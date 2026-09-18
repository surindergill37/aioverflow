/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        subtle: "#64748b",
        line: "#e5e7eb",
        surface: "#ffffff",
        canvas: "#fafafa",
        accent: "#2563eb",
        aiTag: "#0d9488",
        humanTag: "#7c3aed",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
