// Unified API Router - Single endpoint to handle all API routes
// This reduces serverless function count while handling all routes
import { getDbPool, initDatabase, generateId } from '../src/lib/db.js';
import { requireAuth } from '../src/lib/authMiddleware.js';
import { getUserContextData } from '../src/lib/user-context-logic.js';
import { getActiveTimer, updateActiveTimer, deleteActiveTimer } from '../src/lib/active-timer-logic.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Source');

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

            // Auto-cleanup: Delete todos older than 180 days (6 months)
            try {
                await db.execute('DELETE FROM todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY)');
            } catch (err) {
                console.log('[Todos] Cleanup skipped:', err.message);
            }

            if (req.method === 'GET') {
                const [todos] = await db.execute('SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC');
                return res.status(200).json(todos);
            }

            if (req.method === 'POST') {
                const { text, id } = req.body;
                if (!text?.trim()) {
                    return res.status(400).json({ error: 'Text is required' });
                }
                const newId = id || generateId();
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

        // Route: /api/daily-todos (Daily Objectives)
        if (route === 'daily-todos') {
            const todoId = subRoute || null;

            // Auto-cleanup: Delete daily todos older than 180 days (6 months)
            try {
                await db.execute('DELETE FROM daily_todos WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY)');
            } catch (err) {
                console.log('[Daily Todos] Cleanup skipped:', err.message);
            }

            if (req.method === 'GET') {
                const [todos] = await db.execute('SELECT id, text, completed, created_at FROM daily_todos ORDER BY created_at DESC');
                return res.status(200).json(todos);
            }

            if (req.method === 'POST') {
                const { text, createdAt, id } = req.body;
                if (!text?.trim()) {
                    return res.status(400).json({ error: 'Text is required' });
                }
                const newId = id || generateId();
                const timestamp = createdAt || new Date().toISOString();
                await db.execute('INSERT INTO daily_todos (id, text, completed, created_at) VALUES (?, ?, ?, ?)',
                    [newId, text.trim(), false, timestamp]);
                return res.status(201).json({ id: newId, text: text.trim(), completed: false, created_at: timestamp });
            }

            if (req.method === 'PUT' && todoId) {
                const { completed } = req.body;
                await db.execute('UPDATE daily_todos SET completed = ? WHERE id = ?', [completed, todoId]);
                return res.status(200).json({ id: todoId, completed });
            }

            if (req.method === 'DELETE') {
                if (todoId === 'all') {
                    await db.execute('DELETE FROM daily_todos');
                    return res.status(200).json({ deleted: true, all: true });
                }
                if (todoId) {
                    await db.execute('DELETE FROM daily_todos WHERE id = ?', [todoId]);
                    return res.status(200).json({ deleted: true, id: todoId });
                }
            }

            return res.status(405).json({ error: 'Method not allowed for daily-todos' });
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

        // Route: /api/video-status
        if (route === 'video-status') {
            if (req.method === 'GET') {
                const [statuses] = await db.execute(
                    'SELECT video_id as videoId, is_done as isDone, has_concept as hasConcept, updated_at as updatedAt FROM video_status ORDER BY updated_at DESC'
                );
                return res.status(200).json(statuses);
            }

            if (req.method === 'POST') {
                const { videoId, type, value } = req.body;
                if (!videoId || !type || value === undefined) {
                    return res.status(400).json({ error: 'videoId, type, and value are required' });
                }

                const columnName = type === 'done' ? 'is_done' : 'has_concept';
                if (!['is_done', 'has_concept'].includes(columnName)) {
                    return res.status(400).json({ error: 'Invalid type' });
                }

                await db.execute(
                    `INSERT INTO video_status (video_id, ${columnName}) VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE ${columnName} = ?, updated_at = CURRENT_TIMESTAMP`,
                    [videoId, value, value]
                );
                return res.status(200).json({ videoId, [type]: value });
            }

            return res.status(405).json({ error: 'Method not allowed for video-status' });
        }

        // Route: /api/user-context
        if (route === 'user-context') {
            if (req.method === 'GET') {
                const data = await getUserContextData();
                return res.status(200).json(data);
            }
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Route: /api/active-timer
        if (route === 'active-timer') {
            if (req.method === 'GET') {
                const result = await getActiveTimer();
                return res.status(200).json(result);
            }
            if (req.method === 'POST') {
                if (!req.body.status) return res.status(400).json({ error: 'Status is required' });
                const result = await updateActiveTimer(req.body);
                return res.status(200).json(result);
            }
            if (req.method === 'DELETE') {
                const result = await deleteActiveTimer();
                return res.status(200).json(result);
            }
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Route: /api/telegram
        if (route === 'telegram') {
            if (req.method === 'GET') {
                // Telegram Logic (Simplified Inline)
                const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8475620310:AAHR6TLXvaTfTZHL91jX7C94r2C1zhH751Q';
                const CHANNEL = '@kulkuljujum';
                try {
                    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHANNEL}`);
                    const chatData = await response.json();
                    if (!chatData.ok) {
                        return res.status(400).json({ error: 'Cannot access channel', details: chatData.description });
                    }
                    const chatInfo = chatData.result;
                    let photoUrl = null;
                    if (chatInfo.photo) {
                        const photoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chatInfo.photo.big_file_id}`);
                        const photoData = await photoResponse.json();
                        if (photoData.ok) photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${photoData.result.file_path}`;
                    }
                    return res.status(200).json({
                        success: true,
                        channel: {
                            id: chatInfo.id,
                            title: chatInfo.title,
                            username: chatInfo.username,
                            type: chatInfo.type,
                            photo: photoUrl,
                            description: chatInfo.description || '',
                            memberCount: chatInfo.member_count || null
                        },
                        previewUrl: `https://t.me/s/${chatInfo.username}`,
                        totalMessages: 943
                    });
                } catch (error) {
                    return res.status(500).json({ error: 'Failed to fetch Telegram data' });
                }
            }
            return res.status(405).json({ error: 'Method not allowed' });
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

        // Route: /api/video-titles
        if (route === 'video-titles') {
            const videoId = subRoute || null;

            if (req.method === 'GET') {
                const [titles] = await db.execute('SELECT video_id as id, title FROM video_titles');
                // Convert to a more convenient record format {id: title}
                const titleMap = {};
                titles.forEach(t => titleMap[t.id] = t.title);
                return res.status(200).json(titleMap);
            }

            if (req.method === 'POST') {
                const { id, title } = req.body;
                if (!id || !title) {
                    return res.status(400).json({ error: 'Video ID and title are required' });
                }
                // Use INSERT ... ON DUPLICATE KEY UPDATE for atomic upsert
                await db.execute(
                    'INSERT INTO video_titles (video_id, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = ?',
                    [id, title, title]
                );
                return res.status(200).json({ id, title, updated: true });
            }

            if (req.method === 'DELETE' && videoId) {
                await db.execute('DELETE FROM video_titles WHERE video_id = ?', [videoId]);
                return res.status(200).json({ deleted: true, id: videoId });
            }

            return res.status(405).json({ error: 'Method not allowed for video-titles' });
        }

        // Route: /api/ai-memories
        if (route === 'ai-memories') {
            if (req.method === 'GET') {
                const [memories] = await db.execute(
                    `SELECT id, category, content, confidence, source, created_at, updated_at 
                     FROM ai_user_memories 
                     WHERE is_active = TRUE 
                     ORDER BY source DESC, category, updated_at DESC`
                );
                return res.status(200).json({
                    count: memories.length,
                    memories: memories
                });
            }

            // POST: User manually adds a memory
            if (req.method === 'POST') {
                const { category, content } = req.body;
                if (!category || !content) {
                    return res.status(400).json({ error: 'category and content required' });
                }

                // Valid categories for user-added memories
                const validCategories = [
                    'exam_goal', 'weak_subject', 'strong_subject', 'study_preference',
                    'schedule', 'milestone', 'personal', 'custom'
                ];

                if (!validCategories.includes(category)) {
                    return res.status(400).json({
                        error: 'Invalid category',
                        validCategories
                    });
                }

                const newId = generateId();
                await db.execute(
                    `INSERT INTO ai_user_memories (id, category, content, source) VALUES (?, ?, ?, 'user')`,
                    [newId, category, content]
                );

                return res.status(201).json({
                    id: newId,
                    category,
                    content,
                    source: 'user',
                    message: 'Memory added successfully'
                });
            }

            // DELETE: Users can only delete user-created memories (not AI-created)
            if (req.method === 'DELETE') {
                const memoryId = subRoute || null;

                if (memoryId === 'all') {
                    // Only delete user-created memories
                    const [result] = await db.execute("DELETE FROM ai_user_memories WHERE source = 'user'");
                    return res.status(200).json({ deleted: 'all user memories', count: result.affectedRows });
                }

                if (memoryId) {
                    // Check if it's a user-created memory before deleting
                    const [check] = await db.execute('SELECT source FROM ai_user_memories WHERE id = ?', [memoryId]);

                    if (check.length === 0) {
                        return res.status(404).json({ error: 'Memory not found' });
                    }

                    if (check[0].source === 'ai') {
                        return res.status(403).json({
                            error: 'Cannot delete AI-created memories. Only the AI can manage its own memories.'
                        });
                    }

                    await db.execute('DELETE FROM ai_user_memories WHERE id = ?', [memoryId]);
                    return res.status(200).json({ deleted: memoryId });
                }

                return res.status(400).json({ error: 'Provide memory id or use /all' });
            }

            return res.status(405).json({ error: 'Method not allowed for ai-memories' });
        }

        // Route: /api/goals
        if (route === 'goals') {
            if (req.method === 'GET') {
                const [goals] = await db.execute('SELECT daily_focus_minutes as dailyFocusMinutes, target_efficiency as targetEfficiency FROM user_goals WHERE id = "current"');
                if (goals.length === 0) {
                    // Return defaults if none set
                    return res.status(200).json({ dailyFocusMinutes: 240, targetEfficiency: 80 });
                }
                return res.status(200).json(goals[0]);
            }

            if (req.method === 'POST') {
                const { dailyFocusMinutes, targetEfficiency } = req.body;
                await db.execute(
                    `INSERT INTO user_goals (id, daily_focus_minutes, target_efficiency) 
                     VALUES ("current", ?, ?) 
                     ON DUPLICATE KEY UPDATE daily_focus_minutes = ?, target_efficiency = ?, updated_at = CURRENT_TIMESTAMP`,
                    [dailyFocusMinutes || 240, targetEfficiency || 80, dailyFocusMinutes || 240, targetEfficiency || 80]
                );
                return res.status(200).json({ dailyFocusMinutes, targetEfficiency, updated: true });
            }

            return res.status(405).json({ error: 'Method not allowed for goals' });
        }

        // Helper: parse JSON safely
        const parseJSON = (str, fallback = []) => {
            if (!str) return fallback;
            if (typeof str === 'object') return str;
            try { return JSON.parse(str); } catch (e) { return fallback; }
        };

        // Route: /api/notes
        if (route === 'notes') {
            const noteId = subRoute || req.query.id || null;
            const action = req.query.action || null;

            // Handle attach-screenshot
            if (action === 'attach-screenshot') {
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                const { imageData, noteId: bodyNoteId, title, subject, description, links, imageName, createNew } = req.body;
                if (!imageData) return res.status(400).json({ error: 'Missing imageData' });

                const telegramUrl = await uploadToTelegram(imageData, title);
                const imageObject = { url: telegramUrl, name: imageName || '' };

                if (createNew) {
                    const newNoteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await db.execute(
                        `INSERT INTO learning_notes (id, type, subject, title, description, images, links) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [newNoteId, 'concept', subject || 'General', title || 'Capture', description || '', JSON.stringify([imageObject]), JSON.stringify(links || [])]
                    );
                    return res.status(201).json({ success: true, message: 'New note created', noteId: newNoteId, url: telegramUrl });
                } else {
                    const tid = bodyNoteId || noteId;
                    if (!tid) return res.status(400).json({ error: 'Missing noteId' });
                    const [rows] = await db.execute('SELECT images FROM learning_notes WHERE id = ?', [tid]);
                    if (rows.length === 0) return res.status(404).json({ error: 'Note not found' });
                    let currentImages = parseJSON(rows[0].images);
                    currentImages.push(imageObject);
                    await db.execute('UPDATE learning_notes SET images = ? WHERE id = ?', [JSON.stringify(currentImages), tid]);
                    return res.status(200).json({ success: true, message: 'Attached to note', noteId: tid, url: telegramUrl });
                }
            }

            if (req.method === 'GET') {
                if (noteId) {
                    const [data] = await db.execute('SELECT * FROM learning_notes WHERE id = ?', [noteId]);
                    if (data.length === 0) return res.status(404).json({ error: 'Note not found' });
                    const row = data[0];
                    const note = {
                        ...row,
                        images: parseJSON(row.images),
                        links: parseJSON(row.links),
                        is_revised: Boolean(row.is_revised),
                        revision_count: Number(row.revision_count || 0)
                    };
                    return res.status(200).json(note);
                } else {
                    const [data] = await db.execute('SELECT * FROM learning_notes ORDER BY created_at DESC');
                    const notes = data.map(row => ({
                        ...row,
                        images: parseJSON(row.images),
                        links: parseJSON(row.links),
                        is_revised: Boolean(row.is_revised),
                        revision_count: Number(row.revision_count || 0)
                    }));
                    return res.status(200).json(notes);
                }
            }

            if (req.method === 'POST') {
                const n = req.body;
                await db.execute(
                    `INSERT INTO learning_notes (id, type, subject, topic, title, description, tags, priority, source, images, links) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [n.id || generateId(), n.type || 'concept', n.subject || 'General', n.topic || '', n.title || 'Untitled', n.description || '', n.tags || '', n.priority || 'medium', n.source || 'portal', JSON.stringify(n.images || []), JSON.stringify(n.links || [])]
                );
                return res.status(201).json({ success: true, message: 'Note created' });
            }

            if (req.method === 'PUT' && noteId) {
                const n = req.body;
                await db.execute(
                    `UPDATE learning_notes SET type=?, subject=?, topic=?, title=?, description=?, tags=?, priority=?, images=?, links=? WHERE id=?`,
                    [n.type, n.subject, n.topic, n.title, n.description, n.tags, n.priority, JSON.stringify(n.images || []), JSON.stringify(n.links || []), noteId]
                );
                return res.status(200).json({ message: 'Note updated' });
            }

            if (req.method === 'DELETE') {
                const tid = noteId || req.query.id;
                if (!tid) return res.status(400).json({ error: 'Missing note id' });
                await db.execute('DELETE FROM learning_notes WHERE id = ?', [tid]);
                return res.status(200).json({ message: 'Note deleted' });
            }

            return res.status(405).json({ error: 'Method not allowed for notes' });
        }

        // Route: /api/chapter-tracker
        if (route === 'chapter-tracker') {
            const action = req.query.action || null;

            if (action === 'attach-screenshot') {
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                const { imageData, chapterId, entryId, subject, chapterName, text, description, urls, imageName, createNewChapter, createNewEntry, type, tags, priority } = req.body;
                if (!imageData) return res.status(400).json({ error: 'Missing imageData' });

                const telegramUrl = await uploadToTelegram(imageData, text || imageName || 'Screenshot');
                const imageObject = { url: telegramUrl, name: imageName || '' };

                if (entryId) {
                    const [rows] = await db.execute('SELECT images FROM entries WHERE id = ?', [entryId]);
                    if (rows.length === 0) return res.status(404).json({ error: 'Entry not found' });
                    let currentImages = parseJSON(rows[0].images);
                    currentImages.push(imageObject);
                    await db.execute('UPDATE entries SET images = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(currentImages), entryId]);
                    return res.status(200).json({ success: true, message: 'Screenshot attached', entryId });
                }

                let targetChapterId = chapterId;
                if (createNewChapter) {
                    const tid = `chapter_${Date.now()}`;
                    await db.execute('INSERT INTO chapters (id, subject, name) VALUES (?, ?, ?)', [tid, subject || 'General', chapterName || 'New Chapter']);
                    targetChapterId = tid;
                }

                if (!targetChapterId) return res.status(400).json({ error: 'Missing chapterId' });

                const newEntryId = `entry_${Date.now()}`;
                await db.execute(
                    `INSERT INTO entries (id, chapter_id, text, type, images, urls, description, tags, priority) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newEntryId, targetChapterId, text || 'Screenshot', type || 'concept', JSON.stringify([imageObject]), JSON.stringify(urls || []), description || '', tags || '', priority || 'medium']
                );
                return res.status(201).json({ success: true, message: 'New entry created', chapterId: targetChapterId, entryId: newEntryId });
            }

            if (req.method === 'GET') {
                const [chapters] = await db.execute('SELECT * FROM chapters ORDER BY created_at ASC');
                const [entries] = await db.execute('SELECT * FROM entries ORDER BY created_at ASC');
                const parsedEntries = entries.map(e => ({
                    ...e,
                    images: parseJSON(e.images),
                    urls: parseJSON(e.urls),
                    description: e.description || '',
                    tags: e.tags || '',
                    priority: e.priority || 'medium'
                }));
                return res.status(200).json({ chapters, entries: parsedEntries });
            }

            if (req.method === 'POST') {
                const { action: bodyAction, data } = req.body;
                if (bodyAction === 'add_chapter') {
                    await db.execute('INSERT INTO chapters (id, subject, name) VALUES (?, ?, ?)', [data.id, data.subject, data.name]);
                    return res.status(200).json({ success: true });
                } else if (bodyAction === 'add_entry') {
                    await db.execute(
                        `INSERT INTO entries (id, chapter_id, text, type, images, urls, description, tags, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [data.id, data.chapterId, data.text || '', data.type || 'question', JSON.stringify(data.images || []), JSON.stringify(data.urls || []), data.description || '', data.tags || '', data.priority || 'medium']
                    );
                    return res.status(200).json({ success: true });
                } else if (bodyAction === 'update_entry') {
                    await db.execute(
                        `UPDATE entries SET text=?, images=?, urls=?, description=?, tags=?, priority=?, updated_at=NOW() WHERE id=?`,
                        [data.text || '', JSON.stringify(data.images || []), JSON.stringify(data.urls || []), data.description || '', data.tags || '', data.priority || 'medium', data.id]
                    );
                    return res.status(200).json({ success: true });
                }
            }

            if (req.method === 'DELETE') {
                const { type: deleteType, action: deleteAction, id: deleteId } = req.body;
                // Support both 'type' and 'action' for delete target
                const table = (deleteType === 'chapter' || deleteAction === 'delete_chapter') ? 'chapters' : 'entries';
                if (!deleteId) return res.status(400).json({ error: 'Missing id for delete' });
                await db.execute(`DELETE FROM ${table} WHERE id = ?`, [deleteId]);
                return res.status(200).json({ success: true });
            }

            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Catch-all for unknown routes
        return res.status(404).json({ error: `Route ${route} not found` });

    } catch (error) {
        console.error('[Unified API] Error:', error);
        return res.status(500).json({
            error: error.message,
            hint: error.message.includes('Missing required') ? 'Check Vercel Project Settings for Environment Variables' : undefined
        });
    }
}

// Helper: Upload base64 image to Telegram via Cloudflare Worker
async function uploadToTelegram(base64Data, title) {
    const WORKER_URL = 'https://ai-api-proxy.kulkuljujum.workers.dev';
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');
    const timestamp = Date.now();
    const safeName = (title || 'screenshot').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `capture_${safeName}_${timestamp}.png`;

    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('document', blob, filename);

    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'X-Provider': 'telegram-upload' },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Telegram upload failed');
    }

    const data = await response.json();
    return `/api/storage/telegram-proxy?fileId=${data.fileId}`;
}

