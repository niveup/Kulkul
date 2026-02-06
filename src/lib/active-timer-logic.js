/**
 * Active Timer Logic (Refactored for src/lib)
 */
import { getDbPool, initDatabase } from './db.js';

export async function getActiveTimer() {
    await initDatabase();
    const db = await getDbPool();
    const [timers] = await db.execute(
        'SELECT id, start_time as startTime, duration_seconds as durationSeconds, paused_remaining as pausedRemaining, status, updated_at as updatedAt FROM active_timer WHERE id = ?',
        ['default']
    );
    if (timers.length === 0) return { status: 'idle' };
    return timers[0];
}

export async function updateActiveTimer({ startTime, durationSeconds, pausedRemaining, status }) {
    await initDatabase();
    const db = await getDbPool();
    await db.execute(`
        INSERT INTO active_timer (id, start_time, duration_seconds, paused_remaining, status)
        VALUES ('default', ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            start_time = VALUES(start_time),
            duration_seconds = VALUES(duration_seconds),
            paused_remaining = VALUES(paused_remaining),
            status = VALUES(status)
    `, [startTime || 0, durationSeconds || 0, pausedRemaining || null, status]);
    return { success: true, status };
}

export async function deleteActiveTimer() {
    await initDatabase();
    const db = await getDbPool();
    await db.execute('DELETE FROM active_timer WHERE id = ?', ['default']);
    return { deleted: true };
}
