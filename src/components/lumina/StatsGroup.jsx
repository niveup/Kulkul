import React from 'react';
import { motion } from 'framer-motion';
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
            {/* Focus Card - Warm Amber (Deep Glow) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <GlassCard className="h-[240px] group relative overflow-hidden" spotlight={true}>
                    <div className="p-10 h-full flex flex-col justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-amber-400 blur-[4px]"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase font-mono">Focus Orbit</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-7xl font-bold text-white tracking-tighter"
                                >
                                    {hours}
                                </motion.span>
                                <span className="text-2xl text-white/20 font-medium tracking-tight">h</span>
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-7xl font-bold text-white tracking-tighter ml-2"
                                >
                                    {minutes}
                                </motion.span>
                                <span className="text-2xl text-white/20 font-medium tracking-tight">m</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.05] pt-8">
                            <span className="text-[10px] text-white/20 font-bold tracking-[0.1em] uppercase">Time Logged</span>
                            <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-300 uppercase tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                                Session Live
                            </div>
                        </div>
                    </div>
                    {/* Background Detail */}
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-amber-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </GlassCard>
            </motion.div>

            {/* Tasks Card - Ethereal Indigo */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <GlassCard className="h-[240px] group relative overflow-hidden" spotlight={true}>
                    <div className="p-10 h-full flex flex-col justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-indigo-400 blur-[4px]"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase font-mono">Sync Progress</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-7xl font-bold text-white tracking-tighter"
                                >
                                    {completedTasks}
                                </motion.span>
                                <span className="text-3xl text-white/10 font-light tracking-tighter mx-1">/</span>
                                <span className="text-4xl text-white/20 font-semibold tracking-tighter">{totalTasks}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.05] pt-8">
                            <span className="text-[10px] text-white/20 font-bold tracking-[0.1em] uppercase">Efficiency</span>
                            <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest shadow-[0_0_15px_rgba(129,140,248,0.1)]">
                                {taskPercentage}% Mastery
                            </div>
                        </div>
                    </div>
                    {/* Background Detail */}
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </GlassCard>
            </motion.div>

            {/* Streak Card - Sky Vitality */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <GlassCard className="h-[240px] group relative overflow-hidden" spotlight={true}>
                    <div className="p-10 h-full flex flex-col justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                    <motion.div
                                        animate={{ scale: [1, 2, 1], opacity: [0.3, 0.5, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-sky-400 blur-[4px]"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase font-mono">Daily Momentum</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-7xl font-bold text-white tracking-tighter"
                                >
                                    {streak}
                                </motion.span>
                                <span className="text-2xl text-white/20 font-medium tracking-tight uppercase">Days</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.05] pt-8">
                            <span className="text-[10px] text-white/20 font-bold tracking-[0.1em] uppercase">Status</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                                <div className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" />
                                <span className="text-[9px] font-black text-sky-300 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                    {/* Background Detail */}
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-sky-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default StatsGroup;
