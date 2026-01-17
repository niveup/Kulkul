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
            toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setTheme: (isDark) => set({ isDarkMode: isDark }),

            // -------------------------------------------------------------------------
            // Sidebar State
            // -------------------------------------------------------------------------
            sidebarCollapsed: true,
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

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
            updateGoals: (updates) => set((state) => ({
                goals: { ...state.goals, ...updates }
            })),

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
            addSession: (session) => set((state) => ({
                sessions: [...state.sessions, session]
            })),

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
// Task Store - Hybrid Todo Persistence
// - Cloud: Today's todos (24h TTL)
// - IndexedDB: Local backup (6 month retention)
// =============================================================================

import * as idb from '../lib/idb';

export const useTaskStore = create(
    persist(
        (set, get) => ({
            tasks: [],
            isLoadingTasks: true,

            setTasks: (tasks) => set({ tasks, isLoadingTasks: false }),

            addTask: async (text) => {
                const newTask = {
                    id: String(Date.now()),
                    text: text.trim(),
                    completed: false,
                    isSaved: false,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({ tasks: [newTask, ...state.tasks] }));

                // Sync to IndexedDB (local backup)
                await idb.addTodo(newTask);

                // Sync to Cloud (24h TTL)
                try {
                    await fetch('/api/daily-todos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: newTask.text }),
                    });
                } catch (e) {
                    console.warn('[TaskStore] Cloud sync failed:', e);
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
                    await fetch('/api/daily-todos', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, completed: newCompleted }),
                    });
                } catch (e) {
                    console.warn('[TaskStore] Cloud sync failed:', e);
                }
            },

            removeTask: async (id) => {
                set((state) => ({
                    tasks: state.tasks.filter(t => t.id !== id)
                }));

                // Sync to IndexedDB
                await idb.deleteTodo(id);

                // Sync to Cloud
                try {
                    await fetch('/api/daily-todos', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id }),
                    });
                } catch (e) {
                    console.warn('[TaskStore] Cloud sync failed:', e);
                }
            },

            markTaskSaved: (id, savedData) => set((state) => ({
                tasks: state.tasks.map(t =>
                    t.id === id ? { ...t, ...savedData, isSaved: true } : t
                )
            })),

            // Load from IndexedDB on startup (hybrid fallback)
            loadFromLocal: async () => {
                const localTasks = await idb.getAllTodos();
                if (localTasks.length > 0) {
                    set({ tasks: localTasks, isLoadingTasks: false });
                }
            },

            cleanupOldTasks: () => set((state) => {
                const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);
                return {
                    tasks: state.tasks.filter(t => {
                        const createdAt = new Date(t.createdAt).getTime();
                        return createdAt > twoDaysAgo;
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
    const toggleTheme = useAppStore((state) => state.toggleTheme);
    const setTheme = useAppStore((state) => state.setTheme);

    return { isDarkMode, toggleTheme, setTheme };
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
