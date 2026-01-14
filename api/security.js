/**
 * Enhanced Security API
 * 
 * Features:
 * - Security audit logging
 * - Threat detection
 * - Session management
 * - Security recommendations
 */

import { getDbPool, initDatabase } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const SECURITY_THRESHOLDS = {
    maxFailedAttempts: 5,
    maxSessionsPerIP: 3,
    suspiciousActivityWindow: 15 * 60 * 1000, // 15 minutes
    rapidRequestThreshold: 10, // requests per minute
    unusualLocationThreshold: 500, // km distance
};

const THREAT_LEVELS = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
};

// =============================================================================
// Helper Functions
// =============================================================================

function calculateThreatLevel(events) {
    if (!events || events.length === 0) return THREAT_LEVELS.low;

    let threatScore = 0;

    // Count failed login attempts
    const failedLogins = events.filter(e => e.event_type === 'LOGIN_FAIL').length;
    if (failedLogins >= SECURITY_THRESHOLDS.maxFailedAttempts) {
        threatScore += THREAT_LEVELS.high;
    } else if (failedLogins >= SECURITY_THRESHOLDS.maxFailedAttempts / 2) {
        threatScore += THREAT_LEVELS.medium;
    }

    // Check for rapid requests
    const recentEvents = events.filter(e => {
        const eventTime = new Date(e.created_at).getTime();
        const now = Date.now();
        return now - eventTime < SECURITY_THRESHOLDS.suspiciousActivityWindow;
    });

    if (recentEvents.length >= SECURITY_THRESHOLDS.rapidRequestThreshold * 2) {
        threatScore += THREAT_LEVELS.high;
    } else if (recentEvents.length >= SECURITY_THRESHOLDS.rapidRequestThreshold) {
        threatScore += THREAT_LEVELS.medium;
    }

    // Check for unusual IP changes
    const uniqueIPs = new Set(events.map(e => e.ip_address));
    if (uniqueIPs.size >= 5) {
        threatScore += THREAT_LEVELS.high;
    } else if (uniqueIPs.size >= 3) {
        threatScore += THREAT_LEVELS.medium;
    }

    // Cap at critical level
    return Math.min(threatScore, THREAT_LEVELS.critical);
}

function detectSuspiciousActivity(events) {
    const suspicious = [];

    if (!events || events.length === 0) return suspicious;

    // Check for failed login attempts
    const failedLogins = events.filter(e => e.event_type === 'LOGIN_FAIL');
    if (failedLogins.length >= SECURITY_THRESHOLDS.maxFailedAttempts) {
        suspicious.push({
            type: 'brute_force',
            severity: 'high',
            message: `Multiple failed login attempts detected (${failedLogins.length} attempts)`,
            count: failedLogins.length,
            recommendation: 'Consider implementing rate limiting and account lockout'
        });
    }

    // Check for rapid requests
    const recentEvents = events.filter(e => {
        const eventTime = new Date(e.created_at).getTime();
        const now = Date.now();
        return now - eventTime < SECURITY_THRESHOLDS.suspiciousActivityWindow;
    });

    if (recentEvents.length >= SECURITY_THRESHOLDS.rapidRequestThreshold * 2) {
        suspicious.push({
            type: 'rapid_requests',
            severity: 'high',
            message: `Unusually high request rate detected (${recentEvents.length} requests in 15 minutes)`,
            count: recentEvents.length,
            recommendation: 'Consider implementing stricter rate limiting'
        });
    }

    // Check for multiple IPs
    const uniqueIPs = new Set(events.map(e => e.ip_address));
    if (uniqueIPs.size >= 5) {
        suspicious.push({
            type: 'multiple_ips',
            severity: 'medium',
            message: `Access from multiple IP addresses detected (${uniqueIPs.size} unique IPs)`,
            count: uniqueIPs.size,
            recommendation: 'Review recent login locations and consider IP whitelisting'
        });
    }

    return suspicious;
}

