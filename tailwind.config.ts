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
        vibe: {
          tourist: "#F59E0B", // Energetic Amber/Yellow
          local: "#3B82F6",   // Calm Blue
          darkBg: "#0F172A",  // Deep slate for local mode
          lightBg: "#F8FAFC", // Crisp white for tourist mode
        }
      }
    },
  },
  plugins: [],
};
export default config;