/**
 * GlassCard Component - Ported from Lumina OS
 * Premium glassmorphism card with spotlight effect
 * Optimized for 60FPS performance using Framer Motion
 */

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export const GlassCard = ({
    children,
    className = '',
    hoverEffect = false,
    onClick,
    spotlight = true
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = React.useCallback(({ clientX, clientY, currentTarget }) => {
        if (!spotlight) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }, [mouseX, mouseY, spotlight]);

    return (
        <motion.div
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`
                relative overflow-hidden
                bg-obsidian/60
                backdrop-blur-2xl 
                border-0
                rounded-[2rem] 
                shadow-2xl
                transition-all duration-500 ease-out
                group isolate
                ${hoverEffect ? 'hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.98]' : ''}
                ${className}
            `}
        >
            {/* 1. Base Gradient Border (Simulated) */}
            <div className="absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-white/0 -z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-[2rem] bg-obsidian/60" />
            </div>

            {/* 2. Spotlight Effect - GPU Accelerated */}
            {spotlight && (
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                650px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.04),
                                transparent 40%
                            )
                        `
                    }}
                />
            )}

            {/* 3. Top Highlight (Specular Reflection) */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

            {/* 4. Inner Ring (Depth) */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none" />

            {/* 5. Ambient Glow (Bottom) */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[60%] h-[100px] bg-indigo-500/10 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
