/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A",
          50: "#EFFCF3",
          100: "#D8F6E0",
          200: "#B4EDC6",
          300: "#82DFA3",
          400: "#4EC97C",
          500: "#16A34A",
          600: "#0F8A3E",
          700: "#0C6E33",
          800: "#0B542A",
          900: "#0A4423",
        },
        secondary: "#22C55E",
        accent: "#FACC15",
        dark: "#111827",
        surface: "#F8FAFC",
        muted: "#F3F4F6",
        danger: "#EF4444",
        success: "#22C55E",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "24px",
        xl4: "28px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17, 24, 39, 0.06)",
        card: "0 4px 24px rgba(17, 24, 39, 0.08)",
        float: "0 20px 50px -12px rgba(22, 163, 74, 0.25)",
        glass: "0 8px 32px rgba(17, 24, 39, 0.1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        leafSway: {
          "0%, 100%": { transform: "rotate(-4deg) translateY(0)" },
          "50%": { transform: "rotate(4deg) translateY(-8px)" },
        },
        dashMove: {
          "0%": { strokeDashoffset: 40 },
          "100%": { strokeDashoffset: 0 },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.4)", opacity: 0.5 },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease-out forwards",
        floatSlow: "floatSlow 6s ease-in-out infinite",
        leafSway: "leafSway 5s ease-in-out infinite",
        dashMove: "dashMove 1.2s linear infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
