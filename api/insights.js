/**
 * Intelligent Insights API
 * 
 * Features:
 * - Comprehensive analytics aggregation
 * - AI-powered recommendations
 * - Predictive insights
 * - Personalized action items
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const INSIGHT_CATEGORIES = {
    PRODUCTIVITY: 'productivity',
    HABITS: 'habits',
    GOALS: 'goals',
    OPTIMIZATION: 'optimization'
};

const PRIORITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

// =============================================================================
// Helper Functions
// =============================================================================

function calculateProductivityMetrics(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            score: 0,
            trend: 'stable',
            totalMinutes: 0,
            completionRate: 0,
            avgSessionLength: 0
        };
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalMinutes = completedSessions.reduce((acc, s) => acc + s.minutes, 0);
    const completionRate = sessions.length > 0 
        ? Math.round((completedSessions.length / sessions.length) * 100) 
        : 0;
    const avgSessionLength = completedSessions.length > 0
        ? Math.round(totalMinutes / completedSessions.length)
        : 0;

    // Calculate productivity score (0-100)
    const score = Math.round(
        (completionRate * 0.5) +
        (Math.min(totalMinutes / 300, 1) * 100 * 0.3) + // 5 hours = perfect
        (Math.min(avgSessionLength / 45, 1) * 100 * 0.2) // 45 min = perfect
    );

    // Calculate trend
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekMinutes = completedSessions
        .filter(s => new Date(s.created_at) >= thisWeek)
        .reduce((acc, s) => acc + s.minutes, 0);

    const lastWeekMinutes = completedSessions
        .filter(s => new Date(s.created_at) >= lastWeek && new Date(s.created_at) < thisWeek)
        .reduce((acc, s) => acc + s.minutes, 0);

    let trend = 'stable';
    if (thisWeekMinutes > lastWeekMinutes * 1.2) {
        trend = 'improving';
    } else if (thisWeekMinutes < lastWeekMinutes * 0.8) {
        trend = 'declining';
    }

    return {
        score,
        trend,
        totalMinutes,
        completionRate,
        avgSessionLength
    };
}

function calculateHabitMetrics(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            consistencyScore: 0,
            bestDay: null,
            bestTime: null
        };
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');

    // Calculate streaks
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);

    const sessionsByDate = completedSessions.reduce((acc, s) => {
        const date = new Date(s.created_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    while (true) {
        const dateStr = checkDate.toDateString();
        if (sessionsByDate[dateStr]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (currentStreak === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (!sessionsByDate[checkDate.toDateString()]) break;
        } else {
            break;
        }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const dates = Object.keys(sessionsByDate).sort();

    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) 暂时先不继续了，继续生成剩余内容
