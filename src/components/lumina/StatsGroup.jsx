/**
 * StatsGroup Component - Ported from Lumina OS
 * Three stat cards: Focus Time, Tasks, Streak
 * Wired to real data from props with dynamic graphs
 */

import React, { useMemo } from 'react';
import { Clock, CheckCircle2, Flame, MoreHorizontal } from 'lucide-react';
import { GlassCard } from './GlassCard';

/**
 * Helper: Get focus time data for the last 7 days
 * Returns array of { date, minutes } objects
 */
const getLast7DaysFocusData = (sessions = []) => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const dayMinutes = sessions.reduce((acc, session) => {
            const sessionDate = new Date(session.timestamp).toDateString();
            if (sessionDate === dateStr) {
                if (session.status === 'completed') {
                    return acc + (session.minutes || 0);
                } else if (session.status === 'failed' && session.elapsedSeconds) {
                    return acc + Math.floor(session.elapsedSeconds / 60);
                }
            }
            return acc;
        }, 0);

        data.push({ date: dateStr, minutes: dayMinutes });
    }

    return data;
};

/**
 * Helper: Generate smooth SVG wave path from data points
 * Uses bezier curves for smooth wave effect
 */
const generateWavePath = (data, width = 300, height = 100, padding = 10) => {
    if (!data || data.length === 0) {
        return { linePath: `M0,${height - padding}`, areaPath: `M0,${height - padding} V${height} H0 Z` };
    }

    const maxValue = Math.max(...data.map(d => d.minutes), 1); // Avoid division by 0
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - padding - ((d.minutes / maxValue) * (height - 2 * padding))
    }));

    // If all values are 0, show a flat line at the bottom
    if (maxValue === 0 || data.every(d => d.minutes === 0)) {
        const y = height - padding;
        return {
            linePath: `M0,${y} L${width},${y}`,
            areaPath: `M0,${y} L${width},${y} V${height} H0 Z`
        };
    }

    // Generate smooth bezier curve
    let linePath = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midX = (curr.x + next.x) / 2;

        linePath += ` C${midX},${curr.y} ${midX},${next.y} ${next.x},${next.y}`;
    }

    const areaPath = `${linePath} V${height} H0 Z`;

    return { linePath, areaPath };
};

/**
 * Helper: Get streak data for the last 8 days
 * Shows cumulative streak building up
 */
