// Unified API Router - Single endpoint to handle all API routes
// This reduces serverless function count while handling all routes
import { getDbPool, initDatabase, generateId } from './db.js';
import { requireAuth } from './authMiddleware.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Require authentication (auto-bypasses on localhost for dev convenience)
    const authResult = await requireAuth(req, res);
    if (authResult !== true) return; // 401/403/429 already sent by middleware

    // Parse the route from URL
    const urlPath = req.url.split('?')[0];
    const pathParts = urlPath.replace(/^\/api\//, '').split('/').filter(Boolean);
    const route = pathParts[0] || '';
    const subRoute = pathParts.slice(1).join('/');

    console.log('[Unified API]', req.method, urlPath, { route, subRoute });

    try {
        await initDatabase();
        const db = await getDbPool();

        // Route: /api/todos
        if (route === 'todos') {
            const todoId = subRoute || null;

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

            if (req.method === 'PUT' && todoId) {
                const { completed } = req.body;
                await db.execute('UPDATE todos SET completed = ? WHERE id = ?', [completed, todoId]);
                return res.status(200).json({ id: todoId, completed });
            }

            if (req.method === 'DELETE') {
                if (todoId === 'all') {
                    await db.execute('DELETE FROM todos');
                    return res.status(200).json({ deleted: true, all: true });
                }
                if (todoId) {
                    await db.execute('DELETE FROM todos WHERE id = ?', [todoId]);
                    return res.status(200).json({ deleted: true, id: todoId });
                }
            }

            return res.status(405).json({ error: 'Method not allowed for todos' });
        }

        // Route: /api/sessions
        if (route === 'sessions') {
            const action = subRoute || null;

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

            if (req.method === 'DELETE' && action === 'all') {
                await db.execute('DELETE FROM pomodoro_sessions');
                return res.status(200).json({ deleted: true, all: true });
            }

            return res.status(405).json({ error: 'Method not allowed for sessions' });
        }

        // Route: /api/custom-apps
        if (route === 'custom-apps') {
            const appId = subRoute || null;

            if (req.method === 'GET') {
                const [apps] = await db.execute('SELECT id, name, url, description, icon, image, created_at FROM custom_apps ORDER BY created_at DESC');
                return res.status(200).json(apps.map(app => ({
                    id: app.id, name: app.name, url: app.url, description: app.description,
                    icon: app.icon, image: app.image, isCustom: true
                })));
            }

            if (req.method === 'POST') {
                const { id, name, url, description, icon, image } = req.body;
                if (!name || !url) {
                    return res.status(400).json({ error: 'Name and URL are required' });
                }
                const newAppId = id || `custom-${Date.now()}`;
                await db.execute('INSERT INTO custom_apps (id, name, url, description, icon, image) VALUES (?, ?, ?, ?, ?, ?)',
                    [newAppId, name, url, description || 'Custom App', icon || 'Globe', image || null]);
                return res.status(201).json({
                    id: newAppId, name, url, description: description || 'Custom App',
                    icon: icon || 'Globe', image: image || null, isCustom: true
                });
            }

            if (req.method === 'PUT' && appId) {
                const { name, url, description, icon, image } = req.body;
                await db.execute('UPDATE custom_apps SET name = ?, url = ?, description = ?, icon = ?, image = ? WHERE id = ?',
                    [name, url, description, icon, image, appId]);
                return res.status(200).json({ id: appId, updated: true });
            }

            if (req.method === 'DELETE') {
                if (appId === 'all') {
                    await db.execute('DELETE FROM custom_apps');
                    return res.status(200).json({ deleted: true, all: true });
                }
                if (appId) {
                    await db.execute('DELETE FROM custom_apps WHERE id = ?', [appId]);
                    return res.status(200).json({ deleted: true, id: appId });
                }
            }

            return res.status(405).json({ error: 'Method not allowed for custom-apps' });
        }

        return res.status(404).json({ error: `Route ${route} not found` });
    } catch (error) {
        console.error('[Unified API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
