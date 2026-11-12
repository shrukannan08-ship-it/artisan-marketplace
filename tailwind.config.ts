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
          // Soft Tactile Palette (from reference design)
          peach: "#F3A894",
          "peach-dark": "#E08A74",
          "peach-light": "#FDF0EC",
          butter: "#FCE69E",
          "butter-dark": "#EBC766",
          "butter-light": "#FFF9E6",
          mint: "#BDE2D5",
          "mint-dark": "#98CBB9",
          "mint-light": "#EFF8F4",
          sky: "#C0DDF2",
          "sky-dark": "#99C7E8",
          "sky-light": "#F0F7FC",
          lilac: "#DDD4EC",
          "lilac-dark": "#BFB0DD",
          "lilac-light": "#F7F4FB",
          bisque: "#F5EBE4",
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
        clay: "0 10px 25px -5px rgba(200, 109, 81, 0.18), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        subtle: "0 2px 10px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 40px -15px rgba(40, 35, 31, 0.08)",
        // Advanced Tactile / Claymorphic Shadows
        "clay-card":
          "0 14px 34px -4px rgba(185, 138, 118, 0.16), 0 2px 6px 0 rgba(0, 0, 0, 0.02), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95)",
        "clay-card-hover":
          "0 22px 46px -4px rgba(185, 138, 118, 0.22), 0 4px 10px 0 rgba(0, 0, 0, 0.03), inset 0 1px 1.5px 0 rgba(255, 255, 255, 1)",
        "clay-pill":
          "0 5px 16px -2px rgba(190, 125, 105, 0.2), inset 0 1px 1.5px rgba(255, 255, 255, 0.85), inset 0 -1.5px 2px rgba(0, 0, 0, 0.04)",
        "clay-circle":
          "0 6px 18px -2px rgba(180, 130, 110, 0.2), inset 0 1.5px 2px rgba(255, 255, 255, 0.9), inset 0 -1.5px 2px rgba(0, 0, 0, 0.04)",
        "clay-inset":
          "inset 0 2px 5px rgba(110, 85, 75, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
