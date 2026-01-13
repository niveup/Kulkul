/**
 * ActivityGrid Component - Ported from Lumina OS
 * GitHub-style contribution heatmap with hover interactions
 */

import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const ActivityGrid = ({ sessions = [] }) => {
    const [hoveredCell, setHoveredCell] = useState(null);

    // Generate grid data - use real sessions if available, otherwise mock
    const data = useMemo(() => {
        const weeks = 20;
        const days = 7;
        const grid = [];
        let totalContributions = 0;

        // Calculate contributions from real sessions
        const sessionsByDate = {};
        sessions.forEach(session => {
            const date = new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            sessionsByDate[date] = (sessionsByDate[date] || 0) + (session.duration || 0) / 60; // Convert to hours
        });

        for (let w = 0; w < weeks; w++) {
            let weekCol = [];
            for (let d = 0; d < days; d++) {
                const date = new Date();
                date.setDate(date.getDate() - ((weeks - w - 1) * 7 + (6 - d)));
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                // Use real data if available, otherwise generate random for demo
                const contributions = sessionsByDate[dateStr] || (sessions.length === 0 ? Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0 : 0);
                totalContributions += contributions;

                // Calculate level based on contributions
                let level = 0;
                if (contributions > 4) level = 4;
                else if (contributions > 3) level = 3;
                else if (contributions > 2) level = 2;
                else if (contributions > 0) level = 1;

                weekCol.push({
                    level,
                    contributions: Math.round(contributions * 10) / 10,
                    date: dateStr,
                    isToday: w === weeks - 1 && d === days - 1
                });
            }
            grid.push(weekCol);
        }
        return { grid, totalContributions: Math.round(totalContributions) };
    }, [sessions]);

    // Refined Color Logic - Darker, Premium, "Obsidian" feel
    const getLevelStyle = (level, isToday) => {
        if (isToday) return 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10 scale-110';

        switch (level) {
            case 0: return 'bg-white/[0.03]'; // Barely visible
            case 1: return 'bg-indigo-500/20 border border-indigo-500/10'; // Subtle tint
            case 2: return 'bg-indigo-500/40 border border-indigo-500/20'; // Visible
            case 3: return 'bg-indigo-400/80 shadow-[0_0_10px_rgba(99,102,241,0.2)]'; // Glowing
            case 4: return 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]'; // Hot
            default: return 'bg-white/[0.03]';
        }
    };

    return (
        <GlassCard className="h-full flex flex-col justify-between p-0 overflow-hidden border border-white/5 bg-black/60 shadow-2xl">

            {/* Top Section: Header & Stats */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={14} className="text-white/40" />
                            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Productivity Trace</h3>
                        </div>
                        {/* Dynamic Header Display */}
                        <div className="h-10 flex items-end">
                            <div className={`transition-all duration-300 ${hoveredCell ? 'opacity-0 translate-y-2 absolute' : 'opacity-100 translate-y-0'}`}>
                                <h2 className="text-3xl font-light text-white tracking-tight">
                                    {data.totalContributions} <span className="text-lg text-white/20">hrs</span>
                                </h2>
                            </div>
                            <div className={`transition-all duration-300 ${hoveredCell ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 absolute'}`}>
                                <h2 className="text-3xl font-medium text-white tracking-tight">
                                    {hoveredCell?.contributions} <span className="text-lg text-white/40">units</span>
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Date / Context Display */}
                    <div className="text-right">
                        <div className={`transition-all duration-300 ${hoveredCell ? 'opacity-0 translate-y-2 absolute right-0' : 'opacity-100 translate-y-0'}`}>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-emerald-400 flex items-center gap-1.5">
                                <TrendingUp size={12} /> Top 5%
                            </div>
                        </div>
                        <div className={`transition-all duration-300 ${hoveredCell ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 absolute right-0'}`}>
                            <div className="text-sm font-medium text-white/60">{hoveredCell?.date}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Grid */}
            <div className="flex-1 px-8 pb-8 flex flex-col justify-end relative z-10" onMouseLeave={() => setHoveredCell(null)}>
                <div className="flex justify-between gap-[3px] w-full h-[120px] items-end">
                    {data.grid.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px] h-full justify-end flex-1">
                            {week.map((day, dIndex) => (
                                <div
                                    key={`${wIndex}-${dIndex}`}
                                    onMouseEnter={() => setHoveredCell(day)}
                                    className={`
                                    w-full aspect-square rounded-[2px]
                                    transition-all duration-300 ease-out
                                    hover:scale-125 hover:z-20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]
                                    ${getLevelStyle(day.level, day.isToday)}
                                `}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Minimalist Legend */}
                <div className="mt-6 flex items-center justify-between opacity-30 text-[10px] font-medium tracking-wider uppercase">
                    <span>20 Weeks</span>
                    <div className="flex items-center gap-2">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>

            {/* Ambient Gradient Background - Deep & Subtle */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/10 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        </GlassCard>
    );
};

export default ActivityGrid;
