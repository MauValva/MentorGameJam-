import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16241f",
        moss: "#79b89a",
        paper: "#0b1110",
        sun: "#eab95e",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, .28)",
      },
    },
  },
  plugins: [],
};

export default config;
