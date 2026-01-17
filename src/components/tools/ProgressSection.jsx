import React, { useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Sub-components
import FocusVelocity from './FocusVelocity';
import EfficiencyPulse from './EfficiencyPulse';
import ObjectivesProtocol from './ObjectivesProtocol';
import SessionTimeline from './SessionTimeline';

import GoalSettings from './GoalSettings';
import { getISTDate, isTodayIST } from '../../utils/dateUtils';
import { useAppStore } from '../../store';
import { Settings2 } from 'lucide-react'; // Icon for settings

const ProgressSection = ({ sessionHistory = [] }) => {
    const { goals } = useAppStore();
    const [showGoals, setShowGoals] = React.useState(false);

    // Minimal Date Header
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // -------------------------------------------------------------------------
    // Real Data Calculations
    // -------------------------------------------------------------------------

    // 1. Efficiency Calculations
    const [viewDaily, setViewDaily] = React.useState(true);

    const { dailyEff, allTimeEff } = useMemo(() => {
        // Daily
        const todaysSessions = sessionHistory.filter(s => isTodayIST(new Date(s.timestamp)));
        const dailyTotal = todaysSessions.length;
        const dailyCompleted = todaysSessions.filter(s => s.status === 'completed').length;
        const dailyEff = dailyTotal === 0 ? 100 : Math.round((dailyCompleted / dailyTotal) * 100);

        // All Time
        const total = sessionHistory.length;
        const totalCompleted = sessionHistory.filter(s => s.status === 'completed').length;
        const allTimeEff = total === 0 ? 100 : Math.round((totalCompleted / total) * 100);

        return { dailyEff, allTimeEff };
    }, [sessionHistory]);

    const displayEfficiency = viewDaily ? dailyEff : allTimeEff;

    // 2. Current Streak Calculation
    const streak = useMemo(() => {
        let currentStreak = 0;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Group sessions by date
        const sessionsByDate = new Set(
            sessionHistory
                .filter(s => s.status === 'completed')
                .map(s => new Date(s.timestamp).setHours(0, 0, 0, 0))
        );

        // Check backwards from today
        while (true) {
            if (sessionsByDate.has(todayDate.getTime())) {
                currentStreak++;
                todayDate.setDate(todayDate.getDate() - 1);
            } else {
                // Allow missing *today* if we have a streak from *yesterday*
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);

                if (currentStreak === 0 && sessionsByDate.has(yesterday.getTime())) {
                    // Missed today so far, but streak is valid from yesterday
                    currentStreak++;
                    todayDate.setDate(todayDate.getDate() - 2); // Check day before yesterday
                    continue;
                }
                break;
            }
        }
        return currentStreak;
    }, [sessionHistory]);

    // 3. Today's Focus Time (INCLUDES time from ruined sessions)
    const todayFocusTime = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const minutes = sessionHistory
            .filter(s => new Date(s.timestamp).getTime() >= startOfDay)
            .reduce((acc, curr) => {
                if (curr.status === 'completed') {
                    return acc + (curr.minutes || 0);
                } else if (curr.status === 'failed' && curr.elapsedSeconds) {
                    // Count actual time spent before session was ruined
                    return acc + Math.floor(curr.elapsedSeconds / 60);
                }
                return acc;
            }, 0);

        return { text: `${Math.floor(minutes / 60)}h ${minutes % 60}m`, minutes };
    }, [sessionHistory]);

    return (
        <div className="min-h-full w-full p-4 overflow-hidden">

            <GoalSettings isOpen={showGoals} onClose={() => setShowGoals(false)} />

            {/* Minimal Header */}
            <header className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-3xl font-semibold text-white tracking-tight">Overview</h2>
                    <p className="text-white/40 text-sm font-medium mt-1">{today}</p>
                </div>
                <div className="flex gap-4">
                    {/* Goals Button */}
                    <button
                        onClick={() => setShowGoals(true)}
                        className="liquid-badge backdrop-blur-md flex items-center gap-2 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                        <Settings2 size={14} className="text-white/60" />
                        <span>Goals</span>
                    </button>

                    {/* Soft Glass Badge */}
                    <div className="liquid-badge backdrop-blur-md flex items-center gap-2">
                        <Sparkles size={14} className="text-accent-purple" />
                        <span>Focus Mode</span>
                    </div>
                </div>
            </header>

            {/* Apple-style Grid */}
            <LayoutGroup>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">

                    {/* Main Chart - Large Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-1 md:col-span-8 h-[400px] liquid-card p-6"
                    >
                        {/* Pass goal in Minutes */}
                        <FocusVelocity data={sessionHistory} goal={Math.floor(goals.dailyFocusMinutes)} />
                    </motion.div>

                    {/* Efficiency Gauge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-1 md:col-span-4 h-[400px] liquid-card p-6 flex flex-col items-center justify-center relative"
                    >
                        <EfficiencyPulse
                            efficiency={displayEfficiency}
                            streak={streak}
                            todayFocus={todayFocusTime.text}
                            onToggle={() => setViewDaily(prev => !prev)}
                            isDaily={viewDaily}
                            targetEfficiency={goals.targetEfficiency}
                        />
                        {/* Goal Progress Bar */}
                        <div className="absolute bottom-6 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-accent-blue"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (todayFocusTime.minutes / goals.dailyFocusMinutes) * 100)}%` }}
                            />
                        </div>
                        <p className="absolute bottom-2 text-[10px] text-white/30">
                            Goal: {Math.floor(todayFocusTime.minutes / 60)}h / {Math.floor(goals.dailyFocusMinutes / 60)}h
                        </p>
                    </motion.div>

                    {/* Todo List */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-1 md:col-span-7 h-[450px] liquid-card p-6"
                    >
                        <ObjectivesProtocol />
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-1 md:col-span-5 h-[450px] liquid-card p-6"
                    >
                        <SessionTimeline sessions={sessionHistory} />
                    </motion.div>

                </div>
            </LayoutGroup>
        </div>
    );
};

export default React.memo(ProgressSection);
