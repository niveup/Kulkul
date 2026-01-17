// Vercel Serverless Function - Conversations API (Catch-all)
// Handles all /api/conversations/* routes
import { getDbPool, initDatabase, generateId } from '../db.js';

const MAX_CONVERSATIONS = 50;
const TRASH_RETENTION_DAYS = 1;
const MAX_AGE_MONTHS = 3;

async function runCleanup(db) {
    try {
        // 1. Permanently delete trashed items older than 1 day
        await db.execute(`
            DELETE FROM conversations 
            WHERE deleted_at IS NOT NULL 
            AND deleted_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [TRASH_RETENTION_DAYS]);

        // 2. Delete conversations older than 3 months (non-trashed)
        await db.execute(`
            DELETE FROM conversations 
            WHERE deleted_at IS NULL 
            AND created_at < DATE_SUB(NOW(), INTERVAL ? MONTH)
        `, [MAX_AGE_MONTHS]);

        // 3. Keep only latest 50 conversations (delete oldest if over limit)
        // Use subquery approach which is TiDB compatible
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as count FROM conversations WHERE deleted_at IS NULL
        `);
        const count = countResult[0]?.count || 0;

        if (count > MAX_CONVERSATIONS) {
            // Get IDs of oldest conversations to delete
            const toDelete = count - MAX_CONVERSATIONS;
            const [oldestRows] = await db.execute(`
                SELECT id FROM conversations 
                WHERE deleted_at IS NULL 
                ORDER BY updated_at ASC 
                LIMIT ${parseInt(toDelete)}
            `);

            if (oldestRows.length > 0) {
                const idsToDelete = oldestRows.map(r => r.id);
                await db.execute(`
                    DELETE FROM conversations WHERE id IN (${idsToDelete.map(() => '?').join(',')})
                `, idsToDelete);
            }
        }
    } catch (e) {
        // Log but don't throw - cleanup errors shouldn't break the API
        console.error('[Cleanup Error]', e.message);
    }
}


