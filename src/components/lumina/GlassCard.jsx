/**
 * GlassCard Component - Ported from Lumina OS
 * Premium glassmorphism card with spotlight effect
 * Optimized for 60FPS performance using Framer Motion
 */

import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useSoundManager } from '../../utils/soundManager';

export const GlassCard = ({
    children,
    className = '',
    hoverEffect = false,
    onClick,
    spotlight = true
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const { playHover, playClick } = useSoundManager();

    const handleMouseMove = React.useCallback(({ clientX, clientY, currentTarget }) => {
        if (!spotlight) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }, [mouseX, mouseY, spotlight]);

    return (
        <motion.div
            onClick={(e) => {
                if (hoverEffect) playClick();
                if (onClick) onClick(e);
            }}
            onMouseEnter={() => {
                if (hoverEffect) playHover();
            }}
            onMouseMove={handleMouseMove}
            className={`
                relative overflow-hidden
                bg-white/[0.01]
                backdrop-blur-[40px] 
                border-0
                rounded-[1.75rem] 
                shadow-2xl
                transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                group isolate
                ${hoverEffect ? 'hover:scale-[1.005] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] cursor-pointer active:scale-[0.99]' : ''}
                ${className}
            `}
        >
            {/* 1. Base Gradient Border (Simulated 0.5px Apple Style) */}
            <div className="absolute inset-0 rounded-[1.75rem] p-[0.5px] bg-gradient-to-b from-white/10 to-transparent -z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-[1.75rem] bg-[#080a09]/80" />
            </div>

            {/* 2. Spotlight Effect - GPU Accelerated */}
            {spotlight && (
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                600px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.04),
                                transparent 40%
                            )
                        `
                    }}
                />
            )}

            {/* 3. Top Highlight (Specular Reflection) */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />

            {/* 4. Inner Ring (Soft Depth) */}
            <div className="absolute inset-0 rounded-[1.75rem] border border-white/[0.03] pointer-events-none" />

            {/* 5. Ambient Glow (Bottom - Midnight Forest Tint) */}
            <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[80%] h-[120px] bg-emerald-500/[0.03] blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
