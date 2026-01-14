/**
 * Advanced Analytics API - Enterprise-grade insights
 * 
 * Features:
 * - Performance metrics calculation
 * - Trend analysis
 * - Predictive insights
 * - Personalized recommendations
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Helper Functions
// =============================================================================

function calculateProductivityScore(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    // Weight factors
    const COMPLETION_WEIGHT = 0.5;
    const CONSISTENCY_WEIGHT = 0.3;
    const DURATION_WEIGHT = 0.2;

    // Calculate completion rate
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const completionRate = completedSessions / sessions.length;

    // Calculate consistency (sessions per day)
    const uniqueDays = new Set(sessions.map(s => 
        new Date(s.created_at).toDateString()
    )).size;
    const consistencyScore = Math.min(uniqueDays / 7, 1); // Normalize to 0-1

    // Calculate average duration score
    const avgMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0) / sessions.length;
    const durationScore = Math.min(avgMinutes / 60, 1); // Normalize to 0-1 (60 min = perfect)

    return Math.round(
        (completionRate * COMPLETION_WEIGHT +
         consistencyScore * CONSISTENCY_WEIGHT +
         durationScore * DURATION_WEIGHT) * 100
    );
}

function calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    const sessionsByDate = sessions.reduce((acc, s) => {
        const date = new Date(s.created_at).toDateString();
        if (s.status === 'completed') {
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {});

    while (true) {
        const dateStr = checkDate.toDateString();
        if (sessionsByDate[dateStr]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (streak === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (!sessionsByDate[checkDate.toDateString()]) break;
        } else {
            break;
        }
    }

    return streak;
}

function calculateWeeklyTrend(sessions) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const twoWeeksAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = sessions.filter(s => 
        new Date(s.created_at) >= weekAgo && s.status === 'completed'
    );

    const lastWeekSessions = sessions.filter(s => 
        new Date(s.created_at) >= twoWeeksAgo && 
        new Date(s.created_at) < weekAgo && 
        s.status === 'completed'
    );

    const thisWeekMinutes = thisWeekSessions.reduce((acc, s) => acc + s.minutes, 0);
    const lastWeekMinutes = lastWeekSessions.reduce((acc, s) => acc + s.minutes, 0);

    if (lastWeekMinutes === 0) return thisWeekMinutes > 0 ? 100 : 0;

    return Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100);
}

function generateRecommendations(sessions, todos) {
    const recommendations = [];

    // Analyze session patterns
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgDuration = completedSessions.length > 0
        ? completedSessions.reduce((acc, s) => acc + s.minutes, 0) / completedSessions.length
        : 0;

    // Duration recommendation
    if (avgDuration < 25) {
        recommendations.push({
            type: 'duration',
            priority: 'high',
            message: 'Try increasing your focus sessions to 25-45 minutes for better deep work.',
            action: 'increase_duration'
        });
    }

    // Frequency recommendation
    const uniqueDays = new Set(completedSessions.map(s => 
        new Date(s.created_at).toDateString()
    )).size;

    if (uniqueDays < 5) {
        recommendations.push({
            type: 'frequency',
            priority: 'medium',
            message: 'Aim for at least 5 focused days per week to build a consistent habit.',
            action: 'increase_frequency'
        });
    }

    // Todo recommendation
    const pendingTodos = todos.filter(t => !t.completed);
    if (pendingTodos.length > 10) {
        recommendations.push({
            type: 'tasks',
            priority: 'high',
            message: 'You have many pending tasks. Consider prioritizing and breaking them down.',
            action: 'prioritize_tasks'
        });
    }

    return recommendations;
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        if (req.method === 'GET') {
            const timeRange = req.query.range || '30d'; // 7d, 30d, 90d, all

            // Calculate date range
            const startDate = timeRange === 'all' 
                ? new Date('1970-01-01')
                : new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

            // Fetch sessions within range
            const [sessions] = await db.execute(
                `SELECT id, type, minutes, elapsed_seconds, status, created_at 
                 FROM pomodoro_sessions 
                 WHERE created_at >= ?
                 ORDER BY created_at DESC`,
                [startDate]
            );

            // Fetch todos
            const [todos] = await db.execute(
                'SELECT id, text, completed, created_at FROM todos'
            );

            // Calculate metrics
            const productivityScore = calculateProductivityScore(sessions);
            const currentStreak = calculateStreak(sessions);
            const weeklyTrend = calculateWeeklyTrend(sessions);
            const recommendations = generateRecommendations(sessions, todos);

            // Calculate daily focus time
            const dailyFocusTime = {};
            sessions.forEach(session => {
                if (session.status === 'completed') {
                    const date = new Date(session.created_at).toDateString();
                    dailyFocusTime[date] = (dailyFocusTime[date] || 0) + session.minutes;
                }
            });

            // Calculate completion rate
            const totalSessions = sessions.length;
            const completedSessions = sessions.filter(s => s.status === 'completed').length;
            const completionRate = totalSessions > 0 
                ? Math.round((completedSessions / totalSessions) * 100) 
                : 0;

            // Calculate total focus time
            const totalFocusMinutes = sessions
                .filter(s => s.status === 'completed')
                .reduce((acc, s) => acc + s.minutes, 0);

            // Calculate average session duration
            const avgSessionDuration = completedSessions > 0
                ? Math.round(totalFocusMinutes / completedSessions)
                : 0;

            return res.status(200).json({
                productivityScore,
                currentStreak,
                weeklyTrend,
                completionRate,
                totalFocusMinutes,
                avgSessionDuration,
                dailyFocusTime,
                recommendations,
                timeRange,
                generatedAt: new Date().toISOString()
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[Analytics API] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate analytics',
            message: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
}
