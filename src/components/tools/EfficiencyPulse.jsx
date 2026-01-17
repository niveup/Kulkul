import React from 'react';
import { motion } from 'framer-motion';

const EfficiencyPulse = ({ efficiency = 0, streak = 0, todayFocus = "0m", onToggle, isDaily = true, targetEfficiency = 80 }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (efficiency / 100) * circumference;

    const progressToTarget = Math.min(1, efficiency / (targetEfficiency || 1));
    const hue = Math.floor(progressToTarget * 120);
    const strokeColor = `hsl(${hue}, 85%, 60%)`;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-4" onClick={onToggle}>

            {/* 1. Header ABOVE */}
            <div className="mb-4 flex flex-col items-center z-20">
                <h3 className="text-white/90 text-[15px] font-semibold tracking-wide">Efficiency</h3>
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-0.5">
                    {isDaily ? 'Daily Performance' : 'Overall Average'}
                </span>
            </div>

            {/* 2. Circle Container */}
            <div className="relative w-56 h-56 flex items-center justify-center pointer-events-none mb-2">

                {/* Breathing Glow */}
                <div
                    className="absolute inset-0 blur-[70px] animate-breathe rounded-full opacity-30"
                    style={{ backgroundColor: strokeColor }}
                />

                <svg className="w-full h-full -rotate-90 transform drop-shadow-xl">
                    <circle
                        cx="50%" cy="50%" r={radius}
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="4"
                        fill="transparent"
                    />
                    <circle
                        cx="50%" cy="50%" r={radius}
                        stroke={strokeColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                    {targetEfficiency < 100 && (
                        <g transform={`rotate(${(targetEfficiency / 100) * 360} 50 50)`} className="origin-center transition-all duration-500">
                            <rect x="50%" y="12" width="2" height="4" fill="rgba(255,255,255,0.2)" rx="1" />
                        </g>
                    )}
                </svg>

                {/* 3. Main Value INSIDE (Perfectly Centered) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[64px] leading-none font-medium text-white tracking-[-0.04em] drop-shadow-lg">
                        {isNaN(efficiency) ? 0 : efficiency}
                    </span>
                    <span className="text-sm font-medium text-white/50 mt-1">%</span>
                </div>
            </div>

            {/* 4. Footer Stats OUTSIDE/BELOW */}
            <div className="flex gap-8 z-20">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-0.5">Streak</span>
                    <span className="text-sm font-medium text-white/90">{streak} <span className="text-xs text-white/40">days</span></span>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-8 bg-white/10" />

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-0.5">Focus</span>
                    <span className="text-sm font-medium text-white/90">{todayFocus}</span>
                </div>
            </div>

        </div>
    );
};

export default React.memo(EfficiencyPulse);
