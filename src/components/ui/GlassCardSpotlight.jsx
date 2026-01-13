/**
 * GlassCardSpotlight Component - Lumina OS Edition
 * 
 * A premium glassmorphism card wrapper with:
 * - Mouse-tracking spotlight effect
 * - Liquid glass styling
 * - 3D glass edge highlights
 * - Smooth hover animations
 * 
 * Ported from niveup/dashboard (Lumina OS)
 */

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

const GlassCardSpotlight = ({
    children,
    className = '',
    hoverEffect = false,
    onClick,
    spotlight = true,
    as: Component = 'div',
}) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = useCallback((e) => {
        if (!divRef.current || !spotlight) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, [spotlight]);

    const handleMouseEnter = useCallback(() => setOpacity(1), []);
    const handleMouseLeave = useCallback(() => setOpacity(0), []);

    return (
        <Component
            ref={divRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                // Base styling
                'relative overflow-hidden',
                'bg-black/40 backdrop-blur-3xl',
                'border border-white/10',
                'rounded-[2rem]',
                'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
                // Liquid transition
                'transition-all duration-500',
                // Hover effect variations
                hoverEffect && [
                    'hover:bg-white/5',
                    'hover:scale-[1.01]',
                    'hover:shadow-[0_20px_40px_0_rgba(0,0,0,0.4)]',
                    'cursor-pointer',
                    'active:scale-[0.98]'
                ],
                className
            )}
            style={{
                transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
            }}
        >
            {/* Spotlight Effect - Subtle gradient tracking mouse */}
            {spotlight && (
                <div
                    className="pointer-events-none absolute -inset-px transition duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.04), transparent 40%)`,
                        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                />
            )}

            {/* Top highlight for 3D glass edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 pointer-events-none" />

            {/* Glossy reflection gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-100 pointer-events-none rounded-[2rem]" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </Component>
    );
};

export default GlassCardSpotlight;
