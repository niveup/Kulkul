/**
 * Performance Optimization API
 * 
 * Features:
 * - Performance metrics tracking
 * - Bottleneck identification
 * - Optimization recommendations
 * - Resource utilization analysis
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const PERFORMANCE_THRESHOLDS = {
    responseTime: {
        excellent: 200,  // ms
        good: 500,       // ms
        fair: 1000,      // ms
        poor: 2000       // ms
    },
    completionRate: {
        excellent: 90,
        good: 75,
        fair: 60,
        poor: 40
    },
    streak: {
        excellent: 30,
        good: 14,
        fair: 7,
        poor: 3
    }
};

// =============================================================================
// Helper Functions
// =============================================================================

function calculateResponseTimeMetrics(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            average: 0,
            median: 0,
            p95: 0,
            p99: 0
        };
    }

    const times = sessions.map(s => s.elapsed_seconds || 0).sort((a, b) => a - b);

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const median = times[Math.floor(times.length / 2)];
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];

    return {
        average: Math.round(average),
        median: Math.round(median),
        p95: Math.round(p95),
        p99: Math.round(p99)
    };
}

function calculateCompletionRate(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const completed = sessions.filter(s => s.status === 'completed').length;
    return Math.round((completed / sessions.length) * 100);
}

function calculateStreakMetrics(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            current: 0,
            longest: 0,
            average: 0
        };
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) {
        return { current: 0, longest: 0, average: 0 };
    }

    // Calculate current streak
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

            if (diffDays === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate average streak
    const streaks = [];
    tempStreak = 0;
    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                tempStreak++;
            } else {
                streaks.push(tempStreak);
                tempStreak = 1;
            }
        }
    }
    streaks.push(tempStreak);

    const averageStreak = streaks.length > 0 
        ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length)
        : 0;

    return {
        current: currentStreak,
        longest: longestStreak,
        average: averageStreak
    };
}

function identifyBottlenecks(sessions, todos) {
    const bottlenecks = [];

    // Check completion rate
    const completionRate = calculateCompletionRate(sessions);
    if (completionRate < PERFORMANCE_THRESHOLDS.completionRate.fair) {
        bottlenecks.push({
            type: 'completion_rate',
            severity: completionRate < PERFORMANCE_THRESHOLDS.completionRate.poor ? 'high' : 'medium',
            message: `Low completion rate (${completionRate}%). Consider shorter sessions or better task planning.`,
            metric: completionRate,
            threshold: PERFORMANCE_THRESHOLDS.completionRate.fair
        });
    }

    // Check task overload
    const pendingTodos = todos.filter(t => !t.completed);
    if (pendingTodos.length > 15) {
        bottlenecks.push({
            type: 'task_overload',
            severity: pendingTodos.length > 25 ? 'high' : 'medium',
            message: `Too many pending tasks (${pendingTodos.length}). Focus on completing existing tasks before adding new ones.`,
            metric: pendingTodos.length,
            threshold: 15
        });
    }

    // Check streak consistency
    const streakMetrics = calculateStreakMetrics(sessions);
    if (streakMetrics.current < 3 && streakMetrics.longest > 7) {
        bottlenecks.push({
            type: 'streak_inconsistency',
            severity: 'medium',
            message: 'Your current streak is much lower than your best. Try to maintain consistency.',
            metric: streakMetrics.current,
            threshold: 3,
            context: { longest: streakMetrics.longest }
        });
    }

    return bottlenecks;
}

function generateOptimizationRecommendations(bottlenecks, metrics) {
    const recommendations = [];

    bottlenecks.forEach(bottleneck => {
        switch (bottleneck.type) {
            case 'completion_rate':
                recommendations.push({
                    type: 'session_optimization',
                    priority: bottleneck.severity,
                    title: 'Improve Session Completion',
                    actions: [
                        'Start with shorter sessions (25 minutes)',
                        'Break down complex tasks into smaller ones',
                        'Eliminate distractions during focus time',
                        'Set clear, achievable goals for each session'
                    ]
                });
                break;

            case 'task_overload':
                recommendations.push({
                    type: 'task_management',
                    priority: bottleneck.severity,
                    title: 'Optimize Task Management',
                    actions: [
                        'Prioritize tasks using Eisenhower Matrix',
                        'Delegate or postpone low-priority tasks',
                        'Focus on completing 2-3 important tasks daily',
                        'Review and remove outdated tasks weekly'
                    ]
                });
                break;

            case 'streak_inconsistency':
                recommendations.push({
                    type: 'habit_building',
                    priority: bottleneck.severity,
                    title: 'Build Consistent Habits',
                    actions: [
                        'Set a fixed time for daily focus sessions',
                        'Start with shorter sessions if needed',
                        'Use reminders and notifications',
                        'Track progress and celebrate small wins'
                    ]
                });
                break;
        }
    });

    // General recommendations if no bottlenecks
    if (recommendations.length === 0) {
        if (metrics.completionRate > PERFORMANCE_THRESHOLDS.completionRate.good) {
            recommendations.push({
                type: 'advanced_optimization',
                priority: 'low',
                title: 'Advanced Optimization',
                actions: [
                    'Experiment with longer focus sessions (45-60 minutes)',
                    'Try different time management techniques',
                    'Share your progress with peers for accountability',
                    'Consider teaching or mentoring others'
                ]
            });
        }
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
            // Fetch sessions (last 90 days)
            const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const [sessions] = await db.execute(
                `SELECT id, type, minutes, elapsed_seconds, status, created_at 
                 FROM pomodoro_sessions 
                 WHERE created_at >= ?
                 ORDER BY created_at DESC`,
                [ninetyDaysAgo]
            );

            // Fetch todos
            const [todos] = await db.execute(
                'SELECT id, text, completed, created_at FROM todos'
            );

            // Calculate metrics
            const responseTimeMetrics = calculateResponseTimeMetrics(sessions);
            const completionRate = calculateCompletionRate(sessions);
            const streakMetrics = calculateStreakMetrics(sessions);

            // Identify bottlenecks
            const bottlenecks = identifyBottlenecks(sessions, todos);

            // Generate recommendations
            const recommendations = generateOptimizationRecommendations(bottlenecks, {
                completionRate,
                streak: streakMetrics
            });

            // Calculate overall performance score
            const metrics = {
                responseTime: responseTimeMetrics,
                completionRate,
                streak: streakMetrics
            };

            const performanceScore = Math.round(
                (completionRate * 0.4) +
                (Math.min(streakMetrics.current / 30, 1) * 100 * 0.3) +
                (Math.min(streakMetrics.longest / 30, 1) * 100 * 0.3)
            );

            return res.status(200).json({
                metrics,
                bottlenecks,
                recommendations,
                performanceScore,
                thresholds: PERFORMANCE_THRESHOLDS,
                generatedAt: new Date().toISOString()
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[Performance API] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to analyze performance',
            message: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
}
