/**
 * useDataSync Hook
 * 
 * Provides auth-conditional data synchronization:
 * - Authenticated: Syncs sessions/timer to database API
 * - Guest mode: Stores in localStorage only
 * 
 * This hook handles the bridge between local state (Zustand) and persistence.
 */

import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { localSessions, localActiveTimer } from '../services/localStorageAdapter';

export const useDataSync = () => {
    const { isAuthenticated, isGuest } = useAuth();

    // Check if we should use local-only storage
    const isLocalMode = isGuest || !isAuthenticated;

    // -------------------------------------------------------------------------
    // Session Sync
    // -------------------------------------------------------------------------

    const saveSession = useCallback(async (session) => {
        // Always save locally first
        localSessions.add(session);

        // If authenticated, also sync to API
        if (!isLocalMode) {
            try {
                await fetch('/api/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(session),
                });
            } catch (err) {
                console.error('[DataSync] Failed to save session to API:', err);
            }
        }
    }, [isLocalMode]);

    const loadSessions = useCallback(async () => {
        // Guest mode: load from localStorage
        if (isLocalMode) {
            return localSessions.getAll();
        }

        // Authenticated: try API first, fallback to localStorage
        try {
            const response = await fetch('/api/sessions');
            if (response.ok) {
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            }
        } catch (err) {
            console.error('[DataSync] Failed to load sessions from API:', err);
        }

        // Fallback to localStorage
        return localSessions.getAll();
    }, [isLocalMode]);

    // -------------------------------------------------------------------------
    // Active Timer Sync
    // -------------------------------------------------------------------------

    const saveActiveTimer = useCallback(async (timerState) => {
        // Always save locally
        localActiveTimer.set(timerState);

        // If authenticated, also sync to API
        if (!isLocalMode) {
            try {
                await fetch('/api/active-timer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(timerState),
                });
            } catch (err) {
                console.error('[DataSync] Failed to save active timer to API:', err);
            }
        }
    }, [isLocalMode]);

    const loadActiveTimer = useCallback(async () => {
        // Guest mode: load from localStorage
        if (isLocalMode) {
            return localActiveTimer.get();
        }

        // Authenticated: try API first
        try {
            const response = await fetch('/api/active-timer');
            if (response.ok) {
                return await response.json();
            }
        } catch (err) {
            console.error('[DataSync] Failed to load active timer from API:', err);
        }

        // Fallback to localStorage
        return localActiveTimer.get();
    }, [isLocalMode]);

    const clearActiveTimer = useCallback(async () => {
        // Always clear locally
        localActiveTimer.clear();

        // If authenticated, also clear from API
        if (!isLocalMode) {
            try {
                await fetch('/api/active-timer', { method: 'DELETE' });
            } catch (err) {
                console.error('[DataSync] Failed to clear active timer from API:', err);
            }
        }
    }, [isLocalMode]);

    // -------------------------------------------------------------------------
    // Todos Sync
    // -------------------------------------------------------------------------

    const saveTodo = useCallback(async (todo) => {
        if (isLocalMode) {
            return; // TaskStore already handles localStorage via Zustand persistence
        }

        // Authenticated: sync to API
        try {
            await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todo),
            });
        } catch (err) {
            console.error('[DataSync] Failed to save todo to API:', err);
        }
    }, [isLocalMode]);

    const updateTodo = useCallback(async (id, updates) => {
        if (isLocalMode) return;

        try {
            await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } catch (err) {
            console.error('[DataSync] Failed to update todo:', err);
        }
    }, [isLocalMode]);

    const deleteTodo = useCallback(async (id) => {
        if (isLocalMode) return;

        try {
            await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error('[DataSync] Failed to delete todo:', err);
        }
    }, [isLocalMode]);

    const loadTodos = useCallback(async () => {
        if (isLocalMode) {
            return null; // Use Zustand's persisted state
        }

        try {
            const response = await fetch('/api/todos');
            if (response.ok) {
                return await response.json();
            }
        } catch (err) {
            console.error('[DataSync] Failed to load todos from API:', err);
        }
        return null;
    }, [isLocalMode]);

    return {
        isLocalMode,
        // Sessions
        saveSession,
        loadSessions,
        // Active Timer
        saveActiveTimer,
        loadActiveTimer,
        clearActiveTimer,
        // Todos
        saveTodo,
        updateTodo,
        deleteTodo,
        loadTodos,
    };
};

export default useDataSync;
