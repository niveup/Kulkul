/**
 * Vault API - Consolidated endpoint with catch-all routing
 * Handles: list, save, delete, trash, restore, permanent-delete
 */
import { getDbPool, initDatabase, generateId } from '../../src/lib/db.js';

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
                    folder_id VARCHAR(36) DEFAULT NULL,
                    deleted_at TIMESTAMP NULL DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created (created_at),
                    INDEX idx_deleted (deleted_at),
                    INDEX idx_folder (folder_id)
                )
            `);
        } catch (e) { /* Table exists */ }

        // Add folder_id column if it doesn't exist (for existing databases)
        try {
            await db.execute(`
                ALTER TABLE pdf_uploads 
                ADD COLUMN folder_id VARCHAR(36) DEFAULT NULL,
                ADD INDEX idx_folder (folder_id)
            `);
        } catch (e) { /* Column exists */ }

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
                SELECT id, filename, size_bytes, mega_node_id, mega_download_url, folder_id, created_at
                FROM pdf_uploads
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            `);

            const files = rows.map(row => {
                // Check if this is a Telegram file (mega_node_id = 'telegram')
                if (row.mega_node_id === 'telegram' && row.mega_download_url) {
                    try {
                        const telegramData = JSON.parse(row.mega_download_url);
                        return {
                            id: row.id,
                            name: row.filename,
                            size: row.size_bytes,
                            isChunked: telegramData.isChunked || false,
                            chunks: telegramData.chunks || null,
                            downloadUrl: telegramData.downloadUrl || null,
                            type: telegramData.type || 'application/pdf',
                            folderId: row.folder_id,
                            createdAt: row.created_at,
                            storagePlatform: 'telegram'
                        };
                    } catch (e) {
                        // Fall back to regular format if JSON parse fails
                    }
                }

                // Legacy MEGA format or fallback
                return {
                    id: row.id,
                    name: row.filename,
                    size: row.size_bytes,
                    megaNodeId: row.mega_node_id,
                    downloadUrl: row.mega_download_url,
                    folderId: row.folder_id,
                    createdAt: row.created_at,
                    storagePlatform: 'mega'
                };
            });

            return res.status(200).json({ success: true, files });
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

        // GET /api/vault/folders - List all folders
        if (req.method === 'GET' && action === 'folders') {
            // Ensure folders table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS vault_folders (
                        id VARCHAR(36) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        parent_id VARCHAR(36) DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_parent (parent_id)
                    )
                `);
            } catch (e) { /* Table exists */ }

            const [rows] = await db.execute(`
                SELECT id, name, parent_id, created_at
                FROM vault_folders
                ORDER BY name ASC
            `);

            return res.status(200).json({
                success: true,
                folders: rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    parentId: row.parent_id,
                    createdAt: row.created_at
                }))
            });
        }

        // POST /api/vault/folders - Create or delete a folder
        if (req.method === 'POST' && action === 'folders') {
            const { type, name, parentId, id } = req.body;

            // Ensure folders table exists
            try {
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS vault_folders (
                        id VARCHAR(36) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        parent_id VARCHAR(36) DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_parent (parent_id)
                    )
                `);
            } catch (e) { /* Table exists */ }

            if (type === 'create') {
                if (!name) {
                    return res.status(400).json({ error: 'Folder name is required' });
                }

                const folderId = generateId();
                await db.execute(`
                    INSERT INTO vault_folders (id, name, parent_id)
                    VALUES (?, ?, ?)
                `, [folderId, name, parentId || null]);

                return res.status(201).json({
                    success: true,
                    folder: { id: folderId, name, parentId: parentId || null }
                });
            }

            if (type === 'delete') {
                if (!id) {
                    return res.status(400).json({ error: 'Folder ID is required' });
                }

                // Move files in this folder to root (null folder_id)
                await db.execute(`
                    UPDATE pdf_uploads SET folder_id = NULL WHERE folder_id = ?
                `, [id]);

                // Delete the folder
                await db.execute(`DELETE FROM vault_folders WHERE id = ?`, [id]);

                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ error: 'Invalid type. Use "create" or "delete"' });
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

        // POST /api/vault/save-telegram - Save Telegram file metadata (including chunked files)
        if (req.method === 'POST' && action === 'save-telegram') {
            const { id, name, size, type, isChunked, chunks, downloadUrl, folderId } = req.body;

            if (!id || !name) {
                return res.status(400).json({ error: 'Missing required fields: id, name' });
            }

            // Store Telegram file data with chunk info in mega_download_url (JSON for chunked files)
            const telegramData = JSON.stringify({
                platform: 'telegram',
                isChunked: isChunked || false,
                chunks: chunks || null,
                downloadUrl: downloadUrl || null,
                type: type || 'application/octet-stream'
            });

            await db.execute(`
                INSERT INTO pdf_uploads (id, filename, size_bytes, mega_node_id, mega_download_url, folder_id)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                filename = VALUES(filename),
                size_bytes = VALUES(size_bytes),
                mega_download_url = VALUES(mega_download_url)
            `, [id, name, size || 0, 'telegram', telegramData, folderId || null]);

            return res.status(201).json({
                success: true,
                file: { id, name, size, isChunked, downloadUrl }
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

        // Helper to find file recursively in MEGA tree
        const findFile = (targetId, filename, currentFolder, storage) => {
            if (!targetId && !filename) return null;

            // Check storage flat map first (v1.3.9 standard lookup)
            if (targetId && storage.files && storage.files[targetId]) {
                return storage.files[targetId];
            }

            // Total search through all files in registry
            if (targetId && storage.files) {
                const allFiles = Object.values(storage.files);
                const found = allFiles.find(f => f.nodeId === targetId || f.handle === targetId || (filename && f.name === filename));
                if (found) return found;
            }

            if (!currentFolder || !currentFolder.children) return null;

            // Check direct children
            let found = currentFolder.children.find(f => f.nodeId === targetId || f.handle === targetId || (filename && f.name === filename));
            if (found) return found;

            // Recursively check subfolders
            for (const child of currentFolder.children) {
                if (child.directory) {
                    found = findFile(targetId, filename, child, storage);
                    if (found) return found;
                }
            }
            return null;
        };

        // Extract handle from public URL
        const extractHandle = (url) => {
            if (!url) return null;
            try {
                // Format: https://mega.nz/file/HANDLE#KEY or https://mega.nz/#!HANDLE!KEY
                const parts = url.split('/');
                const filePart = parts.find(p => p.includes('file') || p.includes('#!'));
                if (!filePart) return null;

                if (url.includes('file/')) {
                    const handlePart = url.split('file/')[1].split('#')[0];
                    return handlePart;
                } else if (url.includes('#!')) {
                    const handlePart = url.split('#!')[1].split('!')[0];
                    return handlePart;
                }
            } catch (e) {
                return null;
            }
            return null;
        };

        // Shared Robust Deletion Trigger - PRODUCTION-GRADE VERSION
        const triggerMegaDeletion = async (megaNodeId, filename, downloadUrl) => {
            console.log('[Vault API] ========================================');
            console.log('[Vault API] MEGA DELETION STARTED');
            console.log('[Vault API] Input:', { megaNodeId, filename, downloadUrl });
            console.log('[Vault API] ========================================');

            const mega = await import('megajs');
            const email = process.env.MEGA_EMAIL || process.env.VITE_MEGA_EMAIL;
            const password = process.env.MEGA_PASSWORD || process.env.VITE_MEGA_PASSWORD;

            if (!email || !password) {
                console.error('[Vault API] ❌ MEGA credentials missing on server');
                console.log('[Vault API] Available env vars:', Object.keys(process.env).filter(k => k.includes('MEGA')));
                return false;
            }

            // Extract all possible identifiers from the URL
            const extractAllHandles = (url) => {
                if (!url) return [];
                const handles = [];
                try {
                    // Format 1: https://mega.nz/file/HANDLE#KEY
                    if (url.includes('/file/')) {
                        const match = url.match(/\/file\/([^#]+)/);
                        if (match) handles.push(match[1]);
                    }
                    // Format 2: https://mega.nz/#!HANDLE!KEY
                    if (url.includes('#!')) {
                        const match = url.match(/#!([^!]+)/);
                        if (match) handles.push(match[1]);
                    }
                    // Format 3: Direct handle in URL
                    const urlParts = url.split('/');
                    urlParts.forEach(p => {
                        if (p.length >= 8 && p.length <= 12 && !p.includes('.') && !p.includes('#')) {
                            handles.push(p);
                        }
                    });
                } catch (e) {
                    console.log('[Vault API] Handle extraction error:', e.message);
                }
                return [...new Set(handles)]; // Remove duplicates
            };

            try {
                // Create a single storage instance and RELOAD to ensure fresh data
                console.log('[Vault API] Connecting to MEGA storage...');
                const storage = await new mega.Storage({ email, password }).ready;

                // Try to reload to get the absolute latest file tree
                try {
                    if (storage.reload) {
                        console.log('[Vault API] Reloading storage tree...');
                        await storage.reload();
                        console.log('[Vault API] Storage reloaded successfully');
                    }
                } catch (reloadErr) {
                    console.log('[Vault API] Reload not available or failed:', reloadErr.message);
                }

                // Get all files in storage
                const allFiles = storage.files ? Object.values(storage.files).filter(f => f && !f.directory) : [];
                console.log('[Vault API] Total files in storage:', allFiles.length);

                // Log first 20 filenames for debugging
                if (allFiles.length > 0) {
                    const fileList = allFiles.slice(0, 20).map(f => ({
                        name: f.name,
                        nodeId: f.nodeId,
                        handle: f.handle
                    }));
                    console.log('[Vault API] Sample files:', JSON.stringify(fileList, null, 2));
                }

                // Collect all possible search terms
                const urlHandles = extractAllHandles(downloadUrl);
                const searchIds = [megaNodeId, ...urlHandles].filter(Boolean);
                console.log('[Vault API] Search IDs:', searchIds);

                // STEP 1: Try to resolve file from URL first to get accurate identification
                let targetName = filename;
                let targetNodeId = megaNodeId;

                if (downloadUrl && downloadUrl.includes('mega.nz')) {
                    try {
                        console.log('[Vault API] Resolving file attributes from URL...');
                        const urlFile = mega.File.fromURL(downloadUrl);
                        await urlFile.loadAttributes();
                        targetName = urlFile.name;
                        targetNodeId = urlFile.nodeId || urlFile.handle;
                        console.log('[Vault API] URL resolved:', { name: targetName, nodeId: targetNodeId });

                        // Add to search IDs
                        if (targetNodeId && !searchIds.includes(targetNodeId)) {
                            searchIds.push(targetNodeId);
                        }
                    } catch (urlErr) {
                        console.log('[Vault API] URL resolution failed:', urlErr.message);
                        // This is OK, continue with other methods
                    }
                }

                // STEP 2: Search for file using all possible identifiers
                console.log('[Vault API] Searching for file with IDs:', searchIds, 'or name:', targetName);

                let foundFile = null;

                // Method A: Direct lookup by nodeId/handle
                for (const id of searchIds) {
                    if (storage.files && storage.files[id]) {
                        foundFile = storage.files[id];
                        console.log('[Vault API] ✓ Found via direct ID lookup:', id);
                        break;
                    }
                }

                // Method B: Search all files by nodeId or handle
                if (!foundFile) {
                    for (const file of allFiles) {
                        if (searchIds.includes(file.nodeId) || searchIds.includes(file.handle)) {
                            foundFile = file;
                            console.log('[Vault API] ✓ Found via ID search in file list');
                            break;
                        }
                    }
                }

                // Method C: Search by filename
                if (!foundFile && targetName) {
                    foundFile = allFiles.find(f => f.name === targetName);
                    if (foundFile) {
                        console.log('[Vault API] ✓ Found via filename match:', targetName);
                    }
                }

                // Method D: Partial filename match (for renamed/modified files)
                if (!foundFile && targetName) {
                    const baseName = targetName.split('.')[0];
                    foundFile = allFiles.find(f => f.name && f.name.includes(baseName));
                    if (foundFile) {
                        console.log('[Vault API] ✓ Found via partial filename match:', foundFile.name);
                    }
                }

                // STEP 3: Delete if found
                if (foundFile) {
                    console.log('[Vault API] 🎯 FILE LOCATED:', {
                        name: foundFile.name,
                        nodeId: foundFile.nodeId,
                        handle: foundFile.handle
                    });

                    try {
                        await foundFile.delete(true); // true = permanent delete
                        console.log('[Vault API] ✅ SUCCESS: File permanently deleted from MEGA');
                        return true;
                    } catch (deleteErr) {
                        console.error('[Vault API] Delete failed:', deleteErr.message);

                        // Try moving to trash instead
                        try {
                            await foundFile.delete(false);
                            console.log('[Vault API] ✅ SUCCESS: File moved to MEGA trash');
                            return true;
                        } catch (trashErr) {
                            console.error('[Vault API] Trash move also failed:', trashErr.message);
                        }
                    }
                }

                // STEP 4: File not found - log comprehensive debug info
                console.log('[Vault API] ❌ FILE NOT FOUND IN STORAGE');
                console.log('[Vault API] Debug Info:');
                console.log('[Vault API] - Searched for IDs:', searchIds);
                console.log('[Vault API] - Searched for name:', targetName);
                console.log('[Vault API] - Total files in account:', allFiles.length);

                // List all file names for manual inspection
                if (allFiles.length < 50) {
                    console.log('[Vault API] - All files:', allFiles.map(f => f.name));
                }

                return false;

            } catch (err) {
                console.error('[Vault API] ❌ MEGA CONNECTION ERROR:', err.message);
                console.error('[Vault API] Stack:', err.stack);
                return false;
            }
        };

        // POST /api/vault/permanent-delete
        if (req.method === 'POST' && action === 'permanent-delete') {
            const { id: fileId } = req.body;
            if (!fileId) return res.status(400).json({ error: 'Missing required field: id' });

            const [fileRows] = await db.execute(`
                SELECT mega_node_id, filename, mega_download_url FROM pdf_uploads WHERE id = ?
            `, [fileId]);

            if (fileRows.length === 0) {
                return res.status(404).json({ error: 'File not found' });
            }

            const { mega_node_id: megaNodeId, filename, mega_download_url: downloadUrl } = fileRows[0];

            // Trigger MEGA deletion
            await triggerMegaDeletion(megaNodeId, filename, downloadUrl);

            // Always delete from DB
            await db.execute(`DELETE FROM pdf_uploads WHERE id = ?`, [fileId]);

            return res.status(200).json({
                success: true,
                message: 'File deleted from DB (and MEGA if found)',
                megaNodeId
            });
        }

        // POST /api/vault/delete-by-url
        if (req.method === 'POST' && action === 'delete-by-url') {
            const { url } = req.body;
            if (!url) return res.status(400).json({ error: 'Missing required field: url' });

            const normalizedUrl = url.split('#')[0];
            console.log('[Vault API] Deleting by URL:', normalizedUrl);

            // Try database lookup first (for Vault files)
            const [rows] = await db.execute(`
                SELECT id, filename, mega_node_id, mega_download_url 
                FROM pdf_uploads 
                WHERE mega_download_url LIKE ?
            `, [`%${normalizedUrl}%`]);

            if (rows.length > 0) {
                const { id, filename, mega_node_id: megaNodeId, mega_download_url: downloadUrl } = rows[0];

                await triggerMegaDeletion(megaNodeId, filename, downloadUrl);

                // Always delete from DB
                await db.execute(`DELETE FROM pdf_uploads WHERE id = ?`, [id]);

                return res.status(200).json({ success: true, message: 'File removed from Vault and MEGA' });
            }

            // FALLBACK: For Notes images (not in pdf_uploads), delete directly from MEGA by URL
            console.log('[Vault API] File not in DB, attempting direct MEGA deletion by URL...');
            const directDeleted = await triggerMegaDeletion(null, null, url);

            if (directDeleted) {
                return res.status(200).json({ success: true, message: 'File removed from MEGA directly' });
            }

            // Even if MEGA deletion failed (file may already be gone), return success to allow note cleanup
            console.log('[Vault API] Direct MEGA deletion returned false, but allowing note cleanup to proceed.');
            return res.status(200).json({ success: true, message: 'File reference cleaned (may not have been on MEGA)' });
        }

        // ... existing legacy endpoints ...

        // ==========================================
        // FOLDER OPERATIONS
        // ==========================================

        // GET /api/vault/folders - List all folders
        if (req.method === 'GET' && action === 'folders') {
            const [rows] = await db.execute(`
                SELECT id, name, parent_id, color, icon, created_at 
                FROM vault_folders 
                ORDER BY name ASC
            `);

            return res.status(200).json({
                success: true,
                folders: rows.map(r => ({
                    id: r.id,
                    name: r.name,
                    parentId: r.parent_id,
                    color: r.color,
                    icon: r.icon,
                    createdAt: r.created_at
                }))
            });
        }

        // POST /api/vault/folders/create
        if (req.method === 'POST' && action === 'folders' && req.query.subaction === 'create') {
            const { name, parentId, color } = req.body;
            const folderId = generateId();

            await db.execute(`
                INSERT INTO vault_folders (id, name, parent_id, color)
                VALUES (?, ?, ?, ?)
            `, [folderId, name, parentId || null, color || '#6366f1']);

            return res.status(201).json({
                success: true,
                folder: { id: folderId, name, parentId, color, createdAt: new Date() }
            });
        }

        // POST /api/vault/move-files - Batch move files to folder
        if (req.method === 'POST' && action === 'move-files') {
            const { fileIds, folderId } = req.body; // folderId can be null for root

            if (!Array.isArray(fileIds) || fileIds.length === 0) {
                return res.status(400).json({ error: 'No files specified' });
            }

            // Create placeholders for prepared statement: (?, ?, ?)
            const placeholders = fileIds.map(() => '?').join(',');

            await db.execute(`
                UPDATE pdf_uploads 
                SET folder_id = ? 
                WHERE id IN (${placeholders})
            `, [folderId || null, ...fileIds]);

            return res.status(200).json({ success: true, count: fileIds.length });
        }

        // ==========================================
        // TAG OPERATIONS
        // ==========================================

        // GET /api/vault/tags - List all tags
        if (req.method === 'GET' && action === 'tags') {
            const [rows] = await db.execute('SELECT * FROM vault_tags ORDER BY name ASC');
            return res.status(200).json({
                success: true,
                tags: rows.map(t => ({ id: t.id, name: t.name, color: t.color }))
            });
        }

        // POST /api/vault/tags/create
        if (req.method === 'POST' && action === 'tags' && req.query.subaction === 'create') {
            const { name, color } = req.body;
            const tagId = generateId();

            try {
                await db.execute(`
                    INSERT INTO vault_tags (id, name, color) VALUES (?, ?, ?)
                `, [tagId, name, color]);

                return res.status(201).json({ success: true, tag: { id: tagId, name, color } });
            } catch (e) {
                if (e.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Tag already exists' });
                }
                throw e;
            }
        }

        // ==========================================
        // ANNOTATION OPERATIONS
        // ==========================================

        // GET /api/vault/annotations - Get annotations for a file
        if (req.method === 'GET' && action === 'annotations') {
            const { fileId } = req.query;
            if (!fileId) return res.status(400).json({ error: 'Missing fileId' });

            const [rows] = await db.execute(`
                SELECT * FROM pdf_annotations WHERE file_id = ?
            `, [fileId]);

            return res.status(200).json({
                success: true,
                annotations: rows.map(a => ({
                    id: a.id,
                    fileId: a.file_id,
                    type: a.type,
                    pageNumber: a.page_number,
                    content: a.content,
                    position: { x: a.position_x, y: a.position_y, width: a.width, height: a.height },
                    color: a.color,
                    createdAt: a.created_at
                }))
            });
        }

        // POST /api/vault/annotations/save
        if (req.method === 'POST' && action === 'annotations' && req.query.subaction === 'save') {
            const { fileId, type, pageNumber, content, position, color } = req.body;
            const id = generateId();

            await db.execute(`
                INSERT INTO pdf_annotations 
                (id, file_id, type, page_number, content, position_x, position_y, width, height, color)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [id, fileId, type, pageNumber, content, position?.x, position?.y, position?.width, position?.height, color]);

            return res.status(201).json({ success: true, id });
        }

        return res.status(405).json({ error: `Action ${action} not allowed` });
    } catch (error) {
        console.error('[Vault API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
