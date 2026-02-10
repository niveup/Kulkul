/**
 * Stats Utilities - Centralized calculations for streaks and focus time
 */
import { isTodayIST } from './dateUtils';

/**
 * Calculates the current study streak based on session history
 * @param {Array} sessions - List of session objects
 * @returns {number} Current streak in days
 */
export const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;

    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return 0;

    // Use Set to get unique dates
    const sessionDates = new Set(
        completedSessions.map(s => {
            const date = new Date(s.timestamp || s.startTime);
            return date.toDateString();
        })
    );

    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Check today
    if (sessionDates.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        // If not today, check if yesterday has a streak to continue from
        checkDate.setDate(checkDate.getDate() - 1);
        if (!sessionDates.has(checkDate.toDateString())) {
            return 0; // Streak broken
        }
    }

    // Go backwards from yesterday
    while (sessionDates.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
};

/**
 * Calculates total focus time for today in minutes
 * @param {Array} sessions - List of session objects
 * @returns {number} Total minutes
 */
export const calculateTodayFocusMinutes = (sessions) => {
    if (!sessions) return 0;

    return sessions
        .filter(s => {
            const date = new Date(s.timestamp || s.startTime);
            return isTodayIST(date);
        })
        .reduce((acc, s) => {
            if (s.status === 'completed') {
                return acc + (s.minutes || s.duration || 0);
            } else if (s.status === 'failed' && s.elapsedSeconds) {
                return acc + Math.floor(s.elapsedSeconds / 60);
            }
            return acc;
        }, 0);
};
