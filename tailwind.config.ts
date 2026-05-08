import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        ocean: "#0b7285",
        mint: "#2dd4bf",
        amber: "#f5b642",
        rose: "#f43f5e"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(8, 17, 31, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
