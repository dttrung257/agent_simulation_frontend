/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 20s linear infinite",
        float: "float 8s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 2s infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "float-slower": "float 12s ease-in-out 1s infinite",
        "float-slowest": "float 14s ease-in-out 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-10px) translateX(10px)" },
        },
      },
    },
  },
  plugins: [],
};
