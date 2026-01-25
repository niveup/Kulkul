/**
 * Notion Service - Frontend API Wrapper
 * 
 * Clean API wrapper for Notion endpoints with:
 * - Automatic retry with exponential backoff
 * - Response caching for read operations  
 * - Request deduplication
 * - Error transformation to user-friendly messages
 */

// =============================================================================
// Configuration
// =============================================================================

const API_BASE = '/api/notion';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Cache configuration (time in ms)
const CACHE_TTL = {
    search: 60000,      // 1 minute
    page: 30000,        // 30 seconds
    pageContent: 30000, // 30 seconds
    database: 60000,    // 1 minute
};

// =============================================================================
// Cache & Deduplication
// =============================================================================

const cache = new Map();
const pendingRequests = new Map();

/**
 * Get cached value if not expired
 */
function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Set cache with TTL
 */
function setCache(key, data, ttl) {
    cache.set(key, {
        data,
        expiresAt: Date.now() + ttl,
    });
}

/**
 * Invalidate cache entries matching prefix
 */
export function invalidateCache(prefix = '') {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}

// =============================================================================
// Core Request Handler
// =============================================================================

/**
 * Make API request with retry and error handling
 */
async function request(endpoint, options = {}, cacheKey = null, cacheTTL = 0) {
    // Check cache for GET requests
    if (cacheKey && (!options.method || options.method === 'GET')) {
        const cached = getCached(cacheKey);
        if (cached) return cached;
    }

    // Deduplicate identical pending requests
    const requestKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || '')}`;
    if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
    }

    const executeRequest = async (attempt = 0) => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));

                // Retry on 5xx errors or rate limit
                if ((response.status >= 500 || response.status === 429) && attempt < MAX_RETRIES) {
                    const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
                    await new Promise(r => setTimeout(r, delay));
                    return executeRequest(attempt + 1);
                }

                throw new NotionError(
                    error.error || `Request failed: ${response.status}`,
                    response.status,
                    error
                );
            }

            const data = await response.json();

            // Cache successful GET responses
            if (cacheKey && cacheTTL > 0) {
                setCache(cacheKey, data, cacheTTL);
            }

            return data;
        } catch (error) {
            if (error instanceof NotionError) throw error;

            // Network error - retry
            if (attempt < MAX_RETRIES) {
                const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
                await new Promise(r => setTimeout(r, delay));
                return executeRequest(attempt + 1);
            }

            throw new NotionError('Network error - please check your connection', 0, error);
        }
    };

    const promise = executeRequest();
    pendingRequests.set(requestKey, promise);

    try {
        return await promise;
    } finally {
        pendingRequests.delete(requestKey);
    }
}

// =============================================================================
// Custom Error Class
// =============================================================================

export class NotionError extends Error {
    constructor(message, status, details = {}) {
        super(message);
        this.name = 'NotionError';
        this.status = status;
        this.details = details;
    }

    /**
     * Get user-friendly error message
     */
    get userMessage() {
        if (this.status === 401) return 'Please log in to access Notion';
        if (this.status === 403) return 'You don\'t have permission to access this Notion content';
        if (this.status === 404) return 'Page or database not found in Notion';
        if (this.status === 429) return 'Too many requests - please wait a moment';
        if (this.status === 502) return 'Notion API is temporarily unavailable';
        if (this.status === 0) return 'Network error - please check your connection';
        return this.message;
    }
}

// =============================================================================
// API Methods
// =============================================================================

/**
 * Search pages and databases
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<{results: Array, has_more: boolean, next_cursor: string|null}>}
 */
export async function searchPages(query = '', options = {}) {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;

    return request('/search', {
        method: 'POST',
        body: { query, ...options },
    }, cacheKey, CACHE_TTL.search);
}

/**
 * Get page metadata
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Object>} Page object
 */
export async function getPage(pageId) {
    if (!pageId) throw new NotionError('Page ID is required', 400);

    const cacheKey = `page:${pageId}`;
    return request(`/pages/${pageId}`, {}, cacheKey, CACHE_TTL.page);
}

/**
 * Get page content (blocks)
 * @param {string} pageId - Notion page ID
 * @param {Object} options - Pagination options
 * @returns {Promise<{results: Array, has_more: boolean, next_cursor: string|null}>}
 */
export async function getPageContent(pageId, options = {}) {
    if (!pageId) throw new NotionError('Page ID is required', 400);

    const params = new URLSearchParams();
    if (options.startCursor) params.set('start_cursor', options.startCursor);
    if (options.pageSize) params.set('page_size', options.pageSize);

    const queryString = params.toString();
    const endpoint = `/pages/${pageId}/content${queryString ? `?${queryString}` : ''}`;
    const cacheKey = `content:${pageId}:${queryString}`;

    return request(endpoint, {}, cacheKey, CACHE_TTL.pageContent);
}

/**
 * Create a new page
 * @param {Object} params - Page creation parameters
 * @param {Object} params.parent - Parent page or database
 * @param {Object} params.properties - Page properties
 * @param {Array} [params.children] - Initial content blocks
 * @param {Object} [params.icon] - Page icon
 * @param {Object} [params.cover] - Page cover
 * @returns {Promise<Object>} Created page object
 */
export async function createPage({ parent, properties, children, icon, cover }) {
    if (!parent) throw new NotionError('Parent is required', 400);
    if (!properties) throw new NotionError('Properties are required', 400);

    const result = await request('/pages', {
        method: 'POST',
        body: { parent, properties, children, icon, cover },
    });

    // Invalidate search cache
    invalidateCache('search:');

    return result;
}

/**
 * Update a page
 * @param {string} pageId - Notion page ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated page object
 */
export async function updatePage(pageId, updates) {
    if (!pageId) throw new NotionError('Page ID is required', 400);

    const result = await request(`/pages/${pageId}`, {
        method: 'PATCH',
        body: updates,
    });

    // Invalidate caches
    invalidateCache(`page:${pageId}`);
    invalidateCache('search:');

    return result;
}

/**
 * Query a database
 * @param {string} databaseId - Notion database ID
 * @param {Object} options - Query options
 * @returns {Promise<{results: Array, has_more: boolean, next_cursor: string|null}>}
 */
export async function queryDatabase(databaseId, options = {}) {
    if (!databaseId) throw new NotionError('Database ID is required', 400);

    // Don't cache database queries as they're often filtered/sorted
    return request(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: options,
    });
}

/**
 * Get database schema
 * @param {string} databaseId - Notion database ID
 * @returns {Promise<Object>} Database object with properties
 */
export async function getDatabase(databaseId) {
    if (!databaseId) throw new NotionError('Database ID is required', 400);

    const cacheKey = `database:${databaseId}`;
    return request(`/databases/${databaseId}`, {}, cacheKey, CACHE_TTL.database);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extract plain text from Notion rich text array
 * @param {Array} richText - Notion rich text array
 * @returns {string} Plain text
 */
export function extractPlainText(richText) {
    if (!Array.isArray(richText)) return '';
    return richText.map(t => t.plain_text || '').join('');
}

/**
 * Get page title from properties
 * @param {Object} properties - Notion page properties
 * @returns {string} Page title
 */
export function getPageTitle(properties) {
    if (!properties) return 'Untitled';

    // Find title property
    const titleProp = Object.values(properties).find(p => p.type === 'title');
    if (!titleProp || !titleProp.title) return 'Untitled';

    return extractPlainText(titleProp.title) || 'Untitled';
}

/**
 * Get page icon (emoji or URL)
 * @param {Object} page - Notion page object
 * @returns {{type: 'emoji'|'url'|null, value: string|null}}
 */
export function getPageIcon(page) {
    if (!page?.icon) return { type: null, value: null };

    if (page.icon.type === 'emoji') {
        return { type: 'emoji', value: page.icon.emoji };
    }
    if (page.icon.type === 'external') {
        return { type: 'url', value: page.icon.external?.url };
    }
    if (page.icon.type === 'file') {
        return { type: 'url', value: page.icon.file?.url };
    }

    return { type: null, value: null };
}

/**
 * Format date from Notion
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatNotionDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}
