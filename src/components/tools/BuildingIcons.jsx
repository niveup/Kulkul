import React from 'react';

// Common SVG props helper
const svgProps = ({ size, className, ...rest }) => ({
    viewBox: "0 0 200 200",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: size || "100%",
    height: size || "100%",
    className: className || "w-full h-full",
    ...rest
});

// --- FIRE EFFECT ---
// Simple animated fire/smoke paths
const FireOverlay = () => (
    <g>
        {/* Smoke Background */}
        <circle cx="100" cy="100" r="30" fill="#525252" fillOpacity="0.4">
            <animate attributeName="cy" values="100;90;100" dur="3s" repeatCount="indefinite" />
            <animate attributeName="r" values="30;40;30" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.2;0.4" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Flames */}
        <path d="M80 170 Q100 100 120 170 Q110 120 100 80 Q90 120 80 170" fill="#EF4444" opacity="0.8">
            <animate attributeName="d" values="M80 170 Q100 100 120 170 Q110 120 100 80 Q90 120 80 170; M85 170 Q105 110 125 170 Q115 130 105 90 Q95 130 85 170; M80 170 Q100 100 120 170 Q110 120 100 80 Q90 120 80 170" dur="0.8s" repeatCount="indefinite" />
        </path>
        <path d="M90 175 Q100 130 110 175 Q105 140 100 110 Q95 140 90 175" fill="#F59E0B" opacity="0.9">
            <animate attributeName="d" values="M90 175 Q100 130 110 175 Q105 140 100 110 Q95 140 90 175; M92 175 Q102 135 112 175 Q107 145 102 115 Q97 145 92 175; M90 175 Q100 130 110 175 Q105 140 100 110 Q95 140 90 175" dur="0.6s" repeatCount="indefinite" />
        </path>
    </g>
);

// --- PRIMITIVES (Originals) ---

export const TentIcon = (props) => (
    <svg {...svgProps(props)}>
        <path d="M100 200 L150 175 L100 150 L50 175 Z" fill="black" fillOpacity="0.15" />
        <path d="M50 175 L100 60 L100 175 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M150 175 L100 60 L100 175 Z" fill="#FB923C" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M100 175 L100 130 L115 175 Z" fill="#7C2D12" />
        <path d="M100 60 L100 175" stroke="#FED7AA" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
);

export const HouseIcon = (props) => (
    <svg {...svgProps(props)}>
        <path d="M100 190 L155 165 L100 140 L45 165 Z" fill="black" fillOpacity="0.15" />
        <path d="M50 165 V115 L100 140 V190 L50 165 Z" fill="#059669" stroke="#064E3B" strokeWidth="2" />
        <path d="M150 165 V115 L100 140 V190 L150 165 Z" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
        <path d="M50 115 L100 60 L100 140 Z" fill="#34D399" stroke="#064E3B" strokeWidth="2" strokeLinejoin="round" />
        <path d="M150 115 L100 60 L100 140 Z" fill="#6EE7B7" stroke="#064E3B" strokeWidth="2" strokeLinejoin="round" />
        <path d="M110 185 V155 L130 145 V175 L110 185 Z" fill="#064E3B" />
        <path d="M65 145 V130 L85 140 V155 L65 145 Z" fill="#A7F3D0" />
    </svg>
);

export const ApartmentIcon = (props) => (
    <svg {...svgProps(props)}>
        <path d="M100 190 L155 165 L100 140 L45 165 Z" fill="black" fillOpacity="0.15" />
        <path d="M50 165 V75 L100 100 V190 L50 165 Z" fill="#2563EB" stroke="#1E40AF" strokeWidth="2" />
        <path d="M150 165 V75 L100 100 V190 L150 165 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
        <path d="M50 75 L100 50 L150 75 L100 100 L50 75 Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="2" />
        <path d="M60 100 L80 110 V130 L60 120 Z" fill="#93C5FD" />
        <path d="M60 135 L80 145 V165 L60 155 Z" fill="#93C5FD" />
        <path d="M120 110 L140 100 V120 L120 130 Z" fill="#BFDBFE" />
        <path d="M120 145 L140 135 V155 L120 165 Z" fill="#BFDBFE" />
        <path d="M80 65 L100 55 L120 65 L100 75 Z" fill="#93C5FD" opacity="0.5" />
    </svg>
);

