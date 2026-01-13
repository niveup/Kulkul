/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Lumina Premium Palette
                void: '#030304',      // Deepest background
                obsidian: '#0A0A0C',  // Card/Sidebar background
                mantle: '#111114',    // Hover states

                // Brand Colors
                lumina: {
                    50: '#f0f4ff',
                    100: '#e5edff',
                    200: '#cddbfe',
                    300: '#b4c6fc',
                    400: '#8da2fb',
                    500: '#6366f1', // Main Brand (Indigo)
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },

                // Functional
                glass: {
                    10: 'rgba(255, 255, 255, 0.03)',
                    20: 'rgba(255, 255, 255, 0.05)',
                    30: 'rgba(255, 255, 255, 0.10)',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
                heading: ['Cal Sans', 'Outfit', 'Inter', 'sans-serif'],
            },
            animation: {
                'slow-spin': 'spin 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.5' },
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'lumina-gradient': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            }
        },
    },
    darkMode: 'class',
    plugins: [],
}
