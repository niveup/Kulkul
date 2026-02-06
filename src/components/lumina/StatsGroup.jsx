/**
 * StatsGroup Component - Study Studio Edition (MNC Grade)
 * Focus: Serene precision, warm functional accents, and elite editorial typography.
 */

import React from 'react';
import { GlassCard } from './GlassCard';

export const StatsGroup = ({
    focusTime = 0,
    completedTasks = 0,
    totalTasks = 0,
    streak = 0
}) => {
    const hours = Math.floor(focusTime / 60);
    const minutes = Math.round(focusTime % 60);
    const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Focus Card - Warm Amber (Desk Lamp Theme) */}
            <GlassCard className="h-[220px]" spotlight={true}>
                <div className="p-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]" />
                            <span className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">Study Session</span>
                        </div>
                        <h3 className="text-7xl font-bold text-white/90 tracking-tight leading-none mb-2">
                            {hours}<span className="text-2xl text-white/20 font-medium ml-2">h</span> {minutes}<span className="text-2xl text-white/20 font-medium ml-2">m</span>
                        </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.03] pt-6">
                        <span className="text-[11px] text-white/20 font-semibold tracking-wide uppercase">Time Logged</span>
                        <div className="px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10 text-[9px] font-bold text-amber-300 uppercase tracking-widest">
                            Daily
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Tasks Card - Neutral Indigo */}
            <GlassCard className="h-[220px]" spotlight={true}>
                <div className="p-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.3)]" />
                            <span className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">Task Manager</span>
                        </div>
                        <h3 className="text-7xl font-bold text-white/90 tracking-tight leading-none mb-2">
                            {completedTasks}<span className="text-2xl text-white/20 font-medium ml-3">/ {totalTasks || 0}</span>
                        </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.03] pt-6">
                        <span className="text-[11px] text-white/20 font-semibold tracking-wide uppercase">Progress</span>
                        <div className="px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
                            {taskPercentage}%
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Streak Card - Sky Calm */}
            <GlassCard className="h-[220px]" spotlight={true}>
                <div className="p-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]" />
                            <span className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">Daily Streak</span>
                        </div>
                        <h3 className="text-7xl font-bold text-white/90 tracking-tight leading-none mb-2">
                            {streak}<span className="text-2xl text-white/20 font-medium ml-4">Days</span>
                        </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.03] pt-6">
                        <span className="text-[11px] text-white/20 font-semibold tracking-wide uppercase">Consistency</span>
                        <div className="px-3 py-1 rounded-full bg-sky-500/5 border border-sky-500/10 text-[9px] font-bold text-sky-300 uppercase tracking-widest">
                            Live
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default StatsGroup;