function generateSecurityRecommendations(events, sessions) {
    const recommendations = [];

    if (!events || events.length === 0) {
        return [{
            type: 'getting_started',
            priority: 'medium',
            message: 'Enable security monitoring to track suspicious activities'
        }];
    }

    // Check for weak authentication
    const failedLogins = events.filter(e => e.event_type === 'LOGIN_FAIL');
    if (failedLogins.length > 0) {
        recommendations.push({
            type: 'authentication',
            priority: 'high',
            message: 'Consider implementing two-factor authentication for enhanced security',
            action: 'enable_2fa'
        });
    }

    // Check for session management
    if (sessions && sessions.length > SECURITY_THRESHOLDS.maxSessionsPerIP) {
        recommendations.push({
            type: 'session_management',
            priority: 'medium',
            message: 'Multiple active sessions detected. Consider implementing session timeout',
            action: 'configure_session_timeout'
        });
    }

    // Check for audit logging
    const auditEvents = events.filter(e => e.event_type !== 'LOGIN_FAIL');
    if (auditEvents.length < 10) {
        recommendations.push({
            type: 'audit_logging',
            priority: 'low',
            message: 'Enable comprehensive audit logging for better security monitoring',
            action: 'enable_audit_logging'
        });
    }

    return recommendations;
}

// =============================================================================
// Main Handler
// =============================================================================

export default async function handler(req, res) {
    try {
        await initDatabase();
        const db = await getDbPool();

        const clientIP = req.headers['x-real-ip'] || 
                        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                        'unknown';

        if (req.method === 'GET') {
            const timeRange = req.query.range || '24h'; // 1h, 24h, 7d, 30d

            // Calculate date range
            const startDate = timeRange === '1h' 
                ? new Date(Date.now() - 60 * 60 * 1000)
                : timeRange === '24h'
                ? new Date(Date.now() - 24 * 60 * 60 * 1000)
                : timeRange === '7d'
                ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // Fetch security events
            const [events] = await db.execute(
                `SELECT id, event_type, ip_address, user_agent, details, created_at 
                 FROM security_audit_log 
                 WHERE created_at >= ?
                 ORDER BY created_at DESC`,
                [startDate]
            );

            // Fetch active sessions
            const [sessions] = await db.execute(
                `SELECT id, ip_address, user_agent_hash, created_at, expires_at 
                 FROM auth_sessions 
                 WHERE expires_at > NOW()
                 ORDER BY created_at DESC`
            );

            // Analyze security
            const threatLevel = calculateThreatLevel(events);
            const suspiciousActivity = detectSuspiciousActivity(events);
            const recommendations = generateSecurityRecommendations(events, sessions);

            // Calculate security metrics
            const metrics = {
                totalEvents: events.length,
                failedLogins: events.filter(e => e.event_type === 'LOGIN_FAIL').length,
                successfulLogins: events.filter(e => e.event_type === 'LOGIN_SUCCESS').length,
                uniqueIPs: new Set(events.map(e => e.ip_address)).size,
                activeSessions: sessions.length,
                threatLevel
            };

            return res.status(200).json({
                metrics,
                threatLevel: {
                    level: threatLevel,
                    label: Object.keys(THREAT_LEVELS).find(key => THREAT_LEVELS[key] === threatLevel),
                    color: threatLevel >= THREAT_LEVELS.high ? 'red' : 
                           threatLevel >= THREAT_LEVELS.medium ? 'orange' : 'green'
                },
                suspiciousActivity,
                recommendations,
                timeRange,
                generatedAt: new Date().toISOString()
            });
        }

        if (req.method === 'POST') {
            const { action, details } = req.body;

            if (!action) {
                return res.status(400).json({ error: 'Action is required' });
            }

            switch (action) {
                case 'log_event':
                    const { eventType } = details;
                    if (!eventType) {
                        return res.status(400).json({ error: 'Event type is required' });
                    }

                    await db.execute(
                        `INSERT INTO security_audit_log (event_type, ip_address, user_agent, details)
                         VALUES (?, ?, ?, ?)`,
                        [eventType, clientIP, req.headers['user-agent'] || '', JSON.stringify(details)]
                    );

                    return res.status(201).json({ success: true, logged: true });

                case 'kill_sessions':
                    // Kill all sessions except current
                    const currentToken = req.headers.cookie?.match(/__Host-auth_token=([^;]+)/)?.[1];

                    await db.execute(
                        `DELETE FROM auth_sessions 
                         WHERE token != ? AND expires_at > NOW()`,
                        [currentToken]
                    );

                    // Update auth_config to invalidate old sessions
                    await db.execute(
                        `UPDATE auth_config SET kill_sessions_before = NOW() WHERE id = 1`
                    );

                    return res.status(200).json({ success: true, killed: true });

                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[Security API] Error:', error);
        return res.status(500).json({ 
            error: 'Security service unavailable',
            message: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
}
