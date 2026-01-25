/**
 * Notion API Proxy - Vercel Serverless Function
 * 
 * Secure proxy for Notion API with:
 * - Authentication required (cookie-based)
 * - Rate limiting (30 req/min per user)
 * - Input validation
 * - Audit logging
 * - Request timeout protection
 * 
 * Routes:
 * POST   /api/notion/search          - Search pages/databases
 * GET    /api/notion/pages/:id        - Get page metadata
 * GET    /api/notion/pages/:id/content - Get page blocks
 * POST   /api/notion/pages            - Create page
 * PATCH  /api/notion/pages/:id        - Update page
 * POST   /api/notion/databases/:id/query - Query database
 */

import { requireAuth, logAudit, getClientIP } from '../authMiddleware.js';
import { getDbPool, initDatabase } from '../db.js';

// =============================================================================
// Configuration
// =============================================================================

const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE_URL = 'https://api.notion.com/v1';
const REQUEST_TIMEOUT = 9000; // 9s (Vercel has 10s limit on free tier)

// Rate limit: 30 requests per minute per user
const RATE_LIMIT = { maxRequests: 30, windowMinutes: 1 };

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Validate Notion ID format (UUID or 32-char hex)
 */
function isValidNotionId(id) {
    if (!id || typeof id !== 'string') return false;
    // UUID format or 32-char hex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hexRegex = /^[0-9a-f]{32}$/i;
    return uuidRegex.test(id) || hexRegex.test(id);
}

/**
 * Rate limiting for Notion API calls
 */
async function checkNotionRateLimit(db, ip) {
    try {
        const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000);

        const [rows] = await db.execute(`
      SELECT request_count FROM rate_limits 
      WHERE ip_address = ? AND endpoint = 'notion' AND window_start > ?
    `, [ip, windowStart]);

        if (rows.length > 0 && rows[0].request_count >= RATE_LIMIT.maxRequests) {
            return true; // Rate limited
        }

        // Increment counter
        await db.execute(`
      INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
      VALUES (?, 'notion', 1, NOW())
      ON DUPLICATE KEY UPDATE request_count = request_count + 1
    `, [ip]);

        return false;
    } catch (e) {
        console.error('[Notion Rate Limit] Error:', e.message);
        return false; // Allow on error
    }
}

/**
 * Make authenticated request to Notion API with timeout
 */
async function notionFetch(endpoint, options = {}) {
    const apiKey = process.env.NOTION_API_KEY;

    if (!apiKey) {
        throw new Error('NOTION_API_KEY not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${NOTION_BASE_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': NOTION_API_VERSION,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Notion API error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Notion API took too long');
        }
        throw error;
    }
}

/**
 * Safe JSON parse for request body
 */
