/**
 * Optimized Store Selectors
 * 
 * Performance-optimized selectors for Zustand stores.
 * Using shallow equality checks and memoized selectors to prevent unnecessary re-renders.
 * 
 * @usage
 * // Instead of destructuring (subscribes to entire store):
 * const { activeTab, isDarkMode } = useAppStore();
 * 
 * // Use atomic selectors (subscribes only to specific values):
 * const activeTab = useActiveTab();
 * const isDarkMode = useIsDarkModeSelector();
 */

import { useCallback } from 'react';
import { useAppStore, useSessionStore, useTaskStore } from './index';

// =============================================================================
// App Store Selectors
// =============================================================================

// Theme
export const useIsDarkModeSelector = () => useAppStore((s) => s.isDarkMode);
export const useToggleTheme = () => useAppStore((s) => s.toggleTheme);
export const useSetTheme = () => useAppStore((s) => s.setTheme);

// Navigation
export const useActiveTab = () => useAppStore((s) => s.activeTab);
export const useSetActiveTab = () => useAppStore((s) => s.setActiveTab);

// Sidebar
export const useSidebarCollapsed = () => useAppStore((s) => s.sidebarCollapsed);
export const useSetSidebarCollapsed = () => useAppStore((s) => s.setSidebarCollapsed);
export const useToggleSidebar = () => useAppStore((s) => s.toggleSidebar);

// Command Palette
export const useCommandPaletteOpen = () => useAppStore((s) => s.commandPaletteOpen);
export const useSetCommandPaletteOpen = () => useAppStore((s) => s.setCommandPaletteOpen);
export const useToggleCommandPalette = () => useAppStore((s) => s.toggleCommandPalette);

// Preferences
export const usePreferences = () => useAppStore((s) => s.preferences);
export const useUpdatePreferences = () => useAppStore((s) => s.updatePreferences);

// Loading
export const useIsLoading = () => useAppStore((s) => s.isLoading);
export const useLoadingMessage = () => useAppStore((s) => s.loadingMessage);
export const useSetLoading = () => useAppStore((s) => s.setLoading);

// =============================================================================
// Session Store Selectors
// =============================================================================

// Sessions
export const useSessions = () => useSessionStore((s) => s.sessions);
export const useIsLoadingSessions = () => useSessionStore((s) => s.isLoadingSessions);
export const useSetSessions = () => useSessionStore((s) => s.setSessions);
export const useAddSession = () => useSessionStore((s) => s.addSession);

// Timer
export const useTimerState = () => useSessionStore((s) => s.timerState);
export const useSetTimerState = () => useSessionStore((s) => s.setTimerState);
export const useTimerDuration = () => useSessionStore((s) => s.timerState.duration);
export const useTimerTimeLeft = () => useSessionStore((s) => s.timerState.timeLeft);
export const useTimerIsActive = () => useSessionStore((s) => s.timerState.isActive);
export const useTimerIsCompleted = () => useSessionStore((s) => s.timerState.isCompleted);

// Derived
export const useGetTodayFocusTime = () => {
    const getTodayFocusTime = useSessionStore((s) => s.getTodayFocusTime);
    return useCallback(() => getTodayFocusTime(), [getTodayFocusTime]);
};

// =============================================================================
// Task Store Selectors
// =============================================================================

// Tasks
export const useTasks = () => useTaskStore((s) => s.tasks);
export const useIsLoadingTasks = () => useTaskStore((s) => s.isLoadingTasks);
export const useSetTasks = () => useTaskStore((s) => s.setTasks);
export const useAddTask = () => useTaskStore((s) => s.addTask);
export const useToggleTask = () => useTaskStore((s) => s.toggleTask);
export const useRemoveTask = () => useTaskStore((s) => s.removeTask);
export const useMarkTaskSaved = () => useTaskStore((s) => s.markTaskSaved);

// Derived
export const useCompletedTaskCount = () => {
    const tasks = useTaskStore((s) => s.tasks);
    return tasks.filter(t => t.completed).length;
};

export const usePendingTaskCount = () => {
    const tasks = useTaskStore((s) => s.tasks);
    return tasks.filter(t => !t.completed).length;
};

// =============================================================================
// Composite Selectors (multiple values, use sparingly)
// =============================================================================

/**
 * Theme hook with all related values
 * @returns {{ isDarkMode: boolean, toggleTheme: Function, setTheme: Function }}
 */
export const useThemeSelector = () => ({
    isDarkMode: useIsDarkModeSelector(),
    toggleTheme: useToggleTheme(),
    setTheme: useSetTheme(),
});

/**
 * Navigation hook with all related values
 * @returns {{ activeTab: string, setActiveTab: Function }}
 */
export const useNavigationSelector = () => ({
    activeTab: useActiveTab(),
    setActiveTab: useSetActiveTab(),
});

/**
 * Sidebar hook with all related values
 * @returns {{ collapsed: boolean, setCollapsed: Function, toggle: Function }}
 */
export const useSidebarSelector = () => ({
    collapsed: useSidebarCollapsed(),
    setCollapsed: useSetSidebarCollapsed(),
    toggle: useToggleSidebar(),
});
