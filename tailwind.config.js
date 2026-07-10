/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080b",
          900: "#0b0d12",
          850: "#0f1219",
          800: "#141824",
          700: "#1c2233",
          600: "#273044",
        },
        gold: {
          300: "#f3ddab",
          400: "#e8c97e",
          500: "#d9b25c",
          600: "#c19a3f",
          700: "#9a7930",
        },
        bronze: "#a8783f",
        amber: {
          glow: "#ffb84d",
        },
        midnight: "#101828",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 24px rgba(217,178,92,0.18)",
        "gold-glow-lg": "0 0 60px rgba(217,178,92,0.22)",
        card: "0 8px 32px rgba(0,0,0,0.45)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217,178,92,0.35)" },
          "50%": { boxShadow: "0 0 0 8px rgba(217,178,92,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        beam: {
          "0%": { left: "0%", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        beamBack: {
          "0%": { right: "0%", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { right: "100%", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "pulse-gold": "pulseGold 2.2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        typing: "typing 1.2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        beam: "beam 1.9s linear infinite",
        "beam-back": "beamBack 1.9s linear infinite",
      },
    },
  },
  plugins: [],
};