export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        // Run cleanup only 1% of requests to avoid timeout
        if (Math.random() < 0.01) {
            runCleanup(db).catch(e => console.error('[Cleanup]', e.message));
        }

        // Parse URL path
        const urlPath = req.url.split('?')[0];
        const pathMatch = urlPath.match(/\/api\/conversations\/?(.*)$/);
        const remainingPath = pathMatch ? pathMatch[1] : '';
        const pathSegments = remainingPath.split('/').filter(Boolean);
        const conversationId = pathSegments[0] || null;
        const action = pathSegments[1] || null;

        console.log('[Conversations API]', req.method, req.url, { conversationId, action });

        // ═══════════════════════════════════════════════════════════════════════════
        // GET REQUESTS
        // ═══════════════════════════════════════════════════════════════════════════
        if (req.method === 'GET') {
            // GET /api/conversations/trash - Get trashed conversations
            if (conversationId === 'trash') {
                const [conversations] = await db.execute(`
                    SELECT c.id, c.title, c.model_id, c.model_name, c.deleted_at, c.created_at, c.updated_at,
                           (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
                    FROM conversations c
                    WHERE c.deleted_at IS NOT NULL
                    ORDER BY c.deleted_at DESC
                `);
                return res.status(200).json(conversations);
            }

            // GET /api/conversations/:id - Get single conversation with messages
            if (conversationId) {
                const [conversations] = await db.execute(`
                    SELECT id, title, model_id, model_name, deleted_at, created_at, updated_at
                    FROM conversations WHERE id = ?
                `, [conversationId]);

                if (conversations.length === 0) {
                    return res.status(404).json({ error: 'Conversation not found' });
                }

                const [messages] = await db.execute(`
                    SELECT id, role, content, thinking, has_image, created_at
                    FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
                `, [conversationId]);

                return res.status(200).json({
                    ...conversations[0],
                    messages: messages.map(m => ({
                        id: m.id.toString(),
                        role: m.role,
                        content: m.content,
                        thinking: m.thinking,
                        hasImage: m.has_image,
                        timestamp: m.created_at
                    }))
                });
            }

            // GET /api/conversations - Get all non-trashed conversations (limit 50)
            const [conversations] = await db.execute(`
                SELECT c.id, c.title, c.model_id, c.model_name, c.created_at, c.updated_at,
                       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
                FROM conversations c
                WHERE c.deleted_at IS NULL
                ORDER BY c.updated_at DESC
                LIMIT ${MAX_CONVERSATIONS}
            `);

            return res.status(200).json(conversations.map(c => ({
                id: c.id,
                title: c.title,
                lastMessage: c.last_message || '',
                timestamp: c.updated_at,
                modelId: c.model_id,
                modelName: c.model_name
            })));
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // POST REQUESTS
        // ═══════════════════════════════════════════════════════════════════════════
        if (req.method === 'POST') {
            // POST /api/conversations/:id/restore - Restore from trash
            if (conversationId && action === 'restore') {
                await db.execute(`
                    UPDATE conversations SET deleted_at = NULL, updated_at = NOW() WHERE id = ?
                `, [conversationId]);
                return res.status(200).json({ restored: true, id: conversationId });
            }

            // POST /api/conversations/:id/message - Add message to conversation
            if (conversationId && action === 'message') {
                const { role, content, thinking } = req.body;
                if (!role || !content) {
                    return res.status(400).json({ error: 'Missing role or content' });
                }

                const [result] = await db.execute(`
                    INSERT INTO messages (conversation_id, role, content, thinking)
                    VALUES (?, ?, ?, ?)
                `, [conversationId, role, content, thinking || null]);

                // Update conversation timestamp
                await db.execute(`UPDATE conversations SET updated_at = NOW() WHERE id = ?`, [conversationId]);

                return res.status(201).json({
                    id: result.insertId.toString(),
                    conversationId,
                    role,
                    content
                });
            }

            // POST /api/conversations - Create new conversation
            const { id, title, modelId, modelName, messages } = req.body;
            const newId = id || generateId();

            await db.execute(`
                INSERT INTO conversations (id, title, model_id, model_name)
                VALUES (?, ?, ?, ?)
            `, [newId, title || 'New Chat', modelId || null, modelName || null]);

            // Insert initial messages if provided
            if (messages && messages.length > 0) {
                for (const msg of messages) {
                    await db.execute(`
                        INSERT INTO messages (conversation_id, role, content, thinking)
                        VALUES (?, ?, ?, ?)
                    `, [newId, msg.role, msg.content, msg.thinking || null]);
                }
            }

            return res.status(201).json({ id: newId, title, modelId, modelName });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // PUT REQUESTS
        // ═══════════════════════════════════════════════════════════════════════════
        if (req.method === 'PUT') {
            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID required' });
            }

            const { title, modelId, modelName } = req.body;
            const updates = [];
            const values = [];

            if (title !== undefined) { updates.push('title = ?'); values.push(title); }
            if (modelId !== undefined) { updates.push('model_id = ?'); values.push(modelId); }
            if (modelName !== undefined) { updates.push('model_name = ?'); values.push(modelName); }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            values.push(conversationId);
            await db.execute(`UPDATE conversations SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

            return res.status(200).json({ updated: true, id: conversationId });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // DELETE REQUESTS
        // ═══════════════════════════════════════════════════════════════════════════
        if (req.method === 'DELETE') {
            // DELETE /api/conversations/all - Delete ALL conversations (active and trash)
            if (conversationId === 'all') {
                await db.execute('DELETE FROM messages');
                await db.execute('DELETE FROM conversations');
                return res.status(200).json({ deleted: true, all: true });
            }

            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID required' });
            }

            // DELETE /api/conversations/:id/permanent - Permanently delete
            if (action === 'permanent') {
                await db.execute(`DELETE FROM conversations WHERE id = ?`, [conversationId]);
                return res.status(200).json({ deleted: true, permanent: true, id: conversationId });
            }

            // DELETE /api/conversations/trash/all - Empty trash
            if (conversationId === 'trash' && action === 'all') {
                await db.execute(`DELETE FROM conversations WHERE deleted_at IS NOT NULL`);
                return res.status(200).json({ deleted: true, emptyTrash: true });
            }

            // DELETE /api/conversations/:id - Soft delete (move to trash)
            await db.execute(`UPDATE conversations SET deleted_at = NOW() WHERE id = ?`, [conversationId]);
            return res.status(200).json({ deleted: true, trashed: true, id: conversationId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[Conversations API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