const getStreakGraphData = (sessions = [], currentStreak = 0) => {
    const data = [];
    const today = new Date();

    // Create a map of dates with completed sessions
    const sessionsByDate = sessions.reduce((acc, s) => {
        if (s.status === 'completed') {
            const date = new Date(s.timestamp).toDateString();
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {});

    // Calculate running streak for each of the last 8 days
    for (let i = 7; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        // Check if there was activity on this day
        const hadActivity = sessionsByDate[dateStr] > 0;

        // Calculate what the streak was on that day
        let streakOnDay = 0;
        if (hadActivity) {
            // Count consecutive days ending on this date
            let checkDate = new Date(date);
            while (sessionsByDate[checkDate.toDateString()]) {
                streakOnDay++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        data.push({
            date: dateStr,
            streak: streakOnDay,
            hadActivity
        });
    }

    return data;
};

/**
 * Helper: Generate line graph points from streak data
 */
const generateStreakPath = (data, width = 300, height = 100, padding = 10) => {
    if (!data || data.length === 0) {
        return { points: `0,${height - padding}`, areaPath: `M0,${height - padding} V${height} H0 Z` };
    }

    const maxStreak = Math.max(...data.map(d => d.streak), 1);
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
        const x = i * stepX;
        const y = height - padding - ((d.streak / maxStreak) * (height - 2 * padding));
        return `${x},${y}`;
    }).join(' ');

    // Generate area path
    const firstY = height - padding - ((data[0].streak / maxStreak) * (height - 2 * padding));
    let areaPath = `M0,${firstY}`;

    data.forEach((d, i) => {
        const x = i * stepX;
        const y = height - padding - ((d.streak / maxStreak) * (height - 2 * padding));
        areaPath += ` L${x},${y}`;
    });

    areaPath += ` V${height} H0 Z`;

    return { points, areaPath };
};

export const StatsGroup = ({
    focusTime = 0, // in minutes
    completedTasks = 0,
    totalTasks = 0,
    streak = 0,
    sessions = [] // NEW: Accept sessions for dynamic graphs
}) => {
    // Format focus time
    const hours = Math.floor(focusTime / 60);
    const minutes = Math.round(focusTime % 60);

    // Calculate task percentage
    const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const strokeDashoffset = 201 - (201 * taskPercentage / 100); // 201 = 2 * PI * 32

    // Generate dynamic Focus Time graph data
    const focusGraphData = useMemo(() => getLast7DaysFocusData(sessions), [sessions]);
    const { linePath: focusLinePath, areaPath: focusAreaPath } = useMemo(
        () => generateWavePath(focusGraphData),
        [focusGraphData]
    );

    // Generate dynamic Streak graph data
    const streakGraphData = useMemo(() => getStreakGraphData(sessions, streak), [sessions, streak]);
    const { points: streakPoints, areaPath: streakAreaPath } = useMemo(
        () => generateStreakPath(streakGraphData),
        [streakGraphData]
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Focus Card - Dynamic Wave Graph */}
            <GlassCard className="relative overflow-hidden h-[200px] flex flex-col justify-between p-0 group border border-white/5">
                {/* Background Neon Glow */}
                <div className="absolute top-[-50%] left-[20%] w-[200px] h-[200px] bg-violet-600/20 blur-[80px] rounded-full pointer-events-none mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-[-50%] left-[20%] w-[200px] h-[200px] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="p-6 pb-0 z-10 relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                                <Clock size={14} />
                            </div>
                            <span className="text-xs font-semibold text-white/50 tracking-wider uppercase">Focus Time</span>
                        </div>
                        <button className="text-white/20 hover:text-white transition-colors" title="Last 7 days">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <h3 className="text-4xl font-medium text-white tracking-tight drop-shadow-lg">
                        {hours}<span className="text-xl text-white/40 font-light ml-0.5">h</span> {minutes}<span className="text-xl text-white/40 font-light ml-0.5">m</span>
                    </h3>
                    <p className="text-xs text-white/30 mt-1">Today's focus</p>
                </div>

                {/* Dynamic Wave Graph - Last 7 Days */}
                <div className="relative w-full h-28 mt-auto translate-y-2">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={focusAreaPath}
                            fill="url(#focusGradient)"
                            className="transition-all duration-500"
                        />
                        <path
                            d={focusLinePath}
                            fill="none"
                            stroke="rgb(167, 139, 250)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all duration-500"
                        />
                    </svg>
                </div>
            </GlassCard>

            {/* Tasks Card - Circular Progress Graph */}
            <GlassCard className="relative overflow-hidden h-[200px] flex flex-col p-6 group border border-white/5">
                {/* Background Neon Glow */}
                <div className="absolute bottom-[-20%] right-[-20%] w-[150px] h-[150px] bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex justify-between items-start z-10 relative mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                            <CheckCircle2 size={14} />
                        </div>
                        <span className="text-xs font-semibold text-white/50 tracking-wider uppercase">Tasks</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                        {taskPercentage === 100 ? 'Complete!' : taskPercentage > 50 ? 'On Track' : 'In Progress'}
                    </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <h3 className="text-4xl font-medium text-white tracking-tight drop-shadow-lg">
                            {completedTasks}<span className="text-xl text-white/40 font-light ml-0.5">/{totalTasks}</span>
                        </h3>
                        <p className="text-xs text-white/30 mt-1 font-medium">
                            {taskPercentage === 100 ? 'All daily goals met' : `${taskPercentage}% complete`}
                        </p>
                    </div>

                    {/* Circular Graph */}
                    <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                            <circle
                                cx="40" cy="40" r="32"
                                stroke="rgb(52, 211, 153)"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray="201"
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] transition-all duration-700"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{taskPercentage}%</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Streak Card - Dynamic Line Chart */}
            <GlassCard className="relative overflow-hidden h-[200px] flex flex-col justify-between p-0 group border border-white/5">
                {/* Background Neon Glow */}
                <div className="absolute top-[20%] right-[10%] w-[180px] h-[180px] bg-orange-500/10 blur-[70px] rounded-full pointer-events-none mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="p-6 pb-0 z-10 relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.15)]">
                                <Flame size={14} />
                            </div>
                            <span className="text-xs font-semibold text-white/50 tracking-wider uppercase">Streak</span>
                        </div>
                    </div>
                    <h3 className="text-4xl font-medium text-white tracking-tight drop-shadow-lg">
                        {streak} <span className="text-xl text-white/40 font-light">days</span>
                    </h3>
                    <p className="text-xs text-white/30 mt-1">Current streak</p>
                </div>

                {/* Dynamic Line Graph - Streak History */}
                <div className="relative w-full h-28 mt-auto flex items-end translate-y-1">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={streakAreaPath}
                            fill="url(#streakGradient)"
                            className="transition-all duration-500"
                        />
                        <polyline
                            points={streakPoints}
                            fill="none"
                            stroke="rgb(251, 146, 60)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_0_10px_rgba(251,146,60,0.6)] transition-all duration-500"
                        />
                    </svg>
                </div>
            </GlassCard>
        </div>
    );
};

export default StatsGroup;
