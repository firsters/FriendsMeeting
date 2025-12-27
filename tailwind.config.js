/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#256af4",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#256af4", // Overwritten with design primary
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3a8a",
          950: "#172554",
        },
        "background-light": "#f5f6f8",
        "background-dark": "#101622",
        accent: {
          pink: "#f472b6",
          purple: "#a855f7",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
