import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const LuminaOrb = ({ size = 40, className }) => {
    // "Sleek & Simple" - Ultra-minimalist Design
    // A pure, elegant glass sphere with a single point of light.

    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            {/* 1. The Glass Disc (Base) */}
            <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl" />

            {/* 2. Inner Ring (Subtle Detail) */}
            <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />

            {/* 3. The Core (Singularity) - Pure White Light */}
            <motion.div
                className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* 4. Top Reflection (Gloss) */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-full opacity-50 pointer-events-none" />
        </div>
    );
};

export default LuminaOrb;
