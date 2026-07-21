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
        neo: {
          ink: "var(--neo-ink)",
          "ink-muted": "var(--neo-ink-muted)",
          paper: "var(--neo-paper)",
          canvas: "var(--neo-canvas)",
          white: "var(--neo-white)",
          primary: "var(--neo-primary)",
          "primary-strong": "var(--neo-primary-strong)",
          action: "var(--neo-action)",
          yellow: "var(--neo-yellow)",
          mint: "var(--neo-mint)",
          coral: "var(--neo-coral)",
          sky: "var(--neo-sky)",
          success: "var(--neo-success)",
          warning: "var(--neo-warning)",
          danger: "var(--neo-danger)"
        },
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
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        "neo-body": ["var(--font-neo-body)", "ui-sans-serif", "system-ui"],
        "neo-display": ["var(--font-neo-display)", "ui-sans-serif", "system-ui"]
      },
      fontWeight: {
        neo: "800",
        "neo-heavy": "900"
      },
      letterSpacing: {
        neo: "-0.025em",
        "neo-wide": "0.08em"
      },
      borderColor: {
        neo: "var(--neo-border-color)"
      },
      borderWidth: {
        neo: "var(--neo-border-width)",
        "neo-strong": "var(--neo-border-width-strong)"
      },
      borderRadius: {
        "neo-none": "var(--neo-radius-none)",
        "neo-sm": "var(--neo-radius-sm)",
        neo: "var(--neo-radius)",
        "neo-lg": "var(--neo-radius-lg)",
        "neo-pill": "var(--neo-radius-pill)"
      },
      boxShadow: {
        "neo-xs": "var(--neo-shadow-xs)",
        "neo-sm": "var(--neo-shadow-sm)",
        neo: "var(--neo-shadow)",
        "neo-lg": "var(--neo-shadow-lg)",
        "neo-xl": "var(--neo-shadow-xl)",
        "neo-pressed": "var(--neo-shadow-pressed)",
        "neo-focus": "var(--neo-focus-ring)",
        "glow-blue": "0 18px 54px rgba(14, 116, 144, 0.12)",
        "glow-orange": "0 18px 48px rgba(180, 83, 9, 0.12)",
        "glow-coral": "0 18px 48px rgba(190, 18, 60, 0.1)",
        "glow-green": "0 18px 46px rgba(4, 120, 87, 0.1)"
      },
      outlineColor: {
        neo: "var(--neo-ink)"
      },
      outlineWidth: {
        neo: "3px"
      },
      transitionDuration: {
        "neo-fast": "var(--neo-duration-fast)",
        neo: "var(--neo-duration)",
        "neo-slow": "var(--neo-duration-slow)"
      },
      transitionTimingFunction: {
        "neo-out": "var(--neo-ease-out)",
        "neo-in": "var(--neo-ease-in)"
      },
      backgroundImage: {
        "neo-grid":
          "linear-gradient(var(--neo-ink) 1px, transparent 1px), linear-gradient(90deg, var(--neo-ink) 1px, transparent 1px)"
      },
      backgroundSize: {
        "neo-grid": "32px 32px"
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
