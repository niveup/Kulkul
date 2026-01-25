// API to view/manage AI memories
import { getDbPool, initDatabase } from './db.js';
import { requireAuth } from './authMiddleware.js';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Require authentication
    const authResult = await requireAuth(req, res);
    if (authResult !== true) return;

    try {
        await initDatabase();
        const db = await getDbPool();

        if (req.method === 'GET') {
            // Get all active memories
            const [memories] = await db.execute(
                `SELECT id, category, content, confidence, created_at, updated_at 
                 FROM ai_user_memories 
                 WHERE is_active = TRUE 
                 ORDER BY category, updated_at DESC`
            );

            return res.status(200).json({
                count: memories.length,
                memories: memories
            });
        }

        if (req.method === 'DELETE') {
            // Delete specific memory by ID or all
            const { id } = req.query;

            if (id === 'all') {
                await db.execute('DELETE FROM ai_user_memories');
                return res.status(200).json({ deleted: 'all' });
            }

            if (id) {
                await db.execute('DELETE FROM ai_user_memories WHERE id = ?', [id]);
                return res.status(200).json({ deleted: id });
            }

            return res.status(400).json({ error: 'Provide id query param or id=all' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[AI Memories API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
