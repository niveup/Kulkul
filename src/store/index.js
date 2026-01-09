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
            }),
        }
    )
);

// =============================================================================
// Session Store - Pomodoro sessions and study data
// =============================================================================

export const useSessionStore = create((set, get) => ({
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

}));

// =============================================================================
// Task Store - Todo list management
// =============================================================================

export const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoadingTasks: true,

    setTasks: (tasks) => set({ tasks, isLoadingTasks: false }),

    addTask: (text) => {
        const newTask = {
            id: String(Date.now()),
            text: text.trim(),
            completed: false,
            isSaved: false,
            createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
    },

    toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        )
    })),

    removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
    })),

    markTaskSaved: (id, savedData) => set((state) => ({
        tasks: state.tasks.map(t =>
            t.id === id ? { ...t, ...savedData, isSaved: true } : t
        )
    })),

    getCompletedCount: () => get().tasks.filter(t => t.completed).length,
    getUnsavedCount: () => get().tasks.filter(t => !t.isSaved).length,
}));

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
