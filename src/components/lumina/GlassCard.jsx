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
                bg-black/40 backdrop-blur-3xl 
                border-0
                rounded-[2rem] 
                shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
                transition-transform duration-500 ease-out
                group isolate
                ${hoverEffect ? 'hover:scale-[1.01] hover:shadow-[0_20px_40px_0_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.98]' : ''}
                ${className}
            `}
        >
            {/* Gradient Border (Simulated via an inset background) */}
            <div className="absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-transparent -z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-[2rem] bg-black/40 backdrop-blur-3xl" />
            </div>

            {/* Spotlight Effect - GPU Accelerated */}
            {spotlight && (
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                800px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.06),
                                transparent 40%
                            )
                        `
                    }}
                />
            )}

            {/* Top highlight for 3D glass edge - Enhanced */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />

            {/* Inner Ring for depth */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none" />

            {/* Glossy reflection gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-100 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
