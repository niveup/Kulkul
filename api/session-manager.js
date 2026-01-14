/**
 * Intelligent Session Management API
 * 
 * Features:
 * - Smart session recommendations
 * - Optimal timing suggestions
 * - Break time optimization
 * - Focus pattern analysis
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const OPTIMAL_SESSION_LENGTHS = [25, 45, 60]; // Standard Pomodoro lengths
const BREAK_RATIOS = { short: 0.2, long: 0.5 }; // Break time as ratio of session

// =============================================================================
// Helper Functions
// =============================================================================

function analyzeFocusPatterns(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            bestTimeOfDay: null,
            bestDayOfWeek: null,
            avgSessionLength: 25,
            completionRate: 0
        };
    }

    // Analyze by hour of day
    const hourlyPerformance = {};
    sessions.forEach(session => {
        if (session.status !== 'completed') return;

        const hour = new Date(session.created_at).getHours();
        if (!hourlyPerformance[hour]) {
            hourlyPerformance[hour] = { total: 0, completed: 0, minutes: 0 };
        }
        hourlyPerformance[hour].total++;
        hourlyPerformance[hour].completed++;
        hourlyPerformance[hour].minutes += session.minutes;
    });

    // Find best performing hour
    let bestHour = null;
    let bestHourScore = -1;
    Object.entries(hourlyPerformance).forEach(([hour, data]) => {
        const score = (data.completed / data.total) * data.minutes;
        if (score > bestHourScore) {
            bestHourScore = score;
            bestHour = parseInt(hour);
        }
    });

    // Analyze by day of week
    const dailyPerformance = {};
    sessions.forEach(session => {
        if (session.status !== 'completed') return;

        const day = new Date(session.created_at).getDay();
        if (!dailyPerformance[day]) {
            dailyPerformance[day] = { total: 0, completed: 0, minutes: 0 };
        }
        dailyPerformance[day].total++;
        dailyPerformance[day].completed++;
        dailyPerformance[day].minutes += session.minutes;
    });

    // Find best performing day
    let bestDay = null;
    let bestDayScore = -1;
    Object.entries(dailyPerformance).forEach(([day, data]) => {
        const score = (data.completed / data.total) * data.minutes;
        if (score > bestDayScore) {
            bestDayScore = score;
            bestDay = parseInt(day);
        }
    });

    // Calculate average session length
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgSessionLength = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((acc, s) => acc + s.minutes, 0) / completedSessions.length)
        : 25;

    // Calculate overall completion rate
    const completionRate = sessions.length > 0
        ? Math.round((completedSessions.length / sessions.length) * 100)
        : 0;

    return {
        bestTimeOfDay: bestHour,
        bestDayOfWeek: bestDay,
        avgSessionLength,
        completionRate
    };
}

function recommendSessionLength(patterns) {
    // If completion rate is low, suggest shorter sessions
    if (patterns.completionRate < 60) {
        return 25;
    }

    // If average session is already optimal, maintain it
    if (OPTIMAL_SESSION_LENGTHS.includes(patterns.avgSessionLength)) {
        return patterns.avgSessionLength;
    }

    // Find closest optimal length
    return OPTIMAL_SESSION_LENGTHS.reduce((prev, curr) => 
        Math.abs(curr - patterns.avgSessionLength) < Math.abs(prev - patterns.avgSessionLength) 
            ? curr 
            : prev
    );
}

function calculateOptimalBreakTime(sessionLength, recentSessions) {
    // Check if user has completed multiple sessions recently
    const completedInLast2Hours = recentSessions.filter(s => {
        const sessionTime = new Date(s.created_at).getTime();
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
        return sessionTime >= twoHoursAgo && s.status === 'completed';
    }).length;

    // Long break after 4 sessions
    if (completedInLast2Hours >= 4) {
        return Math.round(sessionLength * BREAK_RATIOS.long);
    }

    // Short break otherwise
    return Math.round(sessionLength * BREAK_RATIOS.short);
}

function generateFocusInsights(sessions) {
    const insights = [];

    if (!sessions || sessions.length === 0) {
        return [{
            type: 'getting_started',
            message: 'Start your first focus session to begin tracking your patterns!'
        }];
    }

    const patterns = analyzeFocusPatterns(sessions);

    // Time of day insight
    if (patterns.bestTimeOfDay !== null) {
        const hour = patterns.bestTimeOfDay;
        const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        insights.push({
            type: 'best_time',
            message: `You perform best in the ${period} (${hour}:00). Schedule important tasks then!`,
            data: { hour: patterns.bestTimeOfDay }
        });
    }

    // Day of week insight
    if (patterns.bestDayOfWeek !== null) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        insights.push({
            type: 'best_day',
            message: `${days[patterns.bestDayOfWeek]} is your most productive day.`,
            data: { day: patterns.bestDayOfWeek }
        });
    }

    // Session length insight
    if (patterns.completionRate < 70) {
        insights.push({
            type: 'session_length',
            message: 'Consider shorter sessions to improve your completion rate.',
            data: { currentRate: patterns.completionRate }
        });
    }

    return insights;
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        if (req.method === 'GET') {
            // Fetch recent sessions (last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const [sessions] = await db.execute(
                `SELECT id, type, minutes, elapsed_seconds, status, created_at 
                 FROM pomodoro_sessions 
                 WHERE created_at >= ?
                 ORDER BY created_at DESC`,
                [thirtyDaysAgo]
            );

            // Analyze patterns
            const patterns = analyzeFocusPatterns(sessions);

            // Generate recommendations
            const recommendedLength = recommendSessionLength(patterns);
            const optimalBreakTime = calculateOptimalBreakTime(recommendedLength, sessions);
            const insights = generateFocusInsights(sessions);

            // Calculate next optimal session time
            let nextOptimalTime = null;
            if (patterns.bestTimeOfDay !== null) {
                const now = new Date();
                const optimalHour = patterns.bestTimeOfDay;

                if (now.getHours() < optimalHour) {
                    // Best time is today
                    nextOptimalTime = new Date(now);
                    nextOptimalTime.setHours(optimalHour, 0, 0, 0);
                } else if (patterns.bestDayOfWeek !== null && now.getDay() !== patterns.bestDayOfWeek) {
                    // Best day is different
                    const daysUntilBest = (patterns.bestDayOfWeek + 7 - now.getDay()) % 7 || 7;
                    nextOptimalTime = new Date(now);
                    nextOptimalTime.setDate(now.getDate() + daysUntilBest);
                    nextOptimalTime.setHours(optimalHour, 0, 0, 0);
                }
            }

            return res.status(200).json({
                patterns,
                recommendations: {
                    sessionLength: recommendedLength,
                    breakTime: optimalBreakTime,
                    nextOptimalTime: nextOptimalTime?.toISOString()
                },
                insights,
                generatedAt: new Date().toISOString()
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[Session Manager API] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate session recommendations',
            message: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
}
