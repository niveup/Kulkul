/**
 * Chrono-Dial Component - Project Aether
 * 
 * A premium SVG circular timer gauge with:
 * - Animated progress arc
 * - Glowing trail effect
 * - Tick marks around the dial
 * - Smooth spring animations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const ChronoDial = ({
    progress = 0, // 0 to 1
    size = 200,
    strokeWidth = 8,
    isRunning = false,
    isPaused = false,
    className,
}) => {
    const center = size / 2;
    const radius = (size - strokeWidth) / 2 - 10; // Leave room for glow
    const circumference = 2 * Math.PI * radius;

    // Calculate the arc offset based on progress
    const strokeDashoffset = circumference * (1 - progress);

    // Generate tick marks (60 for minutes, like a clock)
    const ticks = useMemo(() => {
        const tickCount = 60;
        const ticksArray = [];

        for (let i = 0; i < tickCount; i++) {
            const angle = (i / tickCount) * 360 - 90; // Start from top
            const radians = (angle * Math.PI) / 180;
            const isMajor = i % 5 === 0; // Major tick every 5 minutes

            const innerRadius = radius - (isMajor ? 12 : 8);
            const outerRadius = radius - 4;

            const x1 = center + innerRadius * Math.cos(radians);
            const y1 = center + innerRadius * Math.sin(radians);
            const x2 = center + outerRadius * Math.cos(radians);
            const y2 = center + outerRadius * Math.sin(radians);

            ticksArray.push({ x1, y1, x2, y2, isMajor, index: i });
        }

        return ticksArray;
    }, [center, radius]);

    // Color based on state
    const getColor = () => {
        if (isPaused) return { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }; // Amber
        if (isRunning) return { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' }; // Cyan
        return { primary: '#64748b', glow: 'rgba(100, 116, 139, 0.3)' }; // Slate
    };

    const colors = getColor();

    return (
        <div className={cn('relative', className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Glow Filter */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Gradient for progress arc */}
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors.primary} />
                        <stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                {/* Tick marks */}
                <g className="opacity-30">
                    {ticks.map((tick) => (
                        <line
                            key={tick.index}
                            x1={tick.x1}
                            y1={tick.y1}
                            x2={tick.x2}
                            y2={tick.y2}
                            stroke={tick.isMajor ? 'white' : 'white'}
                            strokeWidth={tick.isMajor ? 2 : 1}
                            strokeLinecap="round"
                            opacity={tick.isMajor ? 0.6 : 0.3}
                        />
                    ))}
                </g>

                {/* Background track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="white"
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.1}
                />

                {/* Progress arc with glow */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                    filter={isRunning ? 'url(#glow)' : undefined}
                />

                {/* Glowing dot at the end of progress */}
                {progress > 0 && (
                    <motion.circle
                        cx={center + radius * Math.cos((progress * 360 - 90) * Math.PI / 180)}
                        cy={center + radius * Math.sin((progress * 360 - 90) * Math.PI / 180)}
                        r={strokeWidth / 2 + 2}
                        fill={colors.primary}
                        filter="url(#glow)"
                        animate={{
                            scale: isRunning ? [1, 1.2, 1] : 1,
                            opacity: isRunning ? [1, 0.8, 1] : 1,
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}
            </svg>

            {/* Center content area */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Children can be placed here */}
            </div>
        </div>
    );
};

export default ChronoDial;
