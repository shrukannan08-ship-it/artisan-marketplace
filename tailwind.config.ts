import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#FAF7F2",
          surface: "#FFFFFF",
          terracotta: "#C86D51",
          "terracotta-dark": "#B2573C",
          "terracotta-light": "#F7ECE8",
          blush: "#F6ECE6",
          rose: "#DFB0A5",
          sage: "#5E8773",
          "sage-dark": "#4A6E5D",
          "sage-light": "#E9F1ED",
          clay: "#EADCD2",
          sand: "#F3ECE2",
          gold: "#DDA74F",
          charcoal: "#28231F",
          stone: "#6E6660",
          border: "#EBE3DA",
          lavender: "#B8B9E0",
          "lavender-light": "#F0F0FA",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(180, 140, 120, 0.08)",
        card: "0 8px 30px -4px rgba(60, 40, 30, 0.06)",
        clay: "0 10px 25px -5px rgba(200, 109, 81, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        subtle: "0 2px 10px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 40px -15px rgba(40, 35, 31, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
