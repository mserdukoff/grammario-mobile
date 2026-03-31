import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./theme/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        surface1: "var(--color-surface1)",
        surface2: "var(--color-surface2)",
        surface3: "var(--color-surface3)",
        success: {
          DEFAULT: "var(--color-success)",
          light: "var(--color-success-light)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          light: "var(--color-error-light)",
        },
      },
      fontFamily: {
        body: ["PlusJakartaSans"],
        heading: ["InstrumentSerif"],
        mono: ["JetBrainsMono"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
