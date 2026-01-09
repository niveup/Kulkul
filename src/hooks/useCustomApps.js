/**
 * useCustomApps Hook
 * 
 * Manages custom app shortcuts with cloud (API) persistence.
 * Provides CRUD operations for user-defined apps that sync across devices.
 */

import { useState, useEffect, useCallback } from 'react';

export const useCustomApps = () => {
    const [customApps, setCustomApps] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load from API on mount
    useEffect(() => {
        const loadApps = async () => {
            try {
                const response = await fetch('/api/custom-apps');
                if (response.ok) {
                    const data = await response.json();
                    setCustomApps(data);
                }
            } catch (error) {
                console.error('Failed to load custom apps:', error);
                // Fallback to localStorage for offline support
                try {
                    const saved = localStorage.getItem('custom_apps');
                    if (saved) {
                        setCustomApps(JSON.parse(saved));
                    }
                } catch (e) {
                    console.error('localStorage fallback failed:', e);
                }
            } finally {
                setIsLoaded(true);
                setIsLoading(false);
            }
        };
        loadApps();
    }, []);

    // Add a new app (optimistic UI + API call)
    const addApp = useCallback(async (app) => {
        // Optimistic update
        setCustomApps(prev => [...prev, app]);

        try {
            const response = await fetch('/api/custom-apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(app),
            });

            if (!response.ok) {
                throw new Error('Failed to save app');
            }

            const savedApp = await response.json();
            // Update with server-returned data (in case ID changed)
            setCustomApps(prev => prev.map(a =>
                a.id === app.id ? savedApp : a
            ));
        } catch (error) {
            console.error('Failed to add custom app:', error);
            // Keep the optimistic update for UX
            // Also save to localStorage as backup
            try {
                const current = JSON.parse(localStorage.getItem('custom_apps') || '[]');
                localStorage.setItem('custom_apps', JSON.stringify([...current, app]));
            } catch (e) { }
        }
    }, []);

    // Remove an app by id (optimistic UI + API call)
    const removeApp = useCallback(async (id) => {
        // Optimistic update
        setCustomApps(prev => prev.filter(app => app.id !== id));

        try {
            await fetch(`/api/custom-apps/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to remove custom app:', error);
        }
    }, []);

    // Update an existing app (optimistic UI + API call)
    const updateApp = useCallback(async (id, updates) => {
        // Optimistic update
        setCustomApps(prev => prev.map(app =>
            app.id === id ? { ...app, ...updates } : app
        ));

        try {
            await fetch(`/api/custom-apps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error('Failed to update custom app:', error);
        }
    }, []);

    // Refresh from server (for manual sync)
    const refreshApps = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/custom-apps');
            if (response.ok) {
                const data = await response.json();
                setCustomApps(data);
            }
        } catch (error) {
            console.error('Failed to refresh custom apps:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        customApps,
        addApp,
        removeApp,
        updateApp,
        refreshApps,
        isLoaded,
        isLoading,
    };
};

export default useCustomApps;
