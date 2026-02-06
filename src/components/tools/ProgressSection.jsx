import React, { useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Sub-components
import FocusVelocity from './FocusVelocity';
import EfficiencyPulse from './EfficiencyPulse';
import ObjectivesProtocol from './ObjectivesProtocol';
import TodayTimeline from './TodayTimeline';
import StudyCalendar from './StudyCalendar';

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

    // 1. Efficiency Calculations - Improved with weighted scoring
    const [viewDaily, setViewDaily] = React.useState(true);

    const { dailyEff, allTimeEff, dailyStats, allTimeStats } = useMemo(() => {
        // Helper function to calculate efficiency with weighted scoring
        const calculateEfficiency = (sessions) => {
            if (!sessions || sessions.length === 0) return { efficiency: 100, total: 0, completed: 0, failed: 0, totalMinutes: 0 };

            const total = sessions.length;
            const completed = sessions.filter(s => s.status === 'completed').length;
            const failed = sessions.filter(s => s.status === 'failed').length;
            
            // Calculate weighted efficiency based on completion rate and time utilization
            const completionRate = total === 0 ? 1 : completed / total;
            
            // Calculate total minutes (including partial from failed sessions)
            const totalMinutes = sessions.reduce((acc, s) => {
                if (s.status === 'completed') {
                    return acc + (s.minutes || 0);
                } else if (s.status === 'failed' && s.elapsedSeconds) {
                    return acc + Math.floor(s.elapsedSeconds / 60);
                }
                return acc;
            }, 0);

            // Calculate intended minutes (what was planned)
            const intendedMinutes = sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
            
            // Time utilization rate (actual time spent vs intended time)
            const timeUtilization = intendedMinutes === 0 ? 1 : Math.min(1, totalMinutes / intendedMinutes);
            
            // Weighted efficiency: 70% completion rate, 30% time utilization
            const efficiency = Math.round((completionRate * 0.7 + timeUtilization * 0.3) * 100);

            return { 
                efficiency, 
                total, 
                completed, 
                failed, 
                totalMinutes,
                completionRate: Math.round(completionRate * 100),
                timeUtilization: Math.round(timeUtilization * 100)
            };
        };

        // Daily efficiency
        const todaysSessions = sessionHistory.filter(s => isTodayIST(new Date(s.timestamp)));
        const dailyStats = calculateEfficiency(todaysSessions);
        const dailyEff = dailyStats.efficiency;

        // All time efficiency
        const allTimeStats = calculateEfficiency(sessionHistory);
        const allTimeEff = allTimeStats.efficiency;

        return { dailyEff, allTimeEff, dailyStats, allTimeStats };
    }, [sessionHistory]);

    const displayEfficiency = viewDaily ? dailyEff : allTimeEff;

    // 2. Current Streak Calculation - Production Ready
    const streak = useMemo(() => {
        if (!sessionHistory || sessionHistory.length === 0) return 0;

        let currentStreak = 0;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Group sessions by date using IST for consistency
        const sessionsByDate = new Map();
        sessionHistory
            .filter(s => s.status === 'completed')
            .forEach(s => {
                const date = new Date(s.timestamp);
                const dateKey = date.toDateString();
                if (!sessionsByDate.has(dateKey)) {
                    sessionsByDate.set(dateKey, 0);
                }
                sessionsByDate.set(dateKey, sessionsByDate.get(dateKey) + 1);
            });

        // Check backwards from today
        let checkDate = new Date(todayDate);
        let foundToday = false;

        while (true) {
            const dateKey = checkDate.toDateString();
            if (sessionsByDate.has(dateKey)) {
                currentStreak++;
                foundToday = true;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // Allow missing today if we have a streak from yesterday
                if (!foundToday && currentStreak === 0) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const yesterdayKey = checkDate.toDateString();
                    if (sessionsByDate.has(yesterdayKey)) {
                        currentStreak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                        continue;
                    }
                }
                break;
            }
        }
        return currentStreak;
    }, [sessionHistory]);

    // 3. Today's Focus Time - Production Ready (INCLUDES time from failed sessions)
    const todayFocusTime = useMemo(() => {
        if (!sessionHistory || sessionHistory.length === 0) {
            return { text: '0h 0m', minutes: 0 };
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const minutes = sessionHistory
            .filter(s => {
                const sessionDate = new Date(s.timestamp);
                return sessionDate.getTime() >= startOfDay && isTodayIST(sessionDate);
            })
            .reduce((acc, curr) => {
                if (curr.status === 'completed') {
                    return acc + (curr.minutes || 0);
                } else if (curr.status === 'failed' && curr.elapsedSeconds) {
                    // Count actual time spent before session was failed
                    return acc + Math.floor(curr.elapsedSeconds / 60);
                }
                return acc;
            }, 0);

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { text: `${hours}h ${mins}m`, minutes };
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
                        className="col-span-1 md:col-span-4 h-[400px] liquid-card p-6 flex flex-col items-center justify-center"
                    >
                        <EfficiencyPulse
                            efficiency={displayEfficiency}
                            streak={streak}
                            todayFocus={todayFocusTime.text}
                            onToggle={() => setViewDaily(prev => !prev)}
                            isDaily={viewDaily}
                            targetEfficiency={goals.targetEfficiency}
                        />
                    </motion.div>

                    {/* Daily Goal Progress Card - Separate */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-1 md:col-span-12 h-[120px] liquid-card p-6"
                    >
                        <div className="flex flex-col h-full justify-center">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                                    <span className="text-[13px] font-medium text-white/70 uppercase tracking-wide">Daily Goal Progress</span>
                                </div>
                                <span className="text-[13px] font-semibold text-white">
                                    {Math.floor(todayFocusTime.minutes / 60)}h {todayFocusTime.minutes % 60}m / {Math.floor(goals.dailyFocusMinutes / 60)}h {goals.dailyFocusMinutes % 60}m
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        (todayFocusTime.minutes / goals.dailyFocusMinutes) >= 1
                                            ? 'bg-emerald-400'
                                            : 'bg-accent-blue'
                                    }`}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${Math.min(100, (todayFocusTime.minutes / goals.dailyFocusMinutes) * 100)}%` }}
                                    key={`progress-${todayFocusTime.minutes}`}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    style={{ minWidth: '0%' }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[11px] text-white/40">
                                    {Math.round((todayFocusTime.minutes / goals.dailyFocusMinutes) * 100)}% completed
                                </span>
                                <span className="text-[11px] text-white/40">
                                    {Math.max(0, goals.dailyFocusMinutes - todayFocusTime.minutes)} minutes remaining
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Study Calendar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-1 md:col-span-12 liquid-card p-6"
                    >
                        <div className="mb-4">
                            <h3 className="text-[13px] font-medium text-white/70 uppercase tracking-wide">Study Calendar</h3>
                            <p className="text-[11px] text-white/40 mt-1">Color indicates daily goal achievement percentage</p>
                        </div>
                        <StudyCalendar goalMinutes={goals.dailyFocusMinutes} />
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
                        <TodayTimeline sessions={sessionHistory} />
                    </motion.div>

                </div>
            </LayoutGroup>
        </div>
    );
};

export default React.memo(ProgressSection);
