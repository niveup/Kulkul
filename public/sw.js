/**
 * Service Worker for Push Notifications
 * 
 * This file handles background notifications for the Pomodoro timer.
 * It ensures notifications work even when the app is in the background or closed (on supported platforms).
 */

self.addEventListener('install', (event) => {
    // Activate worker immediately
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    // Claim clients immediately
    event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Focus the window when notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
