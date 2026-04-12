// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "navy-header": "#0f172a",
        background: "#ffffff",
        card: "#ffffff",
        "card-foreground": "#0b1220",
        sidebar: "#ffffff", // sidebar background
        "sidebar-border": "#e5e7eb", // border
        "sidebar-accent": "#f3f4f6", // hover / active background color
        muted: "#f3f4f6",
        "muted-foreground": "#6b7280", // muted text
        primary: "#197398",
        "primary-foreground": "#ffffff",
      },
    },
  },
  plugins: [],
};