export const SkyscraperIcon = (props) => (
    <svg {...svgProps(props)}>
        <path d="M100 195 L160 165 L100 135 L40 165 Z" fill="black" fillOpacity="0.15" />
        <path d="M55 165 V50 L100 75 V190 L55 165 Z" fill="#9333EA" stroke="#6B21A8" strokeWidth="2" />
        <path d="M145 165 V50 L100 75 V190 L145 165 Z" fill="#A855F7" stroke="#6B21A8" strokeWidth="2" />
        <path d="M55 50 L100 25 L145 50 L100 75 L55 50 Z" fill="#C084FC" stroke="#6B21A8" strokeWidth="2" />
        <path d="M70 65 V170" stroke="#E9D5FF" strokeWidth="4" />
        <path d="M85 70 V180" stroke="#E9D5FF" strokeWidth="4" />
        <path d="M115 70 V180" stroke="#F3E8FF" strokeWidth="4" />
        <path d="M130 65 V170" stroke="#F3E8FF" strokeWidth="4" />
        <path d="M100 25 V5" stroke="#FCD34D" strokeWidth="3" />
        <circle cx="100" cy="5" r="3" fill="#FCD34D" />
    </svg>
);

export const BurjKhalifaIcon = (props) => (
    <svg {...svgProps(props)}>
        <path d="M100 195 L150 170 L100 145 L50 170 Z" fill="black" fillOpacity="0.15" />
        <path d="M55 170 V120 L100 145 V190 L55 170 Z" fill="#0369A1" />
        <path d="M145 170 V120 L100 145 V190 L145 170 Z" fill="#0EA5E9" />
        <path d="M55 120 L100 95 L145 120 L100 145 Z" fill="#7DD3FC" />
        <path d="M70 120 V80 L100 95 V145 L70 120 Z" fill="#0369A1" />
        <path d="M130 120 V80 L100 95 V145 L130 120 Z" fill="#0EA5E9" />
        <path d="M85 90 V40 L100 50 V95 L85 90 Z" fill="#0284C7" />
        <path d="M115 90 V40 L100 50 V95 L115 90 Z" fill="#38BDF8" />
        <path d="M85 40 L100 30 L115 40 L100 50 Z" fill="#BAE6FD" />
        <path d="M100 30 V5" stroke="#E0F2FE" strokeWidth="2" />
    </svg>
);

export const LandmarkIcon = (props) => (
    <svg {...svgProps(props)}>
        <path d="M100 190 L160 160 L100 130 L40 160 Z" fill="black" fillOpacity="0.1" />
        <path d="M50 160 L100 135 L150 160 L100 185 Z" fill="#EAB308" />
        <path d="M50 160 L50 140 L100 115 L150 140 L150 160 L100 185 Z" fill="#CA8A04" opacity="0.5" />
        <circle cx="100" cy="140" r="20" fill="#FEF08A" />
    </svg>
)

// --- BURNING RUIN VARIANTS ---
// These reuse the geometry but add fire and darker colors

export const TentRuinIcon = (props) => (
    <svg {...svgProps(props)}>
        {/* Darkened Tent */}
        <path d="M100 200 L150 175 L100 150 L50 175 Z" fill="black" fillOpacity="0.2" />
        <path d="M50 175 L100 60 L100 175 Z" fill="#7C2D12" stroke="#431407" strokeWidth="2" strokeLinejoin="round" />
        <path d="M150 175 L100 60 L100 175 Z" fill="#9A3412" stroke="#431407" strokeWidth="2" strokeLinejoin="round" />
        <path d="M100 175 L100 130 L115 175 Z" fill="#202020" />
        <FireOverlay />
    </svg>
);

