/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1", // Indigo
                secondary: "#8b5cf6", // Violet
                accent: "#06b6d4", // Cyan
                danger: "#ef4444", // Red
                success: "#10b981", // Emerald
                dark: "#1f2937", // Gray-800
                light: "#f9fafb", // Gray-50
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
