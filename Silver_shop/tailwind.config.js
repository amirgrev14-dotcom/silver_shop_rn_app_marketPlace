/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: "#F8F8FB",
        surface: "#FFFFFF",
        primary: "#5B43D6",
        "primary-dark": "#4A35B8",
        "primary-light": "#EEEAFE",
        "text-primary": "#171722",
        "text-secondary": "#6F6E7A",
        "text-muted": "#A0A0AA",
        border: "#E8E7ED",
        "border-light": "#F0EFF4",
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
