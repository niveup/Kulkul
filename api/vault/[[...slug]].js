/**
 * Vault API - Consolidated endpoint with catch-all routing
 * Handles: list, save, delete, trash, restore, permanent-delete
 */
import { getDbPool, initDatabase, generateId } from '../db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Parse action from Vercel's optional catch-all [[...slug]]
    // For /api/vault -> slug = undefined or []
    // For /api/vault/save -> slug = ['save']
    let action = 'list';
    const { slug } = req.query;

    console.log('[Vault API] Raw query:', JSON.stringify(req.query));
    console.log('[Vault API] Raw URL:', req.url);
    console.log('[Vault API] Slug type:', typeof slug, 'value:', slug);

    if (slug) {
        if (Array.isArray(slug) && slug.length > 0) {
            action = slug[0];
        } else if (typeof slug === 'string') {
            action = slug;
        }
    } else {
        // Fallback: parse from URL path for local dev or edge cases
        const urlPath = req.url?.split('?')[0] || '';
        // Match pattern like /api/vault/save or /vault/save
        const match = urlPath.match(/\/vault\/([a-z-]+)/i);
        if (match && match[1]) {
            action = match[1];
        }
    }

    console.log('[Vault API]', req.method, 'Action:', action);

    try {
        await initDatabase();
        const db = await getDbPool();

        // Ensure pdf_uploads table exists with all columns
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS pdf_uploads (
                    id VARCHAR(36) PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    size_bytes BIGINT NOT NULL,
                    mega_node_id VARCHAR(255),
                    mega_download_url TEXT,
                    deleted_at TIMESTAMP NULL DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created (created_at),
                    INDEX idx_deleted (deleted_at)
                )
            `);
        } catch (e) { /* Table exists */ }

        // Auto-cleanup: Permanently delete trash items older than 10 days
        try {
            await db.execute(`
                DELETE FROM pdf_uploads 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < DATE_SUB(NOW(), INTERVAL 10 DAY)
            `);
        } catch (e) { /* Cleanup skipped */ }

        // GET /api/vault/list or GET /api/vault
        if (req.method === 'GET' && (action === 'list' || !action)) {
            const [rows] = await db.execute(`
                SELECT id, filename, size_bytes, mega_node_id, mega_download_url, created_at
                FROM pdf_uploads
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            `);

            return res.status(200).json({
                success: true,
                files: rows.map(row => ({
                    id: row.id,
                    name: row.filename,
                    size: row.size_bytes,
                    megaNodeId: row.mega_node_id,
                    downloadUrl: row.mega_download_url,
                    createdAt: row.created_at
                }))
            });
        }

        // GET /api/vault/trash
        if (req.method === 'GET' && action === 'trash') {
            const [rows] = await db.execute(`
                SELECT id, filename, size_bytes, mega_node_id, mega_download_url, deleted_at, created_at
                FROM pdf_uploads
                WHERE deleted_at IS NOT NULL
                ORDER BY deleted_at DESC
            `);

            return res.status(200).json({
                success: true,
                files: rows.map(row => ({
                    id: row.id,
                    name: row.filename,
                    size: row.size_bytes,
                    megaNodeId: row.mega_node_id,
                    downloadUrl: row.mega_download_url,
                    deletedAt: row.deleted_at,
                    createdAt: row.created_at,
                    daysRemaining: Math.max(0, 10 - Math.floor((Date.now() - new Date(row.deleted_at).getTime()) / (1000 * 60 * 60 * 24)))
                }))
            });
        }

        // POST /api/vault/save
        if (req.method === 'POST' && action === 'save') {
            const { id, filename, sizeBytes, megaNodeId, downloadUrl } = req.body;

            if (!filename || !sizeBytes) {
                return res.status(400).json({ error: 'Missing required fields: filename, sizeBytes' });
            }

            const fileId = id || generateId();

            await db.execute(`
                INSERT INTO pdf_uploads (id, filename, size_bytes, mega_node_id, mega_download_url)
                VALUES (?, ?, ?, ?, ?)
            `, [fileId, filename, sizeBytes, megaNodeId || null, downloadUrl || null]);

            return res.status(201).json({
                success: true,
                file: { id: fileId, name: filename, size: sizeBytes, megaNodeId, downloadUrl }
            });
        }

        // POST /api/vault/delete (soft delete)
        if (req.method === 'POST' && action === 'delete') {
            const { id: fileId } = req.body;
            if (!fileId) return res.status(400).json({ error: 'Missing required field: id' });

            const [result] = await db.execute(`
                UPDATE pdf_uploads SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL
            `, [fileId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'File not found or already in trash' });
            }

            return res.status(200).json({ success: true, message: 'File moved to trash', recoverable: true });
        }

        // POST /api/vault/restore
        if (req.method === 'POST' && action === 'restore') {
            const { id: fileId } = req.body;
            if (!fileId) return res.status(400).json({ error: 'Missing required field: id' });

            const [result] = await db.execute(`
                UPDATE pdf_uploads SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL
            `, [fileId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'File not found in trash' });
            }

            return res.status(200).json({ success: true, message: 'File restored from trash' });
        }

        // POST /api/vault/permanent-delete
        if (req.method === 'POST' && action === 'permanent-delete') {
            const { id: fileId } = req.body;
            if (!fileId) return res.status(400).json({ error: 'Missing required field: id' });

            const [fileRows] = await db.execute(`
                SELECT mega_node_id FROM pdf_uploads WHERE id = ? AND deleted_at IS NOT NULL
            `, [fileId]);

            if (fileRows.length === 0) {
                return res.status(404).json({ error: 'File not found in trash' });
            }

            const megaNodeId = fileRows[0].mega_node_id;
            await db.execute(`DELETE FROM pdf_uploads WHERE id = ?`, [fileId]);

            return res.status(200).json({
                success: true,
                message: 'File permanently deleted',
                megaNodeId
            });
        }

        return res.status(405).json({ error: `Action ${action} not allowed` });
    } catch (error) {
        console.error('[Vault API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
