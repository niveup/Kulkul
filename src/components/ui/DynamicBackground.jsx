import React, { useEffect, useState } from 'react';

// Defined color palettes based on time of day
const THEMES = {
    morning: {
        bg: '#0F172A', // Deep slate night transitioning to day
        orb1: 'rgba(251, 146, 60, 0.15)', // Sunrise orange
        orb2: 'rgba(236, 72, 153, 0.12)', // Dawn pink
        orb3: 'rgba(99, 102, 241, 0.1)',  // Morning indigo
    },
    afternoon: {
        bg: '#0B1120', // Deep afternoon blue
        orb1: 'rgba(56, 189, 248, 0.12)', // Sky blue
        orb2: 'rgba(168, 85, 247, 0.1)', // Soft purple
        orb3: 'rgba(45, 212, 191, 0.08)', // Teal
    },
    sunset: {
        bg: '#1A0B1C', // Deep purple dusk
        orb1: 'rgba(244, 63, 94, 0.15)',  // Rose red
        orb2: 'rgba(245, 158, 11, 0.12)', // Golden amber
        orb3: 'rgba(124, 58, 237, 0.1)',  // Deep violet
    },
    night: {
        bg: '#050505', // Near black
        orb1: 'rgba(129, 140, 248, 0.08)', // Faint starlight blue
        orb2: 'rgba(192, 132, 252, 0.05)', // Barely visible purple nebula
        orb3: 'rgba(52, 211, 153, 0.03)',  // Extremely subtle aurora green
    },
};

const getInitialTheme = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'sunset';
    return 'night';
};

const DynamicBackground = ({ themePreference }) => {
    const [timeTheme, setTimeTheme] = useState(getInitialTheme());

    useEffect(() => {
        // Only run the timer if we are in dynamic mode
        if (themePreference !== 'dynamic') return;

        // Check time every 5 minutes (300000ms) to see if underlying time theme should change
        const interval = setInterval(() => {
            const newTheme = getInitialTheme();
            if (newTheme !== timeTheme) {
                setTimeTheme(newTheme);
            }
        }, 300000);

        return () => clearInterval(interval);
    }, [timeTheme, themePreference]);

    // If Classic Obsidian, render strictly nothing but a pure black/grey background div
    if (themePreference === 'classic-obsidian') {
        return (
            <div
                className="fixed inset-0 z-[-1] bg-[#0a0a0a] transition-colors duration-1000"
                aria-hidden="true"
            />
        );
    }

    const currentColors = THEMES[timeTheme];

    // Dynamic mesh gradient rendering
    return (
        <div
            className="fixed inset-0 z-[-1] overflow-hidden transition-colors duration-[3000ms] ease-in-out pointer-events-none"
            style={{ backgroundColor: currentColors.bg }}
            aria-hidden="true"
        >
            {/* Orb 1: Top Left to Center Arc */}
            <div
                className="absolute top-[-25%] left-[-25%] w-[80vw] h-[80vw] rounded-full orb-1"
                style={{ background: `radial-gradient(circle at center, ${currentColors.orb1} 0%, transparent 60%)` }}
            />

            {/* Orb 2: Bottom Right slow drift */}
            <div
                className="absolute bottom-[-30%] right-[-20%] w-[90vw] h-[90vw] rounded-full orb-2"
                style={{ background: `radial-gradient(circle at center, ${currentColors.orb2} 0%, transparent 60%)` }}
            />

            {/* Orb 3: Center ambient pulse */}
            <div
                className="absolute top-[10%] left-[10%] w-[70vw] h-[70vw] rounded-full orb-3"
                style={{ background: `radial-gradient(circle at center, ${currentColors.orb3} 0%, transparent 60%)` }}
            />

            {/* Heavy noise/grain overlay for that premium "matte glass" texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        </div>
    );
};

export default DynamicBackground;
