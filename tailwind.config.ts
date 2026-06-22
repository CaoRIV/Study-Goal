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
          cyan: "#0891B2",
          bright: "#06B6D4",
          orange: "#F97316",
          paper: "#F9FAFB",
          coral: "#FB7185",
          "coral-soft": "#FECACA",
          green: "#10B981",
          cream: "#FFFBEB",
          "deep-red": "#991B1B"
        },
        surface: {
          canvas: "#F9FAFB",
          panel: "#FFFFFF",
          warm: "#FFFBEB",
          coral: "#FDE8E8",
          cyan: "#DDEFF2"
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#334155",
          subtle: "#475569"
        },
        signal: {
          cyan: "#0E7490",
          orange: "#C2410C",
          green: "#047857",
          red: "#B91C1C"
        },
        outline: "#C9E2E7",
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
        "glow-blue": "0 0 60px rgba(6, 182, 212, 0.22)",
        "glow-orange": "0 0 52px rgba(249, 115, 22, 0.2)",
        "glow-coral": "0 0 52px rgba(251, 113, 133, 0.18)",
        "glow-green": "0 0 48px rgba(16, 185, 129, 0.18)"
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
