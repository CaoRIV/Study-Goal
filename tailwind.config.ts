import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F172A",
          cyan: "#0E7490",
          bright: "#0891B2",
          orange: "#D97706",
          paper: "#F9FAFB",
          coral: "#E11D48",
          "coral-soft": "#FFE4E6",
          green: "#059669",
          cream: "#F8FAFC",
          "deep-red": "#9F1239"
        },
        surface: {
          canvas: "#F9FAFB",
          panel: "#FFFFFF",
          warm: "#F8FAFC",
          coral: "#FFF1F2",
          cyan: "#EAF6F8"
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#334155",
          subtle: "#475569"
        },
        signal: {
          cyan: "#0E7490",
          orange: "#B45309",
          green: "#047857",
          red: "#BE123C"
        },
        outline: "#D7E5EA",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        "glow-blue": "0 18px 54px rgba(14, 116, 144, 0.12)",
        "glow-orange": "0 18px 48px rgba(180, 83, 9, 0.12)",
        "glow-coral": "0 18px 48px rgba(190, 18, 60, 0.1)",
        "glow-green": "0 18px 46px rgba(4, 120, 87, 0.1)"
      },
      animation: {
        "marquee-slow": "marquee 32s linear infinite",
        float: "float 7s ease-in-out infinite"
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
