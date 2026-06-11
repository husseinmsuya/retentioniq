import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#123A70",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#4F46E5",
          foreground: "#ffffff"
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#042f2e"
        }
      },
      boxShadow: {
        enterprise: "0 18px 55px rgba(15, 23, 42, 0.10)",
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
