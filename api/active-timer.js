// Vercel Serverless Function - Active Timer API (Cross-device persistence)
import { getDbPool, initDatabase } from './db.js';

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        if (req.method === 'GET') {
            const [timers] = await db.execute(
                'SELECT id, start_time as startTime, duration_seconds as durationSeconds, paused_remaining as pausedRemaining, status, updated_at as updatedAt FROM active_timer WHERE id = ?',
                ['default']
            );
            if (timers.length === 0) {
                return res.status(200).json({ status: 'idle' });
            }
            return res.status(200).json(timers[0]);
        }

        if (req.method === 'POST') {
            const { startTime, durationSeconds, pausedRemaining, status } = req.body;
            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }

            await db.execute(`
                INSERT INTO active_timer (id, start_time, duration_seconds, paused_remaining, status)
                VALUES ('default', ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    start_time = VALUES(start_time),
                    duration_seconds = VALUES(duration_seconds),
                    paused_remaining = VALUES(paused_remaining),
                    status = VALUES(status)
            `, [startTime || 0, durationSeconds || 0, pausedRemaining || null, status]);

            return res.status(200).json({ success: true, status });
        }

        if (req.method === 'DELETE') {
            await db.execute('DELETE FROM active_timer WHERE id = ?', ['default']);
            return res.status(200).json({ deleted: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[Active Timer API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
