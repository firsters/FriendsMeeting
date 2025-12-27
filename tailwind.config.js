/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#256af4",
        "background-light": "#f5f6f8",
        "background-dark": "#101622",
        "card-light": "#ffffff",
        "card-dark": "#1c2433",
        "input-light": "#eef0f4",
        "input-dark": "#222f49",
      },
      fontFamily: {
        display: ["Inter", "Noto Sans KR", "sans-serif"],
        body: ["Inter", "Noto Sans KR", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
