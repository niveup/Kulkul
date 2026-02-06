/**
 * Tests for Zustand Stores
 * 
 * Tests cover all three main stores:
 * 1. useAppStore - Global application state
 * 2. useSessionStore - Pomodoro sessions  
 * 3. useTaskStore - Task management
 * 
 * Also tests selectors and custom hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    useAppStore,
    useSessionStore,
    useTaskStore,
    selectIsDarkMode,
    selectActiveTab,
    selectSidebarCollapsed,
    selectCommandPaletteOpen,
    useTheme,
    useNavigation,
    useSidebar,
} from './index';

// =============================================================================
// Test Setup
// =============================================================================

// Mock idb module (IndexedDB)
vi.mock('../lib/idb', () => ({
    addTodo: vi.fn(() => Promise.resolve()),
    updateTodo: vi.fn(() => Promise.resolve()),
    deleteTodo: vi.fn(() => Promise.resolve()),
    getAllTodos: vi.fn(() => Promise.resolve([])),
    cleanupOldTodos: vi.fn(() => Promise.resolve()),
}));

// Mock fetch
const mockFetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
}));
global.fetch = mockFetch;

// Helper to reset store to initial state
const resetAppStore = () => {
    useAppStore.setState({
        isDarkMode: true,
        sidebarCollapsed: true,
        activeTab: 'overview',
        preferences: {
            fontSize: 'medium',
            animationsEnabled: true,
            soundEnabled: true,
            notificationsEnabled: true,
        },
        goals: {
            dailyFocusMinutes: 240,
            targetEfficiency: 80,
        },
        commandPaletteOpen: false,
        unreadNotifications: 0,
        isLoading: false,
        loadingMessage: '',
    });
};

const resetSessionStore = () => {
    useSessionStore.setState({
        sessions: [],
        isLoadingSessions: true,
        timerState: {
            duration: 25,
            timeLeft: 25 * 60,
            isActive: false,
            isCompleted: false,
            isFailed: false,
            initialTime: 25 * 60,
            startTime: null,
        },
    });
};

const resetTaskStore = () => {
    useTaskStore.setState({
        tasks: [],
        isLoadingTasks: true,
    });
};

beforeEach(() => {
    vi.clearAllMocks();
    resetAppStore();
    resetSessionStore();
    resetTaskStore();
});

// =============================================================================
// useAppStore - Theme State
// =============================================================================
describe('useAppStore - Theme', () => {
    it('has dark mode enabled by default', () => {
        const state = useAppStore.getState();
        expect(state.isDarkMode).toBe(true);
    });

    it('toggleTheme switches dark mode', () => {
        const { toggleTheme } = useAppStore.getState();

        expect(useAppStore.getState().isDarkMode).toBe(true);

        act(() => toggleTheme());
        expect(useAppStore.getState().isDarkMode).toBe(false);

        act(() => toggleTheme());
        expect(useAppStore.getState().isDarkMode).toBe(true);
    });

    it('setTheme sets dark mode explicitly', () => {
        const { setTheme } = useAppStore.getState();

        act(() => setTheme(false));
        expect(useAppStore.getState().isDarkMode).toBe(false);

        act(() => setTheme(true));
        expect(useAppStore.getState().isDarkMode).toBe(true);
    });
});

// =============================================================================
// useAppStore - Sidebar State
// =============================================================================
describe('useAppStore - Sidebar', () => {
    it('sidebar is collapsed by default', () => {
        expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    });

    it('toggleSidebar switches collapsed state', () => {
        const { toggleSidebar } = useAppStore.getState();

        act(() => toggleSidebar());
        expect(useAppStore.getState().sidebarCollapsed).toBe(false);

        act(() => toggleSidebar());
        expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    });

    it('setSidebarCollapsed sets state explicitly', () => {
        const { setSidebarCollapsed } = useAppStore.getState();

        act(() => setSidebarCollapsed(false));
        expect(useAppStore.getState().sidebarCollapsed).toBe(false);

        act(() => setSidebarCollapsed(true));
        expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    });
});


// =============================================================================
// useAppStore - Navigation
// =============================================================================
describe('useAppStore - Navigation', () => {
    it('activeTab is overview by default', () => {
        expect(useAppStore.getState().activeTab).toBe('overview');
    });

    it('setActiveTab changes active tab', () => {
        const { setActiveTab } = useAppStore.getState();

        act(() => setActiveTab('timer'));
        expect(useAppStore.getState().activeTab).toBe('timer');

        act(() => setActiveTab('resources'));
        expect(useAppStore.getState().activeTab).toBe('resources');
    });
});

// =============================================================================
// useAppStore - Preferences
// =============================================================================
describe('useAppStore - Preferences', () => {
    it('has default preferences', () => {
        const { preferences } = useAppStore.getState();

        expect(preferences.fontSize).toBe('medium');
        expect(preferences.animationsEnabled).toBe(true);
        expect(preferences.soundEnabled).toBe(true);
        expect(preferences.notificationsEnabled).toBe(true);
    });

    it('updatePreferences merges partial updates', () => {
        const { updatePreferences } = useAppStore.getState();

        act(() => updatePreferences({ fontSize: 'large' }));

        const { preferences } = useAppStore.getState();
        expect(preferences.fontSize).toBe('large');
        expect(preferences.animationsEnabled).toBe(true); // Unchanged
    });

    it('updatePreferences can update multiple fields', () => {
        const { updatePreferences } = useAppStore.getState();

        act(() => updatePreferences({
            fontSize: 'small',
            soundEnabled: false,
        }));

        const { preferences } = useAppStore.getState();
        expect(preferences.fontSize).toBe('small');
        expect(preferences.soundEnabled).toBe(false);
        expect(preferences.animationsEnabled).toBe(true); // Unchanged
    });
});

// =============================================================================
// useAppStore - Goals
// =============================================================================
describe('useAppStore - Goals', () => {
    it('has default goals', () => {
        const { goals } = useAppStore.getState();

        expect(goals.dailyFocusMinutes).toBe(240);
        expect(goals.targetEfficiency).toBe(80);
    });

    it('updateGoals merges updates', () => {
        const { updateGoals } = useAppStore.getState();

        act(() => updateGoals({ dailyFocusMinutes: 300 }));

        const { goals } = useAppStore.getState();
        expect(goals.dailyFocusMinutes).toBe(300);
        expect(goals.targetEfficiency).toBe(80); // Unchanged
    });
});

// =============================================================================
// useAppStore - Command Palette
// =============================================================================
describe('useAppStore - Command Palette', () => {
    it('command palette is closed by default', () => {
        expect(useAppStore.getState().commandPaletteOpen).toBe(false);
    });

    it('toggleCommandPalette toggles open state', () => {
        const { toggleCommandPalette } = useAppStore.getState();

        act(() => toggleCommandPalette());
        expect(useAppStore.getState().commandPaletteOpen).toBe(true);

        act(() => toggleCommandPalette());
        expect(useAppStore.getState().commandPaletteOpen).toBe(false);
    });

    it('setCommandPaletteOpen sets state explicitly', () => {
        const { setCommandPaletteOpen } = useAppStore.getState();

        act(() => setCommandPaletteOpen(true));
        expect(useAppStore.getState().commandPaletteOpen).toBe(true);
    });
});

// =============================================================================
// useAppStore - Notifications
// =============================================================================
describe('useAppStore - Notifications', () => {
    it('has zero unread notifications by default', () => {
        expect(useAppStore.getState().unreadNotifications).toBe(0);
    });

    it('setUnreadNotifications updates count', () => {
        const { setUnreadNotifications } = useAppStore.getState();

        act(() => setUnreadNotifications(5));
        expect(useAppStore.getState().unreadNotifications).toBe(5);
    });

    it('clearNotifications resets count to zero', () => {
        useAppStore.setState({ unreadNotifications: 10 });
        const { clearNotifications } = useAppStore.getState();

        act(() => clearNotifications());
        expect(useAppStore.getState().unreadNotifications).toBe(0);
    });
});

// =============================================================================
// useAppStore - Loading State
// =============================================================================
describe('useAppStore - Loading', () => {
    it('is not loading by default', () => {
        const state = useAppStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state.loadingMessage).toBe('');
    });

    it('setLoading sets loading state with message', () => {
        const { setLoading } = useAppStore.getState();

        act(() => setLoading(true, 'Saving data...'));

        const state = useAppStore.getState();
        expect(state.isLoading).toBe(true);
        expect(state.loadingMessage).toBe('Saving data...');
    });

    it('setLoading clears loading state', () => {
        useAppStore.setState({ isLoading: true, loadingMessage: 'Loading...' });
        const { setLoading } = useAppStore.getState();

        act(() => setLoading(false));

        const state = useAppStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state.loadingMessage).toBe('');
    });
});

// =============================================================================
// Selectors
// =============================================================================
describe('Selectors', () => {
    it('selectIsDarkMode returns dark mode state', () => {
        const state = useAppStore.getState();
        expect(selectIsDarkMode(state)).toBe(true);
    });

    it('selectActiveTab returns active tab', () => {
        useAppStore.setState({ activeTab: 'timer' });
        const state = useAppStore.getState();
        expect(selectActiveTab(state)).toBe('timer');
    });

    it('selectSidebarCollapsed returns sidebar state', () => {
        const state = useAppStore.getState();
        expect(selectSidebarCollapsed(state)).toBe(true);
    });


    it('selectCommandPaletteOpen returns command palette state', () => {
        useAppStore.setState({ commandPaletteOpen: true });
        const state = useAppStore.getState();
        expect(selectCommandPaletteOpen(state)).toBe(true);
    });
});

// =============================================================================
// useSessionStore
// =============================================================================
describe('useSessionStore', () => {
    it('has empty sessions by default', () => {
        const state = useSessionStore.getState();
        expect(state.sessions).toEqual([]);
        expect(state.isLoadingSessions).toBe(true);
    });

    it('setSessions updates sessions and loading state', () => {
        const { setSessions } = useSessionStore.getState();
        const mockSessions = [
            { id: 1, minutes: 25, status: 'completed' },
            { id: 2, minutes: 30, status: 'completed' },
        ];

        act(() => setSessions(mockSessions));

        const state = useSessionStore.getState();
        expect(state.sessions).toEqual(mockSessions);
        expect(state.isLoadingSessions).toBe(false);
    });

    it('addSession adds session to list', () => {
        const { addSession } = useSessionStore.getState();
        const newSession = { id: 1, minutes: 25, status: 'completed' };

        act(() => addSession(newSession));

        expect(useSessionStore.getState().sessions).toHaveLength(1);
        expect(useSessionStore.getState().sessions[0]).toEqual(newSession);
    });

    it('has default timer state', () => {
        const { timerState } = useSessionStore.getState();

        expect(timerState.duration).toBe(25);
        expect(timerState.timeLeft).toBe(25 * 60);
        expect(timerState.isActive).toBe(false);
        expect(timerState.isCompleted).toBe(false);
    });

    it('setTimerState updates timer state', () => {
        const { setTimerState } = useSessionStore.getState();

        act(() => setTimerState({ isActive: true, startTime: Date.now() }));

        const { timerState } = useSessionStore.getState();
        expect(timerState.isActive).toBe(true);
        expect(timerState.startTime).toBeTruthy();
        expect(timerState.duration).toBe(25); // Unchanged
    });

    it('getTodayFocusTime calculates focus time correctly', () => {
        const today = new Date().toISOString();
        const sessions = [
            { timestamp: today, minutes: 25, status: 'completed' },
            { timestamp: today, minutes: 30, status: 'completed' },
            { timestamp: today, elapsedSeconds: 600, status: 'failed' }, // 10 minutes
        ];

        useSessionStore.setState({ sessions });
        const focusTime = useSessionStore.getState().getTodayFocusTime();

        // 25 + 30 + 10 = 65 minutes = 1h 5m
        expect(focusTime).toBe('1h 5m');
    });

    it('getTodayFocusTime excludes sessions from other days', () => {
        const today = new Date().toISOString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const sessions = [
            { timestamp: today, minutes: 25, status: 'completed' },
            { timestamp: yesterday, minutes: 30, status: 'completed' }, // Should not count
        ];

        useSessionStore.setState({ sessions });
        const focusTime = useSessionStore.getState().getTodayFocusTime();

        expect(focusTime).toBe('0h 25m');
    });
});

// =============================================================================
// useTaskStore
// =============================================================================
describe('useTaskStore', () => {
    it('has empty tasks by default', () => {
        const state = useTaskStore.getState();
        expect(state.tasks).toEqual([]);
        expect(state.isLoadingTasks).toBe(true);
    });

    it('setTasks updates tasks and loading state', () => {
        const { setTasks } = useTaskStore.getState();
        const mockTasks = [
            { id: '1', text: 'Task 1', completed: false },
            { id: '2', text: 'Task 2', completed: true },
        ];

        act(() => setTasks(mockTasks));

        const state = useTaskStore.getState();
        expect(state.tasks).toEqual(mockTasks);
        expect(state.isLoadingTasks).toBe(false);
    });

    it('markTaskSaved updates task saved status', () => {
        useTaskStore.setState({
            tasks: [{ id: '1', text: 'Task', completed: false, isSaved: false }],
        });

        const { markTaskSaved } = useTaskStore.getState();

        act(() => markTaskSaved('1', { savedAt: new Date().toISOString() }));

        const task = useTaskStore.getState().tasks[0];
        expect(task.isSaved).toBe(true);
        expect(task.savedAt).toBeTruthy();
    });

    it('getCompletedCount returns correct count', () => {
        useTaskStore.setState({
            tasks: [
                { id: '1', completed: true },
                { id: '2', completed: false },
                { id: '3', completed: true },
            ],
        });

        const count = useTaskStore.getState().getCompletedCount();
        expect(count).toBe(2);
    });

    it('getUnsavedCount returns correct count', () => {
        useTaskStore.setState({
            tasks: [
                { id: '1', isSaved: true },
                { id: '2', isSaved: false },
                { id: '3', isSaved: false },
            ],
        });

        const count = useTaskStore.getState().getUnsavedCount();
        expect(count).toBe(2);
    });

    it('cleanupOldTasks removes tasks older than 48 hours', () => {
        const now = Date.now();
        const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
        const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();

        useTaskStore.setState({
            tasks: [
                { id: '1', text: 'Old task', createdAt: threeDaysAgo },
                { id: '2', text: 'Recent task', createdAt: oneHourAgo },
            ],
        });

        const { cleanupOldTasks } = useTaskStore.getState();
        act(() => cleanupOldTasks());

        const tasks = useTaskStore.getState().tasks;
        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe('2');
    });
});

// =============================================================================
// Custom Hooks
// =============================================================================
describe('useTheme hook', () => {
    it('returns theme state and actions', () => {
        const { result } = renderHook(() => useTheme());

        expect(result.current.isDarkMode).toBe(true);
        expect(typeof result.current.toggleTheme).toBe('function');
        expect(typeof result.current.setTheme).toBe('function');
    });

    it('toggleTheme works through hook', () => {
        const { result } = renderHook(() => useTheme());

        act(() => result.current.toggleTheme());

        expect(result.current.isDarkMode).toBe(false);
    });
});

describe('useNavigation hook', () => {
    it('returns navigation state and actions', () => {
        const { result } = renderHook(() => useNavigation());

        expect(result.current.activeTab).toBe('overview');
        expect(typeof result.current.setActiveTab).toBe('function');
    });

    it('setActiveTab works through hook', () => {
        const { result } = renderHook(() => useNavigation());

        act(() => result.current.setActiveTab('timer'));

        expect(result.current.activeTab).toBe('timer');
    });
});

describe('useSidebar hook', () => {
    it('returns sidebar state and actions', () => {
        const { result } = renderHook(() => useSidebar());

        expect(result.current.collapsed).toBe(true);
        expect(typeof result.current.setCollapsed).toBe('function');
        expect(typeof result.current.toggle).toBe('function');
    });

    it('toggle works through hook', () => {
        const { result } = renderHook(() => useSidebar());

        act(() => result.current.toggle());

        expect(result.current.collapsed).toBe(false);
    });
});
