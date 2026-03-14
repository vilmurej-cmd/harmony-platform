import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        harmony: {
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          rose: "#FB7185",
          violet: "#A78BFA",
          cyan: "#06B6D4",
          emerald: "#34D399",
        },
        deep: "#0F0B1E",
        surface: "#1A1533",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
