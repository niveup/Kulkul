/**
 * User Context API - Aggregates all user data for AI personalization
 * 
 * This endpoint provides a concise, LLM-optimized summary of the user's
 * current state including:
 * - Daily todos (pending/completed)
 * - Focus sessions (today, weekly patterns)
 * - SRS spaced repetition (due topics, streak)
 * 
 * Performance targets:
 * - Response time: <100ms
 * - Context size: <500 tokens
 * - Caching: 30 second TTL
 * 
 * @architecture Parallel DB queries with Promise.all for O(1) latency
 */

import { getDbPool, initDatabase } from './db.js';
import { requireAuth } from './authMiddleware.js';

// =============================================================================
// In-Memory Cache (30 second TTL)
// =============================================================================

const contextCache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

function getCachedContext(cacheKey) {
    const cached = contextCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }
    contextCache.delete(cacheKey);
    return null;
}

function setCachedContext(cacheKey, data) {
    // Limit cache size to prevent memory issues
    if (contextCache.size > 100) {
        const oldest = contextCache.keys().next().value;
        contextCache.delete(oldest);
    }
    contextCache.set(cacheKey, { data, timestamp: Date.now() });
}

// =============================================================================
// Date Helpers
// =============================================================================

function getLocalDateStr(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// =============================================================================
// Data Aggregation Functions
// =============================================================================

async function getTodosContext(db) {
    const [todos] = await db.execute(
        'SELECT id, text, completed FROM todos ORDER BY created_at DESC LIMIT 10'
    );

    if (!todos.length) {
        return { summary: 'No todos set up yet.', pending: [], completed: 0, total: 0 };
    }

    const completed = todos.filter(t => t.completed).length;
    const pending = todos.filter(t => !t.completed).slice(0, 5);

    const pendingList = pending.length > 0
        ? pending.map(t => `"${t.text.slice(0, 40)}${t.text.length > 40 ? '...' : ''}"`).join(', ')
        : 'All done!';

    return {
        summary: `${completed}/${todos.length} completed. ${pending.length > 0 ? 'Pending: ' + pendingList : 'All tasks completed! 🎉'}`,
        pending: pending.map(t => t.text),
        completed,
        total: todos.length
    };
}

async function getSessionsContext(db) {
    const today = getLocalDateStr();
    const weekAgo = getLocalDateStr(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    // Today's sessions
    const [todaySessions] = await db.execute(
        `SELECT type, minutes, elapsed_seconds as elapsedSeconds, status 
         FROM pomodoro_sessions 
         WHERE DATE(created_at) = ? 
         ORDER BY created_at DESC`,
        [today]
    );

    // Weekly compact sessions for trend
    const [weeklySessions] = await db.execute(
        `SELECT date, minutes FROM compact_sessions 
         WHERE date >= ? 
         ORDER BY date DESC`,
        [weekAgo]
    );

    // Calculate today's stats
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.elapsedSeconds || 0) / 60, 0);
    const completedToday = todaySessions.filter(s => s.status === 'completed').length;

    // Calculate weekly average
    const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + s.minutes, 0);
    const avgMinutesPerDay = weeklySessions.length > 0
        ? Math.round(weeklyMinutes / Math.min(7, weeklySessions.length))
        : 0;

    // Calculate streak (consecutive days with >0 minutes)
    let streak = 0;
    const today_check = new Date();
    for (let i = 0; i < 365; i++) {
        const checkDate = getLocalDateStr(new Date(today_check - i * 24 * 60 * 60 * 1000));
        const hasSession = weeklySessions.some(s => getLocalDateStr(new Date(s.date)) === checkDate);
        if (hasSession || (i === 0 && todaySessions.length > 0)) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    const todayHours = (todayMinutes / 60).toFixed(1);
    const avgHours = (avgMinutesPerDay / 60).toFixed(1);

    return {
        summary: `${todayHours}h focused today (${completedToday} sessions). Weekly avg: ${avgHours}h/day. ${streak > 1 ? `🔥 ${streak}-day streak!` : ''}`,
        todayMinutes: Math.round(todayMinutes),
        todaySessions: completedToday,
        weeklyAvgMinutes: avgMinutesPerDay,
        streak
    };
}

