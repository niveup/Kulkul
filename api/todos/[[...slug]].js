// Vercel Serverless Function - Todos API (Catch-all)
import { getDbPool, initDatabase, generateId } from '../db.js';

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        // Auto-cleanup: Delete todos older than 30 days
        try {
            await db.execute(`DELETE FROM todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`);
        } catch (e) { /* cleanup error */ }

        // Parse URL path
        const urlPath = req.url.split('?')[0];
        const pathMatch = urlPath.match(/\/api\/todos\/?(.*)$/);
        const remainingPath = pathMatch ? pathMatch[1] : '';
        const pathSegments = remainingPath.split('/').filter(Boolean);
        const todoId = pathSegments[0] || null;

        console.log('[Todos API]', req.method, req.url, { todoId });

        if (req.method === 'GET') {
            const [todos] = await db.execute('SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC');
            return res.status(200).json(todos);
        }

        if (req.method === 'POST') {
            const { text } = req.body;
            if (!text?.trim()) {
                return res.status(400).json({ error: 'Text is required' });
            }
            const newId = generateId();
            await db.execute('INSERT INTO todos (id, text, completed) VALUES (?, ?, ?)', [newId, text.trim(), false]);
            return res.status(201).json({ id: newId, text: text.trim(), completed: false });
        }

        if (req.method === 'PUT') {
            if (!todoId) {
                return res.status(400).json({ error: 'Todo ID required' });
            }
            const { completed } = req.body;
            await db.execute('UPDATE todos SET completed = ? WHERE id = ?', [completed, todoId]);
            return res.status(200).json({ id: todoId, completed });
        }

        if (req.method === 'DELETE') {
            if (todoId === 'all') {
                // Delete ALL todos permanently
                await db.execute('DELETE FROM todos');
                return res.status(200).json({ deleted: true, all: true });
            }
            if (!todoId) {
                return res.status(400).json({ error: 'Todo ID required' });
            }
            await db.execute('DELETE FROM todos WHERE id = ?', [todoId]);
            return res.status(200).json({ deleted: true, id: todoId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[Todos API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
