/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Liquid System Palette - Apple-inspired
                liquid: {
                    base: '#000000', // Deep black for contrast
                    surface: '#121212', // Slightly lighter black
                    white: 'rgba(255, 255, 255, 0.7)', // Primary Text
                    glass: 'rgba(255, 255, 255, 0.08)', // Card Background
                    stroke: 'rgba(255, 255, 255, 0.06)', // Subtle Borders
                    highlight: 'rgba(255, 255, 255, 0.15)', // Hover state
                },
                // Accent Palette - Soft, pastel neon
                accent: {
                    blue: '#2997ff', // Apple Blue
                    purple: '#bf5af2', // Apple Purple
                    teal: '#6ac4fa', // Soft Cyan
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'system-ui', 'sans-serif'],
                display: ['SF Pro Display', 'Inter', 'sans-serif'],
                mono: ['SF Mono', 'Menlo', 'monospace'],
            },
            boxShadow: {
                'liquid-1': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'liquid-hover': '0 8px 40px 0 rgba(0, 0, 0, 0.45)',
                'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            },
            backdropBlur: {
                'xs': '2px',
                'md': '12px',
                'lg': '24px',
                'xl': '40px', // Heavy Apple-style blur
            },
            animation: {
                'float': 'float 8s ease-in-out infinite',
                'breathe': 'breathe 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                breathe: {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.02)' },
                }
            },
            backgroundImage: {
                'liquid-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            }
        },
    },
    darkMode: 'class',
    plugins: [],
}
