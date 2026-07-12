/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          border: "var(--border-color)",
          borderAccent: "var(--border-accent)",
          text: "var(--text-primary)",
          sub: "var(--text-secondary)",
          muted: "var(--text-muted)",
          accent: "var(--accent-color)",
          accentHover: "var(--accent-hover)",
          accentLight: "var(--accent-light)",
          accentGlow: "var(--accent-glow)",
        },
        // Preserve standard purple definitions
        purple: {
          300: "#e0e7fe",
          500: "#3e38a7",
          600: "#5046e4",
        }
      },
      borderRadius: {
        premium: "var(--radius-card)",
        btn: "var(--radius-button)",
      },
      boxShadow: {
        "premium-sm": "var(--shadow-sm)",
        "premium-md": "var(--shadow-md)",
        "premium-lg": "var(--shadow-lg)",
      }
    },
  },
  plugins: [],
}