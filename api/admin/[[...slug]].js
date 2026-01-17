/**
 * Admin API - Consolidated endpoint
 * Handles: db-stats, and other admin functions
 */
import { getDbPool, initDatabase } from '../db.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse action from URL path: /api/admin/[action]
    const { slug } = req.query;
    const action = Array.isArray(slug) ? slug[0] : slug || 'db-stats';

    try {
        await initDatabase();
        const db = await getDbPool();

        if (action === 'db-stats') {
            const [rows] = await db.execute(`
                SELECT 
                    SUM(data_length + index_length) as used_bytes
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            `);

            const usedBytes = rows[0]?.used_bytes || 0;
            const totalBytes = 5 * 1024 * 1024 * 1024; // 5GB default

            const [tableRows] = await db.execute(`
                SELECT 
                    table_name,
                    data_length + index_length as size_bytes,
                    table_rows as row_count
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
                ORDER BY size_bytes DESC
            `);

            const tables = tableRows.map(row => ({
                name: row.table_name,
                size: parseInt(row.size_bytes || 0),
                rows: parseInt(row.row_count || 0)
            }));

            return res.status(200).json({
                success: true,
                used: parseInt(usedBytes),
                total: totalBytes,
                tables
            });
        }

        return res.status(404).json({ error: `Unknown action: ${action}` });
    } catch (error) {
        console.error('[Admin API] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            used: 0,
            total: 5 * 1024 * 1024 * 1024
        });
    }
}
