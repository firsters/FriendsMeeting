/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4285F4",
          50: "#e8f0fe",
          100: "#d2e3fc",
          200: "#aecbfa",
          300: "#8ab4f8",
          400: "#669df6",
          500: "#4285F4",
          600: "#1a73e8",
          700: "#1967d2",
          800: "#185abc",
          900: "#174ea6",
        },
        success: "#34A853",
        warning: "#F9AB00",
        error: "#EA4335",
        "bg-main": "#FFFFFF",
        "bg-secondary": "#F5F5F5",
        "text-primary": "#212121",
        "text-secondary": "#757575",
        "text-placeholder": "#BDBDBD",
        "border-light": "#E0E0E0",
      },
      fontFamily: {
        "display": ["Roboto", "Noto Sans KR", "sans-serif"],
        "sans": ["Roboto", "Noto Sans KR", "sans-serif"]
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