async function getSRSContext(db) {
    const today = getLocalDateStr();

    // Get due topics
    const [dueTopics] = await db.execute(
        `SELECT topic_id, topic_name, next_review_date, class_level
         FROM srs_topic_reviews 
         WHERE next_review_date <= ? 
         ORDER BY next_review_date ASC 
         LIMIT 10`,
        [today]
    );

    // Get streak from activity
    const [activityRows] = await db.execute(
        `SELECT DISTINCT DATE_FORMAT(activity_date, '%Y-%m-%d') as date 
         FROM srs_study_activity 
         WHERE activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         ORDER BY activity_date DESC`
    );

    // Calculate review streak
    let reviewStreak = 0;
    const todayCheck = new Date();
    for (let i = 0; i < 365; i++) {
        const checkDate = getLocalDateStr(new Date(todayCheck - i * 24 * 60 * 60 * 1000));
        const hasActivity = activityRows.some(r => r.date === checkDate);
        if (hasActivity) {
            reviewStreak++;
        } else if (i > 0) {
            break;
        }
    }

    if (dueTopics.length === 0) {
        return {
            summary: `No topics due for review. ${reviewStreak > 0 ? `📚 ${reviewStreak}-day review streak!` : 'Start reviewing to build a streak!'}`,
            dueTopics: [],
            streak: reviewStreak
        };
    }

    // Group by overdue vs due today
    const overdue = dueTopics.filter(t => t.next_review_date < today);
    const dueToday = dueTopics.filter(t => getLocalDateStr(new Date(t.next_review_date)) === today);

    const topicList = dueTopics.slice(0, 5).map(t => t.topic_name).join(', ');

    return {
        summary: `${dueTopics.length} topics need review. ${overdue.length > 0 ? `⚠️ ${overdue.length} overdue!` : ''} Due: ${topicList}. ${reviewStreak > 0 ? `📚 ${reviewStreak}-day streak!` : ''}`,
        dueTopics: dueTopics.map(t => ({ id: t.topic_id, name: t.topic_name, class: t.class_level })),
        overdueCount: overdue.length,
        dueTodayCount: dueToday.length,
        streak: reviewStreak
    };
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req, res) {
    // CORS headers
    const origin = req.headers.origin;
    const ALLOWED_ORIGINS = [
        'https://personal-dashboard-alpha-gilt.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ];
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult !== true) return;

    try {
        // Check cache first
        const cacheKey = 'user-context-default';
        const cached = getCachedContext(cacheKey);
        if (cached) {
            console.log('[User Context] Cache hit');
            return res.status(200).json(cached);
        }

        await initDatabase();
        const db = await getDbPool();

        const startTime = Date.now();

        // Parallel fetch all data sources (O(1) latency)
        const [todosCtx, sessionsCtx, srsCtx] = await Promise.all([
            getTodosContext(db),
            getSessionsContext(db),
            getSRSContext(db)
        ]);

        const queryTime = Date.now() - startTime;
        console.log(`[User Context] Aggregated in ${queryTime}ms`);

        // Build LLM-optimized context string
        const today = formatDate(new Date());
        const contextString = `## Your User's Current State (${today})

📋 TODOS: ${todosCtx.summary}

⏱️ FOCUS: ${sessionsCtx.summary}

📚 SRS REVIEW: ${srsCtx.summary}`;

        const result = {
            contextString,
            raw: {
                todos: todosCtx,
                sessions: sessionsCtx,
                srs: srsCtx
            },
            generatedAt: new Date().toISOString(),
            queryTimeMs: queryTime
        };

        // Cache the result
        setCachedContext(cacheKey, result);

        return res.status(200).json(result);

    } catch (error) {
        console.error('[User Context] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// =============================================================================
// Export helper for use in chat.js
// =============================================================================

export async function getUserContextString() {
    try {
        await initDatabase();
        const db = await getDbPool();

        // Check cache
        const cacheKey = 'user-context-internal';
        const cached = getCachedContext(cacheKey);
        if (cached) {
            return cached;
        }

        const [todosCtx, sessionsCtx, srsCtx] = await Promise.all([
            getTodosContext(db),
            getSessionsContext(db),
            getSRSContext(db)
        ]);

        const today = formatDate(new Date());
        const contextString = `## Your User's Current State (${today})

📋 TODOS: ${todosCtx.summary}

⏱️ FOCUS: ${sessionsCtx.summary}

📚 SRS REVIEW: ${srsCtx.summary}`;

        setCachedContext(cacheKey, contextString);
        return contextString;

    } catch (error) {
        console.error('[User Context] Error building context:', error);
        return '(User context temporarily unavailable)';
    }
}
