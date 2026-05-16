import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101419",
        charcoal: "#455561",
        muted: "#5c6672",
        tangerine: "#ff7d37",
        laser: "#0760d5",
        panel: "#161c26",
        "panel-hover": "#1e2736",
        floral: "#FFFDF5",
      },
    },
  },
  plugins: [],
};

export default config;
