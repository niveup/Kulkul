// Vercel Serverless Function - Custom Apps API (Catch-all)
import { getDbPool, initDatabase } from '../db.js';

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        // Parse URL for app ID
        const urlPath = req.url.split('?')[0];
        const pathMatch = urlPath.match(/\/api\/custom-apps\/?(.*)$/);
        const remainingPath = pathMatch ? pathMatch[1] : '';
        const pathSegments = remainingPath.split('/').filter(Boolean);
        const appId = pathSegments[0] || null;

        console.log('[Custom Apps API]', req.method, req.url, { appId });

        if (req.method === 'GET') {
            const [apps] = await db.execute('SELECT id, name, url, description, icon, image, created_at FROM custom_apps ORDER BY created_at DESC');
            const formattedApps = apps.map(app => ({
                id: app.id, name: app.name, url: app.url, description: app.description,
                icon: app.icon, image: app.image, isCustom: true
            }));
            return res.status(200).json(formattedApps);
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

        if (req.method === 'PUT') {
            if (!appId) {
                return res.status(400).json({ error: 'App ID required' });
            }
            const { name, url, description, icon, image } = req.body;
            await db.execute('UPDATE custom_apps SET name = ?, url = ?, description = ?, icon = ?, image = ? WHERE id = ?',
                [name, url, description, icon, image, appId]);
            return res.status(200).json({ id: appId, updated: true });
        }

        if (req.method === 'DELETE') {
            if (appId === 'all') {
                // Delete ALL custom apps permanently
                await db.execute('DELETE FROM custom_apps');
                return res.status(200).json({ deleted: true, all: true });
            }
            if (!appId) {
                return res.status(400).json({ error: 'App ID required' });
            }
            await db.execute('DELETE FROM custom_apps WHERE id = ?', [appId]);
            return res.status(200).json({ deleted: true, id: appId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[Custom Apps API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
