import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#292135",
        moss: "#fa902d",
        paper: "#0b0913",
        sun: "#f1b84b",
        surface: "#191525",
        elevated: "#292135",
        border: "#49364f",
        coral: "#ec5263",
        purple: "#a33c98",
        blue: "#536bc0",
        success: "#42c783",
        danger: "#ef6670",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, .28)",
      },
    },
  },
  plugins: [],
};

export default config;
