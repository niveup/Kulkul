import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10,
});

export default async function handler(req, res) {
    // Enable CORS for Chrome extension
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method } = req;
    const { id, action } = req.query;

    // Handle attach-screenshot action
    if (action === 'attach-screenshot') {
        return handleAttachScreenshot(req, res);
    }

    try {
        const connection = await pool.getConnection();

        // Helper to parse JSON safely
        const parseJSON = (str, fallback = []) => {
            if (!str) return fallback;
            if (typeof str === 'object') return str;
            try {
                return JSON.parse(str);
            } catch (e) {
                console.warn('JSON Parse Error:', e.message, 'for value:', str);
                return fallback;
            }
        };

        switch (method) {
            case 'GET':
                let rows;
                if (id) {
                    const [data] = await connection.execute('SELECT * FROM learning_notes WHERE id = ?', [id]);
                    rows = data;
                } else {
                    const [data] = await connection.execute('SELECT * FROM learning_notes ORDER BY created_at DESC');
                    rows = data;
                }

                // Ensure JSON columns are parsed
                const parsedRows = rows.map(row => ({
                    ...row,
                    images: parseJSON(row.images),
                    links: parseJSON(row.links)
                }));

                if (id) {
                    res.status(200).json(parsedRows[0] || {});
                } else {
                    res.status(200).json(parsedRows);
                }
                break;

            case 'POST':
                const newNote = req.body;
                console.log('API POST: Creating note:', newNote.title, 'with images:', newNote.images?.length);
                await connection.execute(
                    `INSERT INTO learning_notes (id, type, subject, topic, title, description, tags, priority, source, images, links) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newNote.id,
                        newNote.type,
                        newNote.subject,
                        newNote.topic,
                        newNote.title,
                        newNote.description,
                        newNote.tags,
                        newNote.priority,
                        newNote.source,
                        JSON.stringify(Array.isArray(newNote.images) ? newNote.images : []),
                        JSON.stringify(Array.isArray(newNote.links) ? newNote.links : [])
                    ]
                );
                console.log('API POST: Success');
                res.status(201).json({ message: 'Note created successfully' });
                break;

            case 'PUT':
                const updatedNote = req.body;
                console.log('API PUT: Updating note:', id, 'with images:', updatedNote.images?.length);
                await connection.execute(
                    `UPDATE learning_notes SET 
                        type = ?, subject = ?, topic = ?, title = ?, 
                        description = ?, tags = ?, priority = ?, source = ?, 
                        is_revised = ?, revision_count = ?, images = ?, links = ?
                     WHERE id = ?`,
                    [
                        updatedNote.type,
                        updatedNote.subject,
                        updatedNote.topic,
                        updatedNote.title,
                        updatedNote.description,
                        updatedNote.tags,
                        updatedNote.priority,
                        updatedNote.source,
                        updatedNote.is_revised,
                        updatedNote.revision_count,
                        JSON.stringify(Array.isArray(updatedNote.images) ? updatedNote.images : []),
                        JSON.stringify(Array.isArray(updatedNote.links) ? updatedNote.links : []),
                        id
                    ]
                );
                console.log('API PUT: Success');
                res.status(200).json({ message: 'Note updated successfully' });
                break;

            case 'DELETE':
                console.log('API DELETE: Deleting note:', id);
                await connection.execute('DELETE FROM learning_notes WHERE id = ?', [id]);
                res.status(200).json({ message: 'Note deleted successfully' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }

        connection.release();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Internal handler for attach-screenshot action
async function handleAttachScreenshot(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageData, noteId, title, subject, description, links, imageName, createNew } = req.body;

    if (!imageData) {
        return res.status(400).json({ error: 'Missing imageData' });
    }

    try {
        console.log('[Attach Screenshot] Starting upload with name:', imageName || '(none)');

        // Upload to Telegram via Cloudflare Worker
        const telegramUrl = await uploadToTelegram(imageData, title);
        console.log('[Attach Screenshot] Telegram upload complete:', telegramUrl);

        // Create image object with name and URL
        const imageObject = {
            url: telegramUrl,
            name: imageName || ''
        };

        const connection = await pool.getConnection();

        if (createNew) {
            const newNoteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Format links as JSON array
            const linksJson = JSON.stringify(Array.isArray(links) ? links : []);

            await connection.execute(
                `INSERT INTO learning_notes (id, type, subject, topic, title, description, tags, priority, source, images, links) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newNoteId,
                    'concept', // Default type
                    subject || 'General',
                    null, // Topic
                    title || 'Screenshot Capture',
                    description || 'Captured via Quick Capture extension',
                    null, // Tags
                    'medium', // Priority
                    null,
                    JSON.stringify([imageObject]), // Store as object with name
                    linksJson
                ]
            );

            connection.release();
            return res.status(201).json({ success: true, message: 'New note created with screenshot', noteId: newNoteId, url: telegramUrl });
        } else {
            if (!noteId) {
                connection.release();
                return res.status(400).json({ error: 'Missing noteId for attachment' });
            }

            const [rows] = await connection.execute('SELECT images FROM learning_notes WHERE id = ?', [noteId]);

            if (rows.length === 0) {
                connection.release();
                return res.status(404).json({ error: 'Note not found' });
            }

            let currentImages = [];
            try { currentImages = JSON.parse(rows[0].images || '[]'); } catch (e) { currentImages = []; }

            // Append new image object (handles both old string format and new object format)
            currentImages.push(imageObject);

            await connection.execute('UPDATE learning_notes SET images = ? WHERE id = ?', [JSON.stringify(currentImages), noteId]);

            connection.release();
            return res.status(200).json({ success: true, message: 'Screenshot attached to note', noteId, url: telegramUrl });
        }
    } catch (error) {
        console.error('[Attach Screenshot] Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

// Upload base64 image to Telegram via Cloudflare Worker
async function uploadToTelegram(base64Data, title) {
    const WORKER_URL = 'https://ai-api-proxy.kulkuljujum.workers.dev';

    // Convert base64 to Blob
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');

    const timestamp = Date.now();
    const safeName = (title || 'screenshot').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `capture_${safeName}_${timestamp}.png`;

    console.log('[Telegram Upload] Uploading file:', filename, 'Size:', buffer.length);

    // Create a FormData-like body for the worker
    // The Cloudflare Worker expects FormData with 'document' field
    const formData = new FormData();

    // Create a Blob from the buffer
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('document', blob, filename);

    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
            'X-Provider': 'telegram-upload'
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Telegram upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.fileId) {
        throw new Error('Invalid response from Telegram upload');
    }

    // Return Vercel proxy URL for viewing
    const viewUrl = `/api/storage/telegram-proxy?fileId=${data.fileId}`;
    console.log('[Telegram Upload] Upload complete:', viewUrl);

    return viewUrl;
}


