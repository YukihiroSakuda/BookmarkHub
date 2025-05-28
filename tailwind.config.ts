import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          DEFAULT: '#0F0F0F',
          lighter: '#1A1A1A',
          light: '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'var(--font-noto-sans-jp)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
