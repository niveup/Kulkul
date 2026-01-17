/**
 * useCustomApps Hook
 * 
 * Manages custom app shortcuts with conditional persistence:
 * - Authenticated: Syncs to cloud API (cross-device)
 * - Guest mode: Stores in localStorage only
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localCustomApps } from '../services/localStorageAdapter';

export const useCustomApps = () => {
    const { isAuthenticated, isGuest } = useAuth();
    const [customApps, setCustomApps] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load apps on mount - from API (authenticated) or localStorage (guest)
    useEffect(() => {
        const loadApps = async () => {
            // Guest mode or not authenticated: use localStorage
            if (isGuest || !isAuthenticated) {
                const localApps = localCustomApps.getAll();
                setCustomApps(localApps);
                setIsLoaded(true);
                setIsLoading(false);
                return;
            }

            // Authenticated: fetch from API
            try {
                const response = await fetch('/api/custom-apps');
                if (response.ok) {
                    const data = await response.json();
                    setCustomApps(data);
                }
            } catch (error) {
                console.error('Failed to load custom apps:', error);
                // Fallback to localStorage
                const localApps = localCustomApps.getAll();
                setCustomApps(localApps);
            } finally {
                setIsLoaded(true);
                setIsLoading(false);
            }
        };
        loadApps();
    }, [isAuthenticated, isGuest]);

    // Add a new app
    const addApp = useCallback(async (app) => {
        // Optimistic update
        setCustomApps(prev => [...prev, app]);

        // Guest mode: save to localStorage only
        if (isGuest || !isAuthenticated) {
            localCustomApps.add(app);
            return;
        }

        // Authenticated: sync to API
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
            setCustomApps(prev => prev.map(a =>
                a.id === app.id ? savedApp : a
            ));
        } catch (error) {
            console.error('Failed to add custom app:', error);
            // Fallback: save to localStorage
            localCustomApps.add(app);
        }
    }, [isAuthenticated, isGuest]);

    // Remove an app by id
    const removeApp = useCallback(async (id) => {
        // Optimistic update
        setCustomApps(prev => prev.filter(app => app.id !== id));

        // Guest mode: remove from localStorage only
        if (isGuest || !isAuthenticated) {
            localCustomApps.remove(id);
            return;
        }

        // Authenticated: sync to API
        try {
            await fetch(`/api/custom-apps/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to remove custom app:', error);
        }
    }, [isAuthenticated, isGuest]);

    // Update an existing app
    const updateApp = useCallback(async (id, updates) => {
        // Optimistic update
        setCustomApps(prev => prev.map(app =>
            app.id === id ? { ...app, ...updates } : app
        ));

        // Guest mode: update localStorage only
        if (isGuest || !isAuthenticated) {
            localCustomApps.update(id, updates);
            return;
        }

        // Authenticated: sync to API
        try {
            await fetch(`/api/custom-apps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error('Failed to update custom app:', error);
        }
    }, [isAuthenticated, isGuest]);

    // Refresh from server (only works when authenticated)
    const refreshApps = useCallback(async () => {
        if (isGuest || !isAuthenticated) {
            // Reload from localStorage
            setCustomApps(localCustomApps.getAll());
            return;
        }

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
    }, [isAuthenticated, isGuest]);

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
