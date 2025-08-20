/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  corePlugins: {
    preflight: false // ✅ pas de reset global → pas de conflit avec le site hôte
  },
  plugins: []
};

