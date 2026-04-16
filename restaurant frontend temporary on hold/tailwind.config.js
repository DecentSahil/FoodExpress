/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#D22B2B',
                'secondary': '#FF8C00',
                'bg-dark': '#1A1A1A',
                'bg-light': '#2A2A2A',
            },
        },
    },
    plugins: [],
}
