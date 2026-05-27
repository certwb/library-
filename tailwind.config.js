/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151519",
        graphite: "#3B3B44",
        porcelain: "#F7F8FB",
        line: "#E7E9EF",
        moss: "#2F6F5E",
        iris: "#6266F1",
        coral: "#E86161",
        honey: "#F1B84B",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(21, 21, 25, 0.10)",
        card: "0 16px 42px rgba(21, 21, 25, 0.09)",
        lift: "0 22px 64px rgba(21, 21, 25, 0.14)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.78)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
    },
  },
  plugins: [],
};
