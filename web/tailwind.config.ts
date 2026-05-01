import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#08090A",
        surface: "#1A1C1E",
        "surface-hover": "#2C2F33",
        "surface-low": "#0C0E10",
        terminal: "#000000",
        hairline: "#333333",
        ink: "#E2E2E5",
        gray2: "#A0A0A0",
        gray3: "#6B6B6B",
        volt: "#B8EF43",
        "volt-dim": "#A2D72B",
        cyan: "#00FFFF",
        magenta: "#FF00FF",
        amber: "#FFBF00",
        "amber-dim": "#CC9900",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        label: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        code: ["var(--font-fira-code)", "Fira Code", "monospace"],
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "code-sm": ["14px", { lineHeight: "1.5", fontWeight: "450" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      keyframes: {
        "log-in": {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "log-in": "log-in 120ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
