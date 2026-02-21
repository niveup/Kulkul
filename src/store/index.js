/**
 * Global Application Store using Zustand
 * Industry standard: Used by Vercel, Stripe, and many enterprise apps
 * 
 * Benefits:
 * - Minimal boilerplate
 * - No providers needed
 * - Built-in persistence
 * - DevTools support
 * - TypeScript ready
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =============================================================================
// App Store - Global application state
// =============================================================================

export const useAppStore = create(
    persist(
        (set, get) => ({
            // -------------------------------------------------------------------------
            // Theme State
            // -------------------------------------------------------------------------
            isDarkMode: true,
            themePreference: 'classic-obsidian', // 'dynamic' | 'classic-obsidian'
            toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setTheme: (isDark) => set({ isDarkMode: isDark }),
            setThemePreference: (pref) => set({ themePreference: pref }),

            // -------------------------------------------------------------------------
            // Sidebar State
            // -------------------------------------------------------------------------
            sidebarCollapsed: true,
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            // -------------------------------------------------------------------------
            // Dock State (for AI Chat fullscreen mode)
            // -------------------------------------------------------------------------
            dockCollapsed: false,
            setDockCollapsed: (collapsed) => set({ dockCollapsed: collapsed }),


            // -------------------------------------------------------------------------
            // Active Tab / Navigation
            // -------------------------------------------------------------------------
            activeTab: 'overview',
            setActiveTab: (tab) => set({ activeTab: tab }),

            // -------------------------------------------------------------------------
            // User Preferences
            // -------------------------------------------------------------------------
            preferences: {
                fontSize: 'medium',
                animationsEnabled: true,
                soundEnabled: true,
                notificationsEnabled: true,
            },
            updatePreferences: (updates) => set((state) => ({
                preferences: { ...state.preferences, ...updates }
            })),

            // -------------------------------------------------------------------------
            // User Goals (Target Focus & Efficiency)
            // -------------------------------------------------------------------------
            goals: {
                dailyFocusMinutes: 240, // Default: 4 hours
                targetEfficiency: 80,   // Default: 80%
            },
            updateGoals: async (updates) => {
                set((state) => ({
                    goals: { ...state.goals, ...updates }
                }));

                // Sync to Cloud
                try {
                    const currentGoals = get().goals;
                    await fetch('/api/goals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentGoals),
                    });
                } catch (error) {
                    console.error('Failed to sync goals to cloud:', error);
                }
            },

            loadGoalsFromCloud: async () => {
                try {
                    const response = await fetch('/api/goals');
                    if (response.ok) {
                        const cloudGoals = await response.json();
                        set({
                            goals: {
                                dailyFocusMinutes: cloudGoals.dailyFocusMinutes || 240,
                                targetEfficiency: cloudGoals.targetEfficiency || 80,
                            }
                        });
                    }
                } catch (error) {
                    console.error('Failed to load goals from cloud:', error);
                }
            },

            // -------------------------------------------------------------------------
            // Command Palette
            // -------------------------------------------------------------------------
            commandPaletteOpen: false,
            setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
            toggleCommandPalette: () => set((state) => ({
                commandPaletteOpen: !state.commandPaletteOpen
            })),

            // -------------------------------------------------------------------------
            // Notification State (for badge counts)
            // -------------------------------------------------------------------------
            unreadNotifications: 0,
            setUnreadNotifications: (count) => set({ unreadNotifications: count }),
            clearNotifications: () => set({ unreadNotifications: 0 }),

            // -------------------------------------------------------------------------
            // Global Loading State
            // -------------------------------------------------------------------------
            isLoading: false,
            loadingMessage: '',
            setLoading: (loading, message = '') => set({
                isLoading: loading,
                loadingMessage: message
            }),

        }),
        {
            name: 'studyhub-app-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist these fields
                isDarkMode: state.isDarkMode,
                themePreference: state.themePreference,
                sidebarCollapsed: state.sidebarCollapsed,
                activeTab: state.activeTab,
                preferences: state.preferences,
                goals: state.goals,
            }),
        }
    )
);

// =============================================================================
// Session Store - Pomodoro sessions and study data
// =============================================================================

export const useSessionStore = create(
    persist(
        (set, get) => ({
            // Session history from API
            sessions: [],
            isLoadingSessions: true,

            setSessions: (sessions) => set({ sessions, isLoadingSessions: false }),
            addSession: (session) => set((state) => {
                // Prevent duplicates based on ID (Idempotency)
                if (state.sessions.some(s => s.id === session.id)) {
                    console.log('[Store] Duplicate session ignored:', session.id);
                    return {};
                }
                return { sessions: [...state.sessions, session] };
            }),

            // Timer state
            timerState: {
                duration: 25,
                timeLeft: 25 * 60,
                isActive: false,
                isCompleted: false,
                isFailed: false,
                initialTime: 25 * 60,
                startTime: null, // Unix timestamp when timer started (for cross-browser sync)
            },
            setTimerState: (updates) => set((state) => ({
                timerState: { ...state.timerState, ...updates }
            })),

            // Calculate today's focus time (includes partial/failed sessions)
            getTodayFocusTime: () => {
                const sessions = get().sessions;
                const today = new Date().toDateString();
                const totalMinutes = sessions.reduce((acc, session) => {
                    const sessionDate = new Date(session.timestamp).toDateString();
                    if (sessionDate === today) {
                        if (session.status === 'completed') {
                            return acc + (session.minutes || 0);
                        } else if (session.status === 'failed' && session.elapsedSeconds) {
                            // Count actual time spent in failed sessions
                            return acc + Math.floor(session.elapsedSeconds / 60);
                        }
                    }
                    return acc;
                }, 0);

                const hrs = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;
                return `${hrs}h ${mins}m`;
            },
        }),
        {
            name: 'studyhub-session-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist sessions, NOT timer state (reset timer on reload)
                sessions: state.sessions,
            }),
        }
    )
);

// =============================================================================
// Video Status Store - Track video completion status
// =============================================================================

export const DEFAULT_VIDEO_STATUS = { isDone: false, hasConcept: false };

export const useVideoStatusStore = create(
    persist(
        (set, get) => ({
            videoStatuses: {},
            isLoadingVideoStatuses: true,

            setVideoStatuses: (statuses) => {
                const statusMap = {};
                statuses.forEach(s => {
                    statusMap[s.videoId] = {
                        isDone: Boolean(s.isDone),
                        hasConcept: Boolean(s.hasConcept)
                    };
                });
                set({ videoStatuses: statusMap, isLoadingVideoStatuses: false });
            },

            updateVideoStatus: (videoId, updates) => set((state) => ({
                videoStatuses: {
                    ...state.videoStatuses,
                    [videoId]: {
                        ...(state.videoStatuses[videoId] || DEFAULT_VIDEO_STATUS),
                        ...updates
                    }
                }
            })),

            getVideoStatus: (videoId) => {
                return get().videoStatuses[videoId] || DEFAULT_VIDEO_STATUS;
            },
        }),
        {
            name: 'studyhub-video-status-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                videoStatuses: state.videoStatuses,
            }),
        }
    )
);

// =============================================================================
// Task Store - Hybrid Todo Persistence
// - Cloud: Today's todos (24h TTL)
// - IndexedDB: Local backup (6 month retention)
// =============================================================================

import * as idb from '../lib/idb';

export const useTaskStore = create(
    persist(
        (set, get) => ({
            tasks: [], // Daily Objectives (mapped to /api/daily-todos)
            mainTodos: [], // Main Todo List (mapped to /api/todos)
            isLoadingTasks: true,

            setTasks: (tasks) => set({ tasks, isLoadingTasks: false }),
            setMainTodos: (todos) => set({ mainTodos: todos }),

            addTask: async (text, createdAt = null) => {
                const timestamp = createdAt || new Date().toISOString();
                const guid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
                const newTask = {
                    id: guid,
                    text: text.trim(),
                    completed: false,
                    isSaved: false,
                    createdAt: timestamp,
                };
                set((state) => ({ tasks: [newTask, ...state.tasks] }));

                // Sync to IndexedDB (local backup)
                await idb.addTodo(newTask);

                // Sync to Cloud
                try {
                    const response = await fetch('/api/daily-todos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: guid, text: text.trim(), createdAt: timestamp }),
                    });
                    if (response.ok) {
                        const savedTask = await response.json();
                        get().markTaskSaved(guid, savedTask);
                    }
                } catch (error) {
                    console.error('Failed to sync task to cloud:', error);
                }

                return newTask;
            },

            toggleTask: async (id) => {
                const task = get().tasks.find(t => t.id === id);
                if (!task) return;

                const newCompleted = !task.completed;
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === id ? { ...t, completed: newCompleted } : t
                    )
                }));

                // Sync to IndexedDB
                await idb.updateTodo({ ...task, completed: newCompleted });

                // Sync to Cloud
                try {
                    await fetch(`/api/daily-todos/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed: newCompleted }),
                    });
                } catch (error) {
                    console.error('Failed to sync task toggle to cloud:', error);
                }
            },

            removeTask: async (id) => {
                const idStr = String(id);
                set((state) => ({
                    tasks: state.tasks.filter(t => String(t.id) !== idStr)
                }));

                // Sync to IndexedDB
                await idb.deleteTodo(idStr);

                // Sync to Cloud
                try {
                    await fetch(`/api/daily-todos/${idStr}`, {
                        method: 'DELETE',
                    });
                } catch (error) {
                    console.error('Failed to sync task removal to cloud:', error);
                }
            },

            // --- Main Todo List Methods (mapped to /api/todos) ---
            addMainTodo: async (text) => {
                const guid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
                const newTodo = {
                    id: guid,
                    text: text.trim(),
                    completed: false,
                    isSaved: false,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({ mainTodos: [newTodo, ...state.mainTodos] }));

                try {
                    const response = await fetch('/api/todos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: guid, text: text.trim() }),
                    });
                    if (response.ok) {
                        const savedTodo = await response.json();
                        set((state) => ({
                            mainTodos: state.mainTodos.map(t =>
                                t.id === guid ? { ...t, ...savedTodo, isSaved: true } : t
                            )
                        }));
                    }
                } catch (error) {
                    console.error('Failed to sync main todo to cloud:', error);
                }
                return newTodo;
            },

            toggleMainTodo: async (id) => {
                const todo = get().mainTodos.find(t => t.id === id);
                if (!todo) return;

                const newCompleted = !todo.completed;
                set((state) => ({
                    mainTodos: state.mainTodos.map(t =>
                        t.id === id ? { ...t, completed: newCompleted } : t
                    )
                }));

                try {
                    await fetch(`/api/todos/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed: newCompleted }),
                    });
                } catch (error) {
                    console.error('Failed to sync main todo toggle:', error);
                }
            },

            removeMainTodo: async (id) => {
                const idStr = String(id);
                set((state) => ({
                    mainTodos: state.mainTodos.filter(t => String(t.id) !== idStr)
                }));

                try {
                    await fetch(`/api/todos/${idStr}`, {
                        method: 'DELETE',
                    });
                } catch (error) {
                    console.error('Failed to sync main todo removal:', error);
                }
            },

            markTaskSaved: (id, savedData) => set((state) => {
                const updatedTasks = state.tasks.map(t =>
                    t.id === id ? { ...t, ...savedData, isSaved: true } : t
                );

                // Sync the saved state (with proper server ID) back to IndexedDB
                const savedTask = updatedTasks.find(t => t.id === id || t.id === savedData.id);
                if (savedTask) {
                    idb.updateTodo(savedTask).catch(err => console.error('Failed to sync saved task to IDB:', err));
                }

                return { tasks: updatedTasks };
            }),

            // Load from Cloud with local fallback
            loadFromCloud: async () => {
                try {
                    // 1. Load Daily Objectives
                    const objectivesRes = await fetch('/api/daily-todos');
                    if (objectivesRes.ok) {
                        const cloudTasks = await objectivesRes.json();
                        const formattedTasks = cloudTasks.map(t => ({
                            id: t.id,
                            text: t.text,
                            completed: Boolean(t.completed),
                            isSaved: true,
                            createdAt: t.created_at
                        }));
                        set({ tasks: formattedTasks });
                        await idb.syncTodosToLocal(formattedTasks);
                    }

                    // 2. Load Main Todo List
                    const todosRes = await fetch('/api/todos');
                    if (todosRes.ok) {
                        const cloudTodos = await todosRes.json();
                        const formattedTodos = cloudTodos.map(t => ({
                            id: t.id,
                            text: t.text,
                            completed: Boolean(t.completed),
                            isSaved: true,
                            createdAt: t.created_at,
                            updatedAt: t.updated_at
                        }));
                        set({ mainTodos: formattedTodos });
                    }

                    set({ isLoadingTasks: false });
                } catch (error) {
                    console.error('Failed to load tasks from cloud:', error);
                    get().loadFromLocal(); // Fallback to local
                }
            },

            // Load from IndexedDB on startup (hybrid fallback)
            loadFromLocal: async () => {
                const localTasks = await idb.getAllTodos();
                if (localTasks.length > 0) {
                    set({ tasks: localTasks, isLoadingTasks: false });
                }
            },

            cleanupOldTasks: () => set((state) => {
                // Keep 90 days of tasks for the archive/history view
                const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
                return {
                    tasks: state.tasks.filter(t => {
                        const createdAt = new Date(t.createdAt || t.created_at).getTime();
                        return createdAt > ninetyDaysAgo;
                    })
                };
            }),

            getCompletedCount: () => get().tasks.filter(t => t.completed).length,
            getUnsavedCount: () => get().tasks.filter(t => !t.isSaved).length,
        }),
        {
            name: 'studyhub-task-store',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state.isLoadingTasks = false;
                state.cleanupOldTasks();
                // Also run IndexedDB cleanup
                idb.cleanupOldTodos();
            }
        }
    )
);

// =============================================================================
// Selectors - Derived state for performance
// =============================================================================

// Use these for selective re-renders
export const selectIsDarkMode = (state) => state.isDarkMode;
export const selectActiveTab = (state) => state.activeTab;
export const selectSidebarCollapsed = (state) => state.sidebarCollapsed;
export const selectCommandPaletteOpen = (state) => state.commandPaletteOpen;

// =============================================================================
// Custom hooks for common patterns
// =============================================================================

/**
 * Hook for theme management
 */
export const useTheme = () => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    const themePreference = useAppStore((state) => state.themePreference);
    const toggleTheme = useAppStore((state) => state.toggleTheme);
    const setTheme = useAppStore((state) => state.setTheme);
    const setThemePreference = useAppStore((state) => state.setThemePreference);

    return { isDarkMode, themePreference, toggleTheme, setTheme, setThemePreference };
};

/**
 * Hook for navigation
 */
export const useNavigation = () => {
    const activeTab = useAppStore((state) => state.activeTab);
    const setActiveTab = useAppStore((state) => state.setActiveTab);

    return { activeTab, setActiveTab };
};

/**
 * Hook for sidebar
 */
export const useSidebar = () => {
    const collapsed = useAppStore((state) => state.sidebarCollapsed);
    const setCollapsed = useAppStore((state) => state.setSidebarCollapsed);
    const toggle = useAppStore((state) => state.toggleSidebar);

    return { collapsed, setCollapsed, toggle };
};
