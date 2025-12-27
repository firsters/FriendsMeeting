/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#256af4",
        "background-light": "#f5f6f8",
        "background-dark": "#101622",
        "surface-dark": "#1e293b",
        "surface-highlight-dark": "#222f49",
        "card-dark": "#182234",
        "card-light": "#ffffff",
        "input-light": "#eef0f4",
        "input-dark": "#222f49",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "Inter", "Noto Sans KR", "sans-serif"],
        body: ["Inter", "Noto Sans KR", "sans-serif"],
        sans: ["Inter", "Noto Sans KR", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
