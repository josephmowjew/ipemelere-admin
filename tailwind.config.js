/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Palette
        primary: {
          50: "#E6F3EC",
          100: "#CCE7D9",
          200: "#99CFB3",
          300: "#66B88D",
          400: "#33A067",
          500: "#0B5D36", // Main Brand Color
          600: "#094E2E",
          700: "#073D24",
          800: "#052E1B",
          900: "#031F11",
        },
        secondary: {
          50: "#FFF8E6",
          100: "#FFF0CC",
          200: "#FFE399",
          300: "#FFD666",
          400: "#FFCA33",
          500: "#FEC20D", // Main Secondary Color
          600: "#D9A400",
          700: "#A37600",
          800: "#6E5000",
          900: "#3A2900",
        },
        destructive: {
          50: "#FDEAEA",
          100: "#FACDCD",
          200: "#F59B9B",
          300: "#EF6666",
          400: "#E53939",
          500: "#D72638", // Main Destructive Color
          600: "#B31F2F",
          700: "#801720",
          800: "#4D0F14",
          900: "#260709",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate")
  ],
};