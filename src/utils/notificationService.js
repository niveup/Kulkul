/**
 * Notification Service - Browser Notification API
 * 
 * Provides system-level notifications for:
 * - Timer completion
 * - Timer warnings
 * - Task reminders
 */

class NotificationService {
    constructor() {
        this.permission = 'default';
        this.enabled = true;
    }

    // Check if notifications are supported
    isSupported() {
        return 'Notification' in window;
    }

    // Request permission from user
    async requestPermission() {
        if (!this.isSupported()) {
            console.warn('Notifications not supported in this browser');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    // Check current permission status
    getPermissionStatus() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission;
    }

    // Enable/disable notifications
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Send a notification
    send(title, options = {}) {
        if (!this.isSupported() || !this.enabled) return null;
        if (Notification.permission !== 'granted') return null;

        const defaultOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            silent: false,
            requireInteraction: false,
            ...options,
        };

        try {
            const notification = new Notification(title, defaultOptions);

            // Auto close after 5 seconds
            if (!options.requireInteraction) {
                setTimeout(() => notification.close(), 5000);
            }

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            return null;
        }
    }

    // === PRE-DEFINED NOTIFICATIONS ===

    // Timer completed
    timerComplete(duration) {
        return this.send('🎉 Focus Session Complete!', {
            body: `Great work! You focused for ${duration} minutes. Time for a break!`,
            tag: 'timer-complete',
            requireInteraction: true,
        });
    }

    // Timer failed/given up
    timerFailed() {
        return this.send('😔 Session Ended', {
            body: 'No worries! Take a moment and try again when you\'re ready.',
            tag: 'timer-failed',
        });
    }

    // Warning before timer ends
    timerWarning(minutesLeft) {
        return this.send('⏰ Almost Done!', {
            body: `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} remaining in your focus session.`,
            tag: 'timer-warning',
        });
    }

    // Break reminder
    breakReminder() {
        return this.send('☕ Take a Break!', {
            body: 'You\'ve been working hard. Time to rest your eyes and stretch!',
            tag: 'break-reminder',
        });
    }

    // Task reminder
    taskReminder(taskName) {
        return this.send('📝 Task Reminder', {
            body: taskName,
            tag: 'task-reminder',
        });
    }

    // Generic info notification
    info(title, body) {
        return this.send(title, {
            body,
            tag: 'info',
        });
    }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;

// React hook for easy integration
import { useState, useCallback, useEffect } from 'react';

export const useNotifications = () => {
    const [permissionStatus, setPermissionStatus] = useState(
        notificationService.getPermissionStatus()
    );

    // Update permission status
    const updatePermission = useCallback(() => {
        setPermissionStatus(notificationService.getPermissionStatus());
    }, []);

    // Request permission
    const requestPermission = useCallback(async () => {
        const granted = await notificationService.requestPermission();
        updatePermission();
        return granted;
    }, [updatePermission]);

    // Listen for visibility change to potentially prompt
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updatePermission();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [updatePermission]);

    return {
        isSupported: notificationService.isSupported(),
        permissionStatus,
        requestPermission,
        timerComplete: useCallback((d) => notificationService.timerComplete(d), []),
        timerFailed: useCallback(() => notificationService.timerFailed(), []),
        timerWarning: useCallback((m) => notificationService.timerWarning(m), []),
        breakReminder: useCallback(() => notificationService.breakReminder(), []),
        taskReminder: useCallback((t) => notificationService.taskReminder(t), []),
        info: useCallback((title, body) => notificationService.info(title, body), []),
        setEnabled: useCallback((e) => notificationService.setEnabled(e), []),
    };
};
