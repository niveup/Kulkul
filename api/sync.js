/**
 * Data Synchronization API
 * 
 * Features:
 * - Cross-device data synchronization
 * - Conflict resolution
 * - Delta updates
 * - Offline support with sync queue
 */

import { getDbPool, initDatabase, generateId } from './db.js';

// =============================================================================
// Configuration
// =============================================================================

const SYNC_VERSION = '1.0';
const MAX_SYNC_QUEUE_SIZE = 100;

// =============================================================================
// Helper Functions
// =============================================================================

function generateSyncTimestamp() {
    return Date.now();
}

function createSyncOperation(type, entity, data, timestamp) {
    return {
        id: generateId(),
        type, // 'create', 'update', 'delete'
        entity, // 'session', 'todo', 'timer'
        data,
        timestamp: timestamp || generateSyncTimestamp(),
        synced: false
    };
}

function resolveConflict(localData, remoteData, lastSyncTime) {
    // Last-write-wins strategy with timestamp comparison
    const localTime = new Date(localData.updated_at || localData.created_at).getTime();
    const remoteTime = new Date(remoteData.updated_at || remoteData.created_at).getTime();

    if (remoteTime > localTime) {
        return {
            resolved: true,
            winner: 'remote',
            data: remoteData
        };
    } else if (localTime > remoteTime) {
        return {
            resolved: true,
            winner: 'local',
            data: localData
        };
    } else {
        // Same timestamp - prefer local (user's current device)
        return {
            resolved: true,
            winner: 'local',
            data: localData
        };
    }
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
            // Get sync status and pending operations
            const { lastSyncTime } = req.query;

            // Fetch all data modified since last sync
            const since = lastSyncTime ? new Date(parseInt(lastSyncTime)) : new Date(0);

            // Get modified sessions
            const [sessions] = await db.execute(
                `SELECT id, type, minutes, elapsed_seconds, status, created_at, updated_at 
                 FROM pomodoro_sessions 
                 WHERE updated_at >= ? OR created_at >= ?
                 ORDER BY updated_at DESC`,
                [since, since]
            );

            // Get modified todos
            const [todos] = await db.execute(
                `SELECT id, text, completed, created_at, updated_at 
                 FROM todos 
                 WHERE updated_at >= ? OR created_at >= ?
                 ORDER BY updated_at DESC`,
                [since, since]
            );

            // Get active timer
            const [timers] = await db.execute(
                `SELECT id, start_time, duration_seconds, paused_remaining, status, updated_at 
                 FROM active_timer 
                 WHERE updated_at >= ? OR created_at >= ?`,
                [since, since]
            );

            // Get sync queue (if we implement it in the future)
            const syncQueue = [];

            return res.status(200).json({
                version: SYNC_VERSION,
                serverTime: Date.now(),
                data: {
                    sessions,
                    todos,
                    activeTimer: timers[0] || null
                },
                syncQueue,
                requiresFullSync: !lastSyncTime
            });
        }

        if (req.method === 'POST') {
            // Handle sync push from client
            const { 
                clientTime,
                lastSyncTime,
                operations,
                fullSync 
            } = req.body;

            if (!clientTime) {
                return res.status(400).json({ error: 'Client time is required' });
            }

            const syncResults = {
                conflicts: [],
                applied: [],
                failed: []
            };

            // Process each operation
            for (const operation of (operations || [])) {
                try {
                    switch (operation.entity) {
                        case 'session':
                            if (operation.type === 'create' || operation.type === 'update') {
                                const { id, type, minutes, elapsedSeconds, status } = operation.data;

                                // Check for conflicts
                                const [existing] = await db.execute(
                                    'SELECT * FROM pomodoro_sessions WHERE id = ?',
                                    [id]
                                );

                                if (existing.length > 0 && operation.type === 'update') {
                                    const conflict = resolveConflict(
                                        { ...operation.data, updated_at: operation.timestamp },
                                        existing[0],
                                        lastSyncTime
                                    );

                                    if (conflict.winner === 'remote') {
                                        syncResults.conflicts.push({
                                            entity: 'session',
                                            id,
                                            reason: 'remote_newer',
                                            remoteData: conflict.data
                                        });
                                        continue;
                                    }
                                }

                                // Apply operation
                                if (operation.type === 'create') {
                                    await db.execute(
                                        `INSERT INTO pomodoro_sessions 
                                         (id, type, minutes, elapsed_seconds, status, created_at, updated_at) 
                                         VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?/1000), FROM_UNIXTIME(?/1000))
                                         ON DUPLICATE KEY UPDATE
                                            type = VALUES(type),
                                            minutes = VALUES(minutes),
                                            elapsed_seconds = VALUES(elapsed_seconds),
                                            status = VALUES(status),
                                            updated_at = VALUES(updated_at)`,
                                        [id, type, minutes, elapsedSeconds || 0, status, operation.timestamp, operation.timestamp]
                                    );
                                } else {
                                    await db.execute(
                                        `UPDATE pomodoro_sessions 
                                         SET type = ?, minutes = ?, elapsed_seconds = ?, status = ?, updated_at = FROM_UNIXTIME(?/1000)
                                         WHERE id = ?`,
                                        [type, minutes, elapsedSeconds || 0, status, operation.timestamp, id]
                                    );
                                }

                                syncResults.applied.push({ entity: 'session', id, type: operation.type });
                            }
                            break;

                        case 'todo':
                            if (operation.type === 'create' || operation.type === 'update') {
                                const { id, text, completed } = operation.data;

                                // Check for conflicts
                                const [existing] = await db.execute(
                                    'SELECT * FROM todos WHERE id = ?',
                                    [id]
                                );

                                if (existing.length > 0 && operation.type === 'update') {
                                    const conflict = resolveConflict(
                                        { ...operation.data, updated_at: operation.timestamp },
                                        existing[0],
                                        lastSyncTime
                                    );

                                    if (conflict.winner === 'remote') {
                                        syncResults.conflicts.push({
                                            entity: 'todo',
                                            id,
                                            reason: 'remote_newer',
                                            remoteData: conflict.data
                                        });
                                        continue;
                                    }
                                }

                                // Apply operation
                                if (operation.type === 'create') {
                                    await db.execute(
                                        `INSERT INTO todos 
                                         (id, text, completed, created_at, updated_at) 
                                         VALUES (?, ?, ?, FROM_UNIXTIME(?/1000), FROM_UNIXTIME(?/1000))
                                         ON DUPLICATE KEY UPDATE
                                            text = VALUES(text),
                                            completed = VALUES(completed),
                                            updated_at = VALUES(updated_at)`,
                                        [id, text.trim(), completed, operation.timestamp, operation.timestamp]
                                    );
                                } else {
                                    await db.execute(
                                        `UPDATE todos 
                                         SET text = ?, completed = ?, updated_at = FROM_UNIXTIME(?/1000)
                                         WHERE id = ?`,
                                        [text.trim(), completed, operation.timestamp, id]
                                    );
                                }

                                syncResults.applied.push({ entity: 'todo', id, type: operation.type });
                            } else if (operation.type === 'delete') {
                                const { id } = operation.data;
                                await db.execute('DELETE FROM todos WHERE id = ?', [id]);
                                syncResults.applied.push({ entity: 'todo', id, type: 'delete' });
                            }
                            break;

                        case 'timer':
                            const { startTime, durationSeconds, pausedRemaining, status } = operation.data;

                            await db.execute(
                                `INSERT INTO active_timer 
                                 (id, start_time, duration_seconds, paused_remaining, status, updated_at) 
                                 VALUES ('default', ?, ?, ?, ?, FROM_UNIXTIME(?/1000))
                                 ON DUPLICATE KEY UPDATE
                                    start_time = VALUES(start_time),
                                    duration_seconds = VALUES(duration_seconds),
                                    paused_remaining = VALUES(paused_remaining),
                                    status = VALUES(status),
                                    updated_at = VALUES(updated_at)`,
                                [startTime || 0, durationSeconds || 0, pausedRemaining || null, status, operation.timestamp]
                            );

                            syncResults.applied.push({ entity: 'timer', type: 'update' });
                            break;
                    }
                } catch (error) {
                    console.error('[Sync API] Operation failed:', error);
                    syncResults.failed.push({
                        entity: operation.entity,
                        id: operation.data?.id,
                        error: error.message
                    });
                }
            }

            return res.status(200).json({
                success: true,
                syncTime: Date.now(),
                results: syncResults,
                conflictsResolved: syncResults.conflicts.length,
                operationsApplied: syncResults.applied.length,
                operationsFailed: syncResults.failed.length
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } API] Error:', error);
        return res.status(500).json({ 
            error: 'Synchronization failed',
            message: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
}
