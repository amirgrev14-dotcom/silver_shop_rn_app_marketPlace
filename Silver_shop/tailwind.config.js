/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: "#F7F7F8",
        surface: "#FFFFFF",
        primary: "#5145B8",
        "primary-dark": "#43389C",
        "primary-light": "#EEEAFE",
        "text-primary": "#1F1F29",
        "text-secondary": "#777782",
        "text-muted": "#A0A0AA",
        border: "#E5E5EA",
        "border-light": "#EFEFF2",
        silver: "#C8C8CC",
        "silver-light": "#F1F1F3",
        success: "#34A853",
        error: "#E5484D",
        warning: "#F5A524",
      },
    },
  },
  plugins: [],
};
