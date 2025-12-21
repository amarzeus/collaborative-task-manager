/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            letterSpacing: {
                tight: '-0.025em',
            },
            colors: {
                // Deep Space Theme
                'deep-space': '#0f172a',
                'electric-indigo': '#6366f1',
                // Background layers
                'bg-primary': '#0f172a',
                'bg-secondary': '#1e293b',
                'bg-tertiary': '#334155',
                // Glass accents
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'glass-bg': 'rgba(15, 23, 42, 0.6)',
            },
            backdropBlur: {
                'subtle': '4px',
                'panel': '12px',
                'heavy': '24px',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
