/**
 * IndexedDB Wrapper for Local Todo Backup
 * Uses 'idb' library for clean async/await API
 * 
 * Features:
 * - 6-month auto-cleanup on initialization
 * - Offline-first todo storage
 * - Minimal storage footprint
 */

import { openDB } from 'idb';

const DB_NAME = 'studyhub-local';
const DB_VERSION = 1;
const STORE_TODOS = 'todos';

// 6 months in milliseconds
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

let dbPromise = null;

/**
 * Initialize the database
 */
async function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Create todos store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_TODOS)) {
                    const store = db.createObjectStore(STORE_TODOS, { keyPath: 'id' });
                    store.createIndex('createdAt', 'createdAt');
                }
            },
        });
    }
    return dbPromise;
}

/**
 * Run cleanup on startup - delete todos older than 6 months
 */
export async function cleanupOldTodos() {
    try {
        const db = await getDB();
        const cutoffDate = Date.now() - SIX_MONTHS_MS;

        const tx = db.transaction(STORE_TODOS, 'readwrite');
        const store = tx.objectStore(STORE_TODOS);
        const index = store.index('createdAt');

        let cursor = await index.openCursor();
        let deletedCount = 0;

        while (cursor) {
            const createdAt = new Date(cursor.value.createdAt).getTime();
            if (createdAt < cutoffDate) {
                await cursor.delete();
                deletedCount++;
            }
            cursor = await cursor.continue();
        }

        await tx.done;

        if (deletedCount > 0) {
            console.log(`[IDB] Cleaned up ${deletedCount} old todos`);
        }

        return deletedCount;
    } catch (error) {
        console.error('[IDB] Cleanup error:', error);
        return 0;
    }
}

/**
 * Get all todos from IndexedDB
 */
export async function getAllTodos() {
    try {
        const db = await getDB();
        return await db.getAll(STORE_TODOS);
    } catch (error) {
        console.error('[IDB] getAllTodos error:', error);
        return [];
    }
}

/**
 * Add a todo to IndexedDB
 */
export async function addTodo(todo) {
    try {
        const db = await getDB();
        await db.put(STORE_TODOS, {
            ...todo,
            createdAt: todo.createdAt || new Date().toISOString(),
        });
        return true;
    } catch (error) {
        console.error('[IDB] addTodo error:', error);
        return false;
    }
}

/**
 * Update a todo in IndexedDB
 */
export async function updateTodo(todo) {
    try {
        const db = await getDB();
        await db.put(STORE_TODOS, todo);
        return true;
    } catch (error) {
        console.error('[IDB] updateTodo error:', error);
        return false;
    }
}

/**
 * Delete a todo from IndexedDB
 */
export async function deleteTodo(id) {
    try {
        const db = await getDB();
        await db.delete(STORE_TODOS, id);
        return true;
    } catch (error) {
        console.error('[IDB] deleteTodo error:', error);
        return false;
    }
}

/**
 * Sync todos to IndexedDB (bulk operation)
 */
export async function syncTodosToLocal(todos) {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_TODOS, 'readwrite');

        // Clear existing and add new
        await tx.objectStore(STORE_TODOS).clear();
        for (const todo of todos) {
            await tx.objectStore(STORE_TODOS).put(todo);
        }

        await tx.done;
        return true;
    } catch (error) {
        console.error('[IDB] syncTodosToLocal error:', error);
        return false;
    }
}

// Initialize and cleanup on module load
if (typeof window !== 'undefined') {
    cleanupOldTodos();
}
