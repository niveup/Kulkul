/**
 * Authentication Middleware - Vercel Serverless Functions
 * 
 * This middleware validates the auth token from HttpOnly cookies
 * and attaches session info to the request object.
 * 
 * Usage:
 * import { requireAuth, logAudit, getClientIP } from './authMiddleware.js';
 * 
 * export default async function handler(req, res) {
 *     const authResult = await requireAuth(req, res);
 *     if (authResult !== true) return; // Already sent 401/403/429
 *     // ... rest of handler
 * }
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const RATE_LIMIT_API = { maxRequests: 100, windowMinutes: 60 };

// =============================================================================
// Environment Detection
// =============================================================================

/**
 * Detect if running on localhost (development mode)
 * In development, authentication is bypassed for convenience
 */
export function isLocalhost(req) {
    // Check VERCEL environment variable (set automatically by Vercel)
    if (process.env.VERCEL === '1') {
        return false; // Running on Vercel, enforce auth
    }

    // Check NODE_ENV
    if (process.env.NODE_ENV === 'production') {
        return false;
    }

    // Check host header for localhost patterns
    const host = req?.headers?.host || '';
    const isLocalHost = host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.startsWith('192.168.') ||
        host.startsWith('10.');

    return isLocalHost;
}

/**
 * Check if auth should be bypassed (for development convenience)
 * Set BYPASS_AUTH=true in .env to enable, or rely on auto-detection
 */
export function shouldBypassAuth(req) {
    // Explicit bypass via environment variable
    if (process.env.BYPASS_AUTH === 'true') {
        return true;
    }

    // Auto-bypass on localhost
    return isLocalhost(req);
}

// =============================================================================
// Helper Functions
// =============================================================================

export function getClientIP(req) {
    return req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        'unknown';
}

export async function logAudit(db, eventType, req, details = null) {
    try {
        await db.execute(`
            INSERT INTO security_audit_log (event_type, ip_address, user_agent, details)
            VALUES (?, ?, ?, ?)
        `, [eventType, getClientIP(req), req.headers['user-agent'] || '', details]);
    } catch (e) {
        console.error('[Audit Log] Failed:', e.message);
    }
}

async function isRateLimited(db, ip, endpoint = 'api') {
    try {
        const windowStart = new Date(Date.now() - RATE_LIMIT_API.windowMinutes * 60 * 1000);

        const [rows] = await db.execute(`
            SELECT request_count FROM rate_limits 
            WHERE ip_address = ? AND endpoint = ? AND window_start > ?
        `, [ip, endpoint, windowStart]);

        if (rows.length > 0 && rows[0].request_count >= RATE_LIMIT_API.maxRequests) {
            return true;
        }

        return false;
    } catch (e) {
        console.error('[Rate Limit Check] Error:', e.message);
        return false;
    }
}

async function incrementRateLimit(db, ip, endpoint = 'api') {
    try {
        await db.execute(`
            INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE request_count = request_count + 1
        `, [ip, endpoint]);
    } catch (e) {
        console.error('[Rate Limit Increment] Error:', e.message);
    }
}

// =============================================================================
// Main Middleware
// =============================================================================

/**
 * Validates authentication and attaches session to req.session
 * 
 * @param {Request} req - Vercel request object
 * @param {Response} res - Vercel response object
 * @param {Object} options - Options
 * @param {boolean} options.skipRateLimit - Skip rate limiting
 * @returns {Promise<true|void>} - Returns true if authenticated, or sends error response
 */
export async function requireAuth(req, res, options = {}) {
    try {
        // 0. Check for localhost bypass (development mode)
        if (shouldBypassAuth(req)) {
            console.log('[Auth] Localhost detected - bypassing authentication');
            req.session = { id: 'dev-session', ip_address: 'localhost' };
            return true;
        }

        await initDatabase();
        const db = await getDbPool();
        const clientIP = getClientIP(req);

        // 1. Check Rate Limit first (save DB calls if spamming)
        if (!options.skipRateLimit && await isRateLimited(db, clientIP)) {
            await logAudit(db, 'RATE_LIMITED', req);
            res.status(429).json({ error: 'Too many requests. Please slow down.' });
            return;
        }

        // 2. Increment rate limit counter
        if (!options.skipRateLimit) {
            await incrementRateLimit(db, clientIP);
        }

        // 3. Parse Token from Cookie
        const cookies = req.headers.cookie || '';
        const tokenMatch = cookies.match(/__Host-auth_token=([^;]+)/) ||
            cookies.match(/auth_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            await logAudit(db, 'TOKEN_MISSING', req);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 4. Validate Token with ALL security checks
        const [sessions] = await db.execute(`
            SELECT s.* FROM auth_sessions s
            WHERE s.token = ?
              AND s.expires_at > NOW()
              AND s.ip_address = ?
              AND s.created_at > COALESCE(
                  (SELECT kill_sessions_before FROM auth_config WHERE id = 1), 
                  '1970-01-01'
              )
        `, [token, clientIP]);

        if (!sessions || sessions.length === 0) {
            await logAudit(db, 'TOKEN_INVALID', req);
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 5. Attach session to request for downstream use
        req.session = sessions[0];
        return true;

    } catch (error) {
        console.error('[Auth Middleware] Error:', error.message);
        // ALWAYS fail closed - never allow access on error
        res.status(503).json({ error: 'Authentication service unavailable' });
        return;
    }
}

/**
 * Optional: Check authentication without blocking
 * Returns session info or null (doesn't send error response)
 */
export async function checkAuth(req) {
    try {
        await initDatabase();
        const db = await getDbPool();
        const clientIP = getClientIP(req);

        const cookies = req.headers.cookie || '';
        const tokenMatch = cookies.match(/__Host-auth_token=([^;]+)/) ||
            cookies.match(/auth_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) return null;

        const [sessions] = await db.execute(`
            SELECT s.* FROM auth_sessions s
            WHERE s.token = ?
              AND s.expires_at > NOW()
              AND s.ip_address = ?
              AND s.created_at > COALESCE(
                  (SELECT kill_sessions_before FROM auth_config WHERE id = 1), 
                  '1970-01-01'
              )
        `, [token, clientIP]);

        if (!sessions || sessions.length === 0) return null;

        return sessions[0];
    } catch (error) {
        console.error('[Auth Check] Error:', error.message);
        return null;
    }
}
