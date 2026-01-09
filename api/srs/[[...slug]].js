// Vercel Serverless Function - Spaced Repetition System API (Catch-all)
import { getDbPool, initDatabase } from '../db.js';

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        // Parse URL path
        const urlPath = req.url.split('?')[0];
        const pathMatch = urlPath.match(/\/api\/srs\/?(.*)$/);
        const remainingPath = pathMatch ? pathMatch[1] : '';
        const pathSegments = remainingPath.split('/').filter(Boolean);
        const action = pathSegments[0] || 'topics';
        const subAction = pathSegments[1] || null;

        console.log('[SRS API]', req.method, req.url, { action, subAction });

        // Helper for local date string
        const getLocalDateStr = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (req.method === 'GET' && action === 'topics') {
            // Get all topics with SRS data
            const [topics] = await db.execute(`
                SELECT topic_id as topicId, topic_name as topicName, class_level as \`class\`, subject,
                       review_count as reviewCount, ease_factor as easeFactor, interval_days as intervalDays,
                       last_reviewed as lastReviewed, next_review_date as nextReviewDate, created_at as createdAt
                FROM srs_topic_reviews ORDER BY next_review_date ASC, last_reviewed ASC
            `);

            // Get activity for heatmap (last 365 days)
            const [activityRows] = await db.execute(`
                SELECT DATE_FORMAT(activity_date, '%Y-%m-%d') as date, topic_id, topic_name
                FROM srs_study_activity WHERE activity_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
                ORDER BY activity_date DESC
            `);

            // Transform activity into heatmap format
            const activity = {};
            for (const row of activityRows) {
                if (!activity[row.date]) {
                    activity[row.date] = { count: 0, topics: [] };
                }
                activity[row.date].count++;
                if (!activity[row.date].topics.includes(row.topic_name)) {
                    activity[row.date].topics.push(row.topic_name);
                }
            }

            // Calculate streak
            let streak = 0;
            const today = new Date();
            let checkDate = new Date(today);
            const todayStr = getLocalDateStr(checkDate);
            if (!activity[todayStr] || activity[todayStr].count === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
            }
            while (true) {
                const dateStr = getLocalDateStr(checkDate);
                if (activity[dateStr] && activity[dateStr].count > 0) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            return res.status(200).json({ topics, activity, streak });
        }

        if (req.method === 'POST' && action === 'review') {
            const { topicId, topicName, classLevel, subject = 'Physics', rating = 3 } = req.body;
            if (!topicId || !topicName) {
                return res.status(400).json({ error: 'topicId and topicName are required' });
            }

            // SM-2 Algorithm
            const INTERVALS = [1, 3, 7, 14, 30, 60, 120];
            const MIN_EASE = 1.3;
            const today = new Date();

            const [existing] = await db.execute('SELECT * FROM srs_topic_reviews WHERE topic_id = ?', [topicId]);

            let newReviewCount, newEase, newInterval, nextReviewDate;

            if (existing.length > 0) {
                const current = existing[0];
                newReviewCount = (current.review_count || 0) + 1;
                newEase = Math.max(MIN_EASE, (current.ease_factor || 2.5) + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));

                if (rating < 3) {
                    newInterval = 1;
                } else {
                    const baseInterval = newReviewCount < INTERVALS.length ? INTERVALS[newReviewCount - 1] : INTERVALS[INTERVALS.length - 1];
                    newInterval = Math.round(baseInterval * newEase);
                }

                nextReviewDate = new Date(today);
                nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

                await db.execute(`
                    UPDATE srs_topic_reviews SET review_count = ?, ease_factor = ?, interval_days = ?, 
                           last_reviewed = NOW(), next_review_date = ? WHERE topic_id = ?
                `, [newReviewCount, newEase.toFixed(2), newInterval, getLocalDateStr(nextReviewDate), topicId]);
            } else {
                newReviewCount = 1;
                newEase = 2.5;
                newInterval = INTERVALS[0];
                nextReviewDate = new Date(today);
                nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

                await db.execute(`
                    INSERT INTO srs_topic_reviews (topic_id, topic_name, class_level, subject, review_count, ease_factor, interval_days, last_reviewed, next_review_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                `, [topicId, topicName, classLevel || '12', subject, newReviewCount, newEase, newInterval, getLocalDateStr(nextReviewDate)]);
            }

            // Record activity for heatmap
            const todayStr = getLocalDateStr(today);
            try {
                await db.execute(`
                    INSERT INTO srs_study_activity (activity_date, topic_id, topic_name) VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE topic_name = VALUES(topic_name)
                `, [todayStr, topicId, topicName]);
            } catch (e) { /* duplicate key */ }

            return res.status(200).json({
                topicId, topicName, reviewCount: newReviewCount, easeFactor: newEase,
                interval: newInterval, lastReviewed: getLocalDateStr(today), nextReviewDate: getLocalDateStr(nextReviewDate)
            });
        }

        if (req.method === 'DELETE' && action === 'topics' && subAction === 'all') {
            // Delete ALL SRS data permanently
            await db.execute('DELETE FROM srs_study_activity');
            await db.execute('DELETE FROM srs_topic_reviews');
            return res.status(200).json({ deleted: true, all: true });
        }

        return res.status(405).json({ error: 'Method or action not allowed' });
    } catch (error) {
        console.error('[SRS API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
