/**
 * Streak Heatmap Widget
 * GitHub-style contribution graph showing daily study activity
 * 
 * Features:
 * - 12-week view (84 days)
 * - Tooltip on hover showing date and hours
 * - Intensity based on focus time
 * - Responsive design
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

// Intensity levels based on hours studied
const getIntensityLevel = (hours) => {
    if (hours === 0) return 0;
    if (hours < 1) return 1;
    if (hours < 2) return 2;
    if (hours < 4) return 3;
    return 4;
};

// Colors for each intensity level (solid fills)
const INTENSITY_COLORS = {
    0: 'bg-slate-200 dark:bg-slate-700/50',
    1: 'bg-emerald-300 dark:bg-emerald-800',
    2: 'bg-emerald-400 dark:bg-emerald-600',
    3: 'bg-emerald-500 dark:bg-emerald-500',
    4: 'bg-emerald-600 dark:bg-emerald-400',
};

const HeatmapCell = ({ date, hours, isToday }) => {
    const intensity = getIntensityLevel(hours);
    const formattedDate = format(date, 'MMM d, yyyy');
    const hoursText = hours === 0
        ? 'No activity'
        : `${hours.toFixed(1)} hours focused`;

    return (
        <Tooltip.Root delayDuration={100}>
            <Tooltip.Trigger asChild>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.random() * 0.3 }}
                    className={cn(
                        'w-3 h-3 rounded-sm cursor-pointer transition-all duration-200',
                        INTENSITY_COLORS[intensity],
                        isToday && 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900',
                        'hover:ring-2 hover:ring-slate-400 dark:hover:ring-slate-500'
                    )}
                />
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    side="top"
                    sideOffset={5}
                    className={cn(
                        'z-50 px-3 py-2 text-sm',
                        'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                        'rounded-lg shadow-lg',
                        'animate-in fade-in-0 zoom-in-95'
                    )}
                >
                    <p className="font-semibold">{formattedDate}</p>
                    <p className="text-slate-300 dark:text-slate-600">{hoursText}</p>
                    <Tooltip.Arrow className="fill-slate-900 dark:fill-white" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
};

const StreakHeatmap = ({ sessions = [] }) => {
    // Generate calendar data for the last 12 weeks
    const calendarData = useMemo(() => {
        const today = new Date();
        const weeks = [];

        // Create a map of date -> hours for quick lookup
        const hoursMap = {};
        sessions.forEach(session => {
            if (session.status === 'completed') {
                const dateKey = new Date(session.timestamp).toDateString();
                hoursMap[dateKey] = (hoursMap[dateKey] || 0) + (session.minutes || 0) / 60;
            }
        });

        // Start from 12 weeks ago, aligned to the start of week
        const startDate = startOfWeek(subDays(today, 83));

        for (let week = 0; week < 12; week++) {
            const days = [];
            for (let day = 0; day < 7; day++) {
                const currentDate = addDays(startDate, week * 7 + day);
                const dateKey = currentDate.toDateString();
                const isToday = dateKey === today.toDateString();
                const isFuture = currentDate > today;

                days.push({
                    date: currentDate,
                    hours: isFuture ? 0 : (hoursMap[dateKey] || 0),
                    isToday,
                    isFuture,
                });
            }
            weeks.push(days);
        }

        return weeks;
    }, [sessions]);

    // Calculate streak
    const currentStreak = useMemo(() => {
        const today = new Date();
        let streak = 0;
        let checkDate = new Date(today);

        const hoursMap = {};
        sessions.forEach(session => {
            if (session.status === 'completed') {
                const dateKey = new Date(session.timestamp).toDateString();
                hoursMap[dateKey] = true;
            }
        });

        // Check today first
        if (hoursMap[checkDate.toDateString()]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Then check backwards
        while (hoursMap[checkDate.toDateString()]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return streak;
    }, [sessions]);

    // Calculate total hours this week
    const weeklyHours = useMemo(() => {
        const today = new Date();
        const weekStart = startOfWeek(today);

        return sessions.reduce((total, session) => {
            const sessionDate = new Date(session.timestamp);
            if (session.status === 'completed' && sessionDate >= weekStart) {
                return total + (session.minutes || 0) / 60;
            }
            return total;
        }, 0);
    }, [sessions]);

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Tooltip.Provider>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={cn(
                    'p-6 rounded-3xl',
                    'bg-white/80 dark:bg-slate-900/80',
                    'backdrop-blur-xl',
                    'border border-slate-200/50 dark:border-white/5',
                    'shadow-lg shadow-slate-200/50 dark:shadow-none'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'p-2 rounded-xl',
                            'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
                            'dark:from-indigo-500/30 dark:to-purple-500/30'
                        )}>
                            <Flame className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Activity Streak
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Last 12 weeks
                            </p>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <div className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full',
                        'bg-gradient-to-r from-indigo-500 to-purple-600',
                        'text-white font-bold shadow-lg shadow-indigo-500/30'
                    )}>
                        <Flame className="w-4 h-4" />
                        <span>{currentStreak} day streak</span>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-1 pr-2 text-xs text-slate-400 dark:text-slate-500">
                        {DAYS.map((day, i) => (
                            <div key={day} className="h-3 flex items-center">
                                {i % 2 === 1 && <span>{day}</span>}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    {calendarData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                day.isFuture ? (
                                    <div
                                        key={dayIndex}
                                        className="w-3 h-3 rounded-sm bg-slate-50 dark:bg-slate-800/50"
                                    />
                                ) : (
                                    <HeatmapCell
                                        key={dayIndex}
                                        date={day.date}
                                        hours={day.hours}
                                        isToday={day.isToday}
                                    />
                                )
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map(level => (
                            <div
                                key={level}
                                className={cn('w-3 h-3 rounded-sm', INTENSITY_COLORS[level])}
                            />
                        ))}
                        <span>More</span>
                    </div>

                    {/* Weekly Summary */}
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-300">
                            <strong className="text-emerald-500">{weeklyHours.toFixed(1)}h</strong> this week
                        </span>
                    </div>
                </div>
            </motion.div>
        </Tooltip.Provider>
    );
};

export default StreakHeatmap;
