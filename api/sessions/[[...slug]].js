// Vercel Serverless Function - Pomodoro Sessions API (Catch-all)
import { getDbPool, initDatabase, generateId } from '../db.js';

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        // Auto-cleanup: Delete sessions older than 1 year
        try {
            await db.execute(`DELETE FROM pomodoro_sessions WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY)`);
        } catch (e) { /* cleanup error */ }

        // Parse URL path
        const urlPath = req.url.split('?')[0];
        const pathMatch = urlPath.match(/\/api\/sessions\/?(.*)$/);
        const remainingPath = pathMatch ? pathMatch[1] : '';
        const pathSegments = remainingPath.split('/').filter(Boolean);
        const action = pathSegments[0] || null;

        console.log('[Sessions API]', req.method, req.url, { action });

        if (req.method === 'GET') {
            const [sessions] = await db.execute(
                'SELECT id, type, minutes, elapsed_seconds as elapsedSeconds, status, created_at as timestamp FROM pomodoro_sessions ORDER BY created_at DESC'
            );
            return res.status(200).json(sessions);
        }

        if (req.method === 'POST') {
            const { id, type, minutes, elapsedSeconds, status } = req.body;
            if (!type || !minutes || !status) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const newId = id || generateId();
            await db.execute(
                'INSERT INTO pomodoro_sessions (id, type, minutes, elapsed_seconds, status) VALUES (?, ?, ?, ?, ?)',
                [newId, type, minutes, elapsedSeconds || 0, status]
            );
            return res.status(201).json({ id: newId, type, minutes, elapsedSeconds, status });
        }

        if (req.method === 'DELETE') {
            if (action === 'all') {
                // Delete ALL sessions permanently
                await db.execute('DELETE FROM pomodoro_sessions');
                return res.status(200).json({ deleted: true, all: true });
            }
            return res.status(400).json({ error: 'Session ID or "all" required' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[Sessions API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