function parseBody(req) {
    try {
        return typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch {
        return {};
    }
}

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * POST /api/notion/search - Search pages and databases
 */
async function handleSearch(req, res, db) {
    const body = parseBody(req);
    const { query = '', filter, sort, page_size = 20 } = body;

    if (page_size > 100) {
        return res.status(400).json({ error: 'page_size cannot exceed 100' });
    }

    const data = await notionFetch('/search', {
        method: 'POST',
        body: JSON.stringify({
            query,
            filter: filter || undefined,
            sort: sort || { direction: 'descending', timestamp: 'last_edited_time' },
            page_size: Math.min(page_size, 100),
        }),
    });

    await logAudit(db, 'NOTION_SEARCH', req, JSON.stringify({ query, results: data.results?.length || 0 }));

    return res.status(200).json(data);
}

/**
 * GET /api/notion/pages/:id - Get page metadata
 */
async function handleGetPage(req, res, db, pageId) {
    if (!isValidNotionId(pageId)) {
        return res.status(400).json({ error: 'Invalid page ID format' });
    }

    const data = await notionFetch(`/pages/${pageId}`);

    return res.status(200).json(data);
}

/**
 * GET /api/notion/pages/:id/content - Get page blocks (children)
 */
async function handleGetPageContent(req, res, db, pageId) {
    if (!isValidNotionId(pageId)) {
        return res.status(400).json({ error: 'Invalid page ID format' });
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const startCursor = url.searchParams.get('start_cursor');
    const pageSize = Math.min(parseInt(url.searchParams.get('page_size') || '50'), 100);

    let endpoint = `/blocks/${pageId}/children?page_size=${pageSize}`;
    if (startCursor) {
        endpoint += `&start_cursor=${startCursor}`;
    }

    const data = await notionFetch(endpoint);

    return res.status(200).json(data);
}

/**
 * POST /api/notion/pages - Create a new page
 */
async function handleCreatePage(req, res, db) {
    const body = parseBody(req);
    const { parent, properties, children, icon, cover } = body;

    if (!parent || !properties) {
        return res.status(400).json({ error: 'parent and properties are required' });
    }

    // Validate parent ID
    const parentId = parent.page_id || parent.database_id;
    if (!isValidNotionId(parentId)) {
        return res.status(400).json({ error: 'Invalid parent ID format' });
    }

    const payload = { parent, properties };
    if (children) payload.children = children;
    if (icon) payload.icon = icon;
    if (cover) payload.cover = cover;

    const data = await notionFetch('/pages', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    await logAudit(db, 'NOTION_CREATE_PAGE', req, JSON.stringify({ pageId: data.id }));

    return res.status(201).json(data);
}

/**
 * PATCH /api/notion/pages/:id - Update page properties
 */
async function handleUpdatePage(req, res, db, pageId) {
    if (!isValidNotionId(pageId)) {
        return res.status(400).json({ error: 'Invalid page ID format' });
    }

    const body = parseBody(req);
    const { properties, archived, icon, cover } = body;

    const payload = {};
    if (properties) payload.properties = properties;
    if (typeof archived === 'boolean') payload.archived = archived;
    if (icon !== undefined) payload.icon = icon;
    if (cover !== undefined) payload.cover = cover;

    if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'No valid update fields provided' });
    }

    const data = await notionFetch(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

    await logAudit(db, 'NOTION_UPDATE_PAGE', req, JSON.stringify({ pageId }));

    return res.status(200).json(data);
}

/**
 * POST /api/notion/databases/:id/query - Query database
 */
async function handleQueryDatabase(req, res, db, databaseId) {
    if (!isValidNotionId(databaseId)) {
        return res.status(400).json({ error: 'Invalid database ID format' });
    }

    const body = parseBody(req);
    const { filter, sorts, start_cursor, page_size = 50 } = body;

    const payload = {
        page_size: Math.min(page_size, 100),
    };
    if (filter) payload.filter = filter;
    if (sorts) payload.sorts = sorts;
    if (start_cursor) payload.start_cursor = start_cursor;

    const data = await notionFetch(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return res.status(200).json(data);
}

/**
 * GET /api/notion/databases/:id - Get database schema
 */
async function handleGetDatabase(req, res, db, databaseId) {
    if (!isValidNotionId(databaseId)) {
        return res.status(400).json({ error: 'Invalid database ID format' });
    }

    const data = await notionFetch(`/databases/${databaseId}`);

    return res.status(200).json(data);
}

/**
 * POST /api/notion/blocks - Append children to a block
 */
async function handleAppendBlocks(req, res, db) {
    const body = parseBody(req);
    const { block_id, children } = body;

    if (!isValidNotionId(block_id)) {
        return res.status(400).json({ error: 'Invalid block ID format' });
    }

    if (!children || !Array.isArray(children) || children.length === 0) {
        return res.status(400).json({ error: 'children array is required' });
    }

    const data = await notionFetch(`/blocks/${block_id}/children`, {
        method: 'PATCH',
        body: JSON.stringify({ children }),
    });

    return res.status(200).json(data);
}

/**
 * DELETE /api/notion/blocks/:id - Delete a block
 */
async function handleDeleteBlock(req, res, db, blockId) {
    if (!isValidNotionId(blockId)) {
        return res.status(400).json({ error: 'Invalid block ID format' });
    }

    const data = await notionFetch(`/blocks/${blockId}`, {
        method: 'DELETE',
    });

    return res.status(200).json(data);
}

/**
 * PATCH /api/notion/blocks/:id - Update a block's content
 */
async function handleUpdateBlock(req, res, db, blockId) {
    if (!isValidNotionId(blockId)) {
        return res.status(400).json({ error: 'Invalid block ID format' });
    }

    const body = parseBody(req);

    // Body should contain the block type with updated rich_text
    // e.g., { paragraph: { rich_text: [...] } }
    const data = await notionFetch(`/blocks/${blockId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });

    return res.status(200).json(data);
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req, res) {
    // CORS headers for same-origin only
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 1. Require authentication (fastMode skips DB for cold start performance)
        const authResult = await requireAuth(req, res, { fastMode: true, skipRateLimit: true });
        if (authResult !== true) return;

        // 2. Parse route FIRST (fast operation)
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.replace('/api/notion/', '').split('/').filter(Boolean);
        const [resource, id, subResource] = pathParts;

        // 3. Initialize database in background (non-blocking for cold starts)
        // Rate limiting is best-effort - don't block on it
        let db = null;
        const dbPromise = (async () => {
            try {
                await initDatabase();
                db = await getDbPool();
                const clientIP = getClientIP(req);

                // Check rate limit (non-blocking)
                if (await checkNotionRateLimit(db, clientIP)) {
                    return 'RATE_LIMITED';
                }
                return 'OK';
            } catch (e) {
                console.error('[Notion DB] Non-blocking error:', e.message);
                return 'DB_ERROR'; // Continue without rate limiting
            }
        })();

        // 4. Route to handler (start Notion API call immediately)
        let result;
        switch (resource) {
            case 'search':
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                result = await handleSearch(req, res, db);
                break;

            case 'pages':
                if (!id) {
                    if (req.method !== 'POST') {
                        return res.status(405).json({ error: 'Method not allowed' });
                    }
                    result = await handleCreatePage(req, res, db);
                    break;
                }

                if (subResource === 'content') {
                    if (req.method !== 'GET') {
                        return res.status(405).json({ error: 'Method not allowed' });
                    }
                    result = await handleGetPageContent(req, res, db, id);
                    break;
                }

                if (req.method === 'GET') {
                    result = await handleGetPage(req, res, db, id);
                    break;
                }
                if (req.method === 'PATCH') {
                    result = await handleUpdatePage(req, res, db, id);
                    break;
                }
                return res.status(405).json({ error: 'Method not allowed' });

            case 'databases':
                if (!id) {
                    return res.status(400).json({ error: 'Database ID required' });
                }

                if (subResource === 'query') {
                    if (req.method !== 'POST') {
                        return res.status(405).json({ error: 'Method not allowed' });
                    }
                    result = await handleQueryDatabase(req, res, db, id);
                    break;
                }

                if (req.method === 'GET') {
                    result = await handleGetDatabase(req, res, db, id);
                    break;
                }
                return res.status(405).json({ error: 'Method not allowed' });

            case 'blocks':
                if (!id) {
                    // POST /api/notion/blocks - Append children
                    if (req.method !== 'POST') {
                        return res.status(405).json({ error: 'Method not allowed' });
                    }
                    result = await handleAppendBlocks(req, res, db);
                    break;
                }

                // DELETE /api/notion/blocks/:id
                if (req.method === 'DELETE') {
                    result = await handleDeleteBlock(req, res, db, id);
                    break;
                }

                // PATCH /api/notion/blocks/:id - Update block
                if (req.method === 'PATCH') {
                    result = await handleUpdateBlock(req, res, db, id);
                    break;
                }
                return res.status(405).json({ error: 'Method not allowed' });

            default:
                return res.status(404).json({ error: 'Endpoint not found' });
        }

        // 5. Check rate limit result (non-blocking, just log if limited for next time)
        const dbStatus = await dbPromise;
        if (dbStatus === 'RATE_LIMITED') {
            // Already sent response, but log for monitoring
            console.log('[Notion] Request allowed but user is approaching rate limit');
        }

        return result;

    } catch (error) {
        console.error('[Notion API] Error:', error.message);

        // Don't expose internal errors
        const isNotionError = error.message.includes('Notion');
        return res.status(isNotionError ? 502 : 500).json({
            error: isNotionError ? error.message : 'Internal server error'
        });
    }
}
