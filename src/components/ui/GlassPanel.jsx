/**
 * GlassPanel Component - Project Aether
 * 
 * The foundational "material" for all content surfaces.
 * Implements the 4-layer Glass Rendering Stack:
 * 1. Scatter (backdrop-blur)
 * 2. Surface (semi-transparent background)
 * 3. Noise (grain texture overlay)
 * 4. Specular (top border highlight)
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Material variants based on the Aether specification
const materialVariants = {
    base: {
        blur: 'backdrop-blur-xl',
        opacity: 'bg-white/60 dark:bg-white/5',
        border: 'border border-white/20 dark:border-white/10',
        shadow: 'shadow-xl shadow-slate-200/20 dark:shadow-black/20',
    },
    thick: {
        blur: 'backdrop-blur-2xl',
        opacity: 'bg-white/70 dark:bg-white/8',
        border: 'border border-white/30 dark:border-white/15',
        shadow: 'shadow-2xl shadow-slate-200/30 dark:shadow-black/30',
    },
    thin: {
        blur: 'backdrop-blur-md',
        opacity: 'bg-white/30 dark:bg-white/3',
        border: 'border border-white/10 dark:border-white/5',
        shadow: 'shadow-lg shadow-slate-200/10 dark:shadow-black/10',
    },
    dock: {
        blur: 'backdrop-blur-2xl',
        opacity: 'bg-white/40 dark:bg-slate-900/60',
        border: 'border border-white/20 dark:border-white/10',
        shadow: 'shadow-xl shadow-slate-200/20 dark:shadow-black/40',
    },
};

const GlassPanel = forwardRef(({
    children,
    className,
    variant = 'base',
    glow = false,
    glowColor = 'cyan',
    padding = true,
    rounded = '2xl',
    hover = false,
    as = 'div',
    ...props
}, ref) => {
    const material = materialVariants[variant] || materialVariants.base;

    // Glow color mapping
    const glowColors = {
        cyan: 'shadow-cyan-500/20 dark:shadow-cyan-500/30',
        amber: 'shadow-amber-500/20 dark:shadow-amber-500/30',
        emerald: 'shadow-emerald-500/20 dark:shadow-emerald-500/30',
        rose: 'shadow-rose-500/20 dark:shadow-rose-500/30',
    };

    const Component = motion[as] || motion.div;

    return (
        <Component
            ref={ref}
            className={cn(
                // Base structure
                'relative overflow-hidden',
                `rounded-${rounded}`,

                // Material layers
                material.blur,
                material.opacity,
                material.border,
                material.shadow,

                // Optional glow
                glow && glowColors[glowColor],

                // Optional padding
                padding && 'p-6',

                // Hover effects
                hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',

                // Specular highlight (inner glow at top)
                'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',

                className
            )}
            {...props}
        >
            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </Component>
    );
});

GlassPanel.displayName = 'GlassPanel';

export default GlassPanel;

// Export material variants for direct use
export { materialVariants };
