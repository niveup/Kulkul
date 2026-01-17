/**
 * Local Storage Adapter
 * 
 * Provides API-like interface for localStorage operations.
 * Used in guest mode (non-authenticated) to store all data locally.
 */

const STORAGE_KEYS = {
    SESSIONS: 'studyhub_local_sessions',
    ACTIVE_TIMER: 'studyhub_local_active_timer',
    CUSTOM_APPS: 'studyhub_local_custom_apps',
    TODOS: 'studyhub_local_todos',
    CONVERSATIONS: 'studyhub_local_conversations',
};

// Helper to safely parse JSON from localStorage
const getStoredData = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error(`[LocalStorage] Failed to parse ${key}:`, e);
        return defaultValue;
    }
};

// Helper to safely save JSON to localStorage
const setStoredData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error(`[LocalStorage] Failed to save ${key}:`, e);
        return false;
    }
};

// =============================================================================
// Sessions (Pomodoro history)
// =============================================================================

export const localSessions = {
    getAll: () => getStoredData(STORAGE_KEYS.SESSIONS, []),

    add: (session) => {
        const sessions = getStoredData(STORAGE_KEYS.SESSIONS, []);
        sessions.push(session);
        setStoredData(STORAGE_KEYS.SESSIONS, sessions);
        return session;
    },

    clear: () => {
        setStoredData(STORAGE_KEYS.SESSIONS, []);
    },
};

// =============================================================================
// Active Timer (cross-tab sync via localStorage)
// =============================================================================

export const localActiveTimer = {
    get: () => getStoredData(STORAGE_KEYS.ACTIVE_TIMER, null),

    set: (timerState) => {
        setStoredData(STORAGE_KEYS.ACTIVE_TIMER, timerState);
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    },
};

// =============================================================================
// Custom Apps
// =============================================================================

export const localCustomApps = {
    getAll: () => getStoredData(STORAGE_KEYS.CUSTOM_APPS, []),

    add: (app) => {
        const apps = getStoredData(STORAGE_KEYS.CUSTOM_APPS, []);
        apps.push(app);
        setStoredData(STORAGE_KEYS.CUSTOM_APPS, apps);
        return app;
    },

    update: (id, updates) => {
        const apps = getStoredData(STORAGE_KEYS.CUSTOM_APPS, []);
        const index = apps.findIndex(a => a.id === id);
        if (index !== -1) {
            apps[index] = { ...apps[index], ...updates };
            setStoredData(STORAGE_KEYS.CUSTOM_APPS, apps);
        }
        return apps[index];
    },

    remove: (id) => {
        const apps = getStoredData(STORAGE_KEYS.CUSTOM_APPS, []);
        const filtered = apps.filter(a => a.id !== id);
        setStoredData(STORAGE_KEYS.CUSTOM_APPS, filtered);
    },
};

// =============================================================================
// Todos
// =============================================================================

export const localTodos = {
    getAll: () => getStoredData(STORAGE_KEYS.TODOS, []),

    add: (todo) => {
        const todos = getStoredData(STORAGE_KEYS.TODOS, []);
        todos.unshift(todo);
        setStoredData(STORAGE_KEYS.TODOS, todos);
        return todo;
    },

    update: (id, updates) => {
        const todos = getStoredData(STORAGE_KEYS.TODOS, []);
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = { ...todos[index], ...updates };
            setStoredData(STORAGE_KEYS.TODOS, todos);
        }
        return todos[index];
    },

    remove: (id) => {
        const todos = getStoredData(STORAGE_KEYS.TODOS, []);
        const filtered = todos.filter(t => t.id !== id);
        setStoredData(STORAGE_KEYS.TODOS, filtered);
    },

    clear: () => {
        setStoredData(STORAGE_KEYS.TODOS, []);
    },
};

// =============================================================================
// Conversations (for AI Chat guest mode - stores locally without AI)
// =============================================================================

export const localConversations = {
    getAll: () => getStoredData(STORAGE_KEYS.CONVERSATIONS, []),

    add: (conversation) => {
        const convos = getStoredData(STORAGE_KEYS.CONVERSATIONS, []);
        convos.unshift(conversation);
        setStoredData(STORAGE_KEYS.CONVERSATIONS, convos);
        return conversation;
    },

    remove: (id) => {
        const convos = getStoredData(STORAGE_KEYS.CONVERSATIONS, []);
        const filtered = convos.filter(c => c.id !== id);
        setStoredData(STORAGE_KEYS.CONVERSATIONS, filtered);
    },
};

export default {
    sessions: localSessions,
    activeTimer: localActiveTimer,
    customApps: localCustomApps,
    todos: localTodos,
    conversations: localConversations,
};
