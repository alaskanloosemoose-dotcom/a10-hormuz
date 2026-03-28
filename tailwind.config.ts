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
        // Retro VGA palette
        "vga-green": "#00FF00",
        "vga-dim-green": "#008F00",
        "vga-bg": "#000000",
        "hud-green": "#39FF14",
        "hud-dim": "#1A8005",
      },
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