export const HouseRuinIcon = (props) => (
    <svg {...svgProps(props)}>
        {/* Darkened House */}
        <path d="M100 190 L155 165 L100 140 L45 165 Z" fill="black" fillOpacity="0.2" />
        <path d="M50 165 V115 L100 140 V190 L50 165 Z" fill="#065F46" stroke="#022C22" strokeWidth="2" />
        <path d="M150 165 V115 L100 140 V190 L150 165 Z" fill="#047857" stroke="#022C22" strokeWidth="2" />
        <path d="M50 115 L100 60 L100 140 Z" fill="#4B5563" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />
        <path d="M150 115 L100 60 L100 140 Z" fill="#6B7280" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />
        <path d="M110 185 V155 L130 145 V175 L110 185 Z" fill="#1F2937" />
        <FireOverlay />
    </svg>
);

export const ApartmentRuinIcon = (props) => (
    <svg {...svgProps(props)}>
        {/* Darkened Apartment */}
        <path d="M100 190 L155 165 L100 140 L45 165 Z" fill="black" fillOpacity="0.2" />
        <path d="M50 165 V75 L100 100 V190 L50 165 Z" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2" />
        <path d="M150 165 V75 L100 100 V190 L150 165 Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" />
        <path d="M50 75 L100 50 L150 75 L100 100 L50 75 Z" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2" />
        <path d="M60 100 L80 110 V130 L60 120 Z" fill="#374151" />
        <path d="M120 110 L140 100 V120 L120 130 Z" fill="#374151" />
        <path d="M80 65 L100 55 L120 65 L100 75 Z" fill="#4B5563" opacity="0.5" />
        <FireOverlay />
    </svg>
);

export const SkyscraperRuinIcon = (props) => (
    <svg {...svgProps(props)}>
        {/* Darkened Skyscraper */}
        <path d="M100 195 L160 165 L100 135 L40 165 Z" fill="black" fillOpacity="0.2" />
        <path d="M55 165 V50 L100 75 V190 L55 165 Z" fill="#6B21A8" stroke="#581C87" strokeWidth="2" />
        <path d="M145 165 V50 L100 75 V190 L145 165 Z" fill="#7E22CE" stroke="#581C87" strokeWidth="2" />
        <path d="M55 50 L100 25 L145 50 L100 75 L55 50 Z" fill="#9333EA" stroke="#581C87" strokeWidth="2" />
        <path d="M70 65 V170" stroke="#4B5563" strokeWidth="4" />
        <path d="M115 70 V180" stroke="#4B5563" strokeWidth="4" />
        <FireOverlay />
    </svg>
);

export const BurjKhalifaRuinIcon = (props) => (
    <svg {...svgProps(props)}>
        {/* Darkened Burj */}
        <path d="M100 195 L150 170 L100 145 L50 170 Z" fill="black" fillOpacity="0.2" />
        <path d="M55 170 V120 L100 145 V190 L55 170 Z" fill="#075985" />
        <path d="M145 170 V120 L100 145 V190 L145 170 Z" fill="#0369A1" />
        <path d="M55 120 L100 95 L145 120 L100 145 Z" fill="#0284C7" />
        <path d="M70 120 V80 L100 95 V145 L70 120 Z" fill="#075985" />
        <path d="M130 120 V80 L100 95 V145 L130 120 Z" fill="#0369A1" />
        <path d="M85 90 V40 L100 50 V95 L85 90 Z" fill="#0369A1" />
        <path d="M115 90 V40 L100 50 V95 L115 90 Z" fill="#0284C7" />
        <path d="M85 40 L100 30 L115 40 L100 50 Z" fill="#38BDF8" />
        <path d="M100 30 V5" stroke="#94A3B8" strokeWidth="2" />
        <FireOverlay />
    </svg>
);

export const BuildingRuinIcon = ApartmentRuinIcon; // Fallback to Apartment if needed
