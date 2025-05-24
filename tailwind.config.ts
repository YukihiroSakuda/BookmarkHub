import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'var(--font-noto-sans-jp)'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'neon': {
          purple: '#B026FF',
          green: '#00FF9D',
          pink: '#FF2E63',
        },
        'dark': {
          DEFAULT: '#0F0F0F',
          lighter: '#1A1A1A',
          light: '#2A2A2A',
        },
        'energy': {
          purple: '#B026FF',
          green: '#00E68C',
          pink: '#FF2E63',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-energy': 'linear-gradient(135deg, #B026FF, #FF2E63)',
        'gradient-energy-purple': 'linear-gradient(135deg, #B026FF, #FF2E63)',
        'gradient-energy-green': 'linear-gradient(135deg, #B026FF, #FF2E63)',
        'gradient-energy-pink': 'linear-gradient(135deg, #FF2E63, #B026FF)',
        'gradient-dark': 'linear-gradient(180deg, #0F0F0F, #1A1A1A)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.energy.purple), 0 0 20px theme(colors.energy.purple)',
        'neon-green': '0 0 5px theme(colors.energy.green), 0 0 20px theme(colors.energy.green)',
        'neon-pink': '0 0 5px theme(colors.energy.pink), 0 0 20px theme(colors.energy.pink)',
      }
    },
  },
  plugins: [],
} satisfies Config;
