import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#03142f",
          900: "#071b3f",
          850: "#09234f",
          800: "#0d2f66"
        },
        bridge: {
          blue: "#034694",
          gold: "#d6b15d",
          cyan: "#21c7d9",
          green: "#37d489"
        }
      },
      boxShadow: {
        fintech: "0 24px 80px rgba(1, 15, 40, 0.38)"
      }
    }
  },
  plugins: []
};

export default config;
