/**
 * useIndexedDBCache - Session-based file caching with auto-cleanup
 * 
 * Features:
 * - Save files to IndexedDB for instant access
 * - Auto-delete all cached files when site closes
 * - Track synced vs pending files
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const DB_NAME = 'VaultFileCache';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// Open database connection
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

export function useIndexedDBCache() {
    const [isReady, setIsReady] = useState(false);
    const [cachedFiles, setCachedFiles] = useState(new Map());
    const [pendingSyncs, setPendingSyncs] = useState(new Set());
    const dbRef = useRef(null);

    // Initialize database and setup cleanup
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const db = await openDB();
                dbRef.current = db;

                // Load existing cached file IDs
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    if (mounted) {
                        const files = getAllRequest.result;
                        const map = new Map();
                        const pending = new Set();

                        files.forEach(file => {
                            map.set(file.id, {
                                name: file.name,
                                size: file.size,
                                synced: file.synced,
                                timestamp: file.timestamp
                            });
                            if (!file.synced) {
                                pending.add(file.id);
                            }
                        });

                        setCachedFiles(map);
                        setPendingSyncs(pending);
                        setIsReady(true);
                        console.log('[IndexedDBCache] Initialized with', files.length, 'cached files,', pending.size, 'pending');
                    }
                };
            } catch (err) {
                console.error('[IndexedDBCache] Failed to initialize:', err);
            }
        };

        init();

        // IMPROVED: Use sessionStorage to detect actual tab close vs refresh
        // On page load, set a flag. On unload, check if it's a refresh or close.
        const SESSION_KEY = 'vault_cache_session';
        const isNewSession = !sessionStorage.getItem(SESSION_KEY);
        sessionStorage.setItem(SESSION_KEY, 'active');

        // Only clear synced files when the TAB IS ACTUALLY CLOSED (not refresh)
        // We use pagehide with persisted check for better detection
        const handlePageHide = (event) => {
            // event.persisted = true means page is being cached (bfcache) - likely refresh/navigation
            // event.persisted = false means page is being destroyed - likely tab close
            if (!event.persisted) {
                console.log('[IndexedDBCache] Tab closing, clearing synced files...');
                // Use synchronous approach for cleanup on close
                if (dbRef.current) {
                    try {
                        const transaction = dbRef.current.transaction(STORE_NAME, 'readwrite');
                        const store = transaction.objectStore(STORE_NAME);
                        const getAllRequest = store.getAll();
                        getAllRequest.onsuccess = () => {
                            const files = getAllRequest.result;
                            files.forEach(file => {
                                if (file.synced) {
                                    store.delete(file.id);
                                }
                            });
                        };
                    } catch (e) {
                        console.warn('[IndexedDBCache] Cleanup on close failed:', e);
                    }
                }
            } else {
                console.log('[IndexedDBCache] Page hidden (bfcache), keeping all files');
            }
        };

        // Use pagehide instead of beforeunload for better tab close detection
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            mounted = false;
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, []);

    // Save file to cache
    const saveToCache = useCallback(async (fileId, blob, metadata = {}) => {
        if (!dbRef.current) return false;

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const fileData = {
                id: fileId,
                blob: blob,
                name: metadata.name || 'unknown',
                size: blob.size,
                type: blob.type,
                synced: metadata.synced ?? false,
                timestamp: Date.now(),
                chunks: metadata.chunks || null,
                isChunked: metadata.isChunked || false
            };

            await new Promise((resolve, reject) => {
                const request = store.put(fileData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            // Update state
            setCachedFiles(prev => {
                const newMap = new Map(prev);
                newMap.set(fileId, {
                    name: fileData.name,
                    size: fileData.size,
                    synced: fileData.synced,
                    timestamp: fileData.timestamp
                });
                return newMap;
            });

            if (!metadata.synced) {
                setPendingSyncs(prev => new Set(prev).add(fileId));
            }

            console.log('[IndexedDBCache] Saved:', metadata.name, `(${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
            return true;
        } catch (err) {
            console.error('[IndexedDBCache] Save failed:', err);
            return false;
        }
    }, []);

    // Get file from cache
    const getFromCache = useCallback(async (fileId) => {
        if (!dbRef.current) return null;

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.get(fileId);
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        console.log('[IndexedDBCache] Cache HIT:', result.name);
                        resolve(result);
                    } else {
                        console.log('[IndexedDBCache] Cache MISS:', fileId);
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error('[IndexedDBCache] Get failed:', err);
            return null;
        }
    }, []);

    // Mark file as synced (uploaded to Telegram)
    const markAsSynced = useCallback(async (fileId) => {
        if (!dbRef.current) return;

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const getRequest = store.get(fileId);
            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    data.synced = true;
                    store.put(data);

                    // Update state
                    setCachedFiles(prev => {
                        const newMap = new Map(prev);
                        const existing = newMap.get(fileId);
                        if (existing) {
                            newMap.set(fileId, { ...existing, synced: true });
                        }
                        return newMap;
                    });

                    setPendingSyncs(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(fileId);
                        return newSet;
                    });

                    console.log('[IndexedDBCache] Marked as synced:', fileId);
                }
            };
        } catch (err) {
            console.error('[IndexedDBCache] Mark synced failed:', err);
        }
    }, []);

    // Delete file from cache
    const deleteFromCache = useCallback(async (fileId) => {
        if (!dbRef.current) return;

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            await new Promise((resolve, reject) => {
                const request = store.delete(fileId);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            setCachedFiles(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });

            setPendingSyncs(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileId);
                return newSet;
            });

            console.log('[IndexedDBCache] Deleted:', fileId);
        } catch (err) {
            console.error('[IndexedDBCache] Delete failed:', err);
        }
    }, []);

    // Clear ONLY synced files (keep pending for resume on next visit)
    const clearSyncedFilesOnly = useCallback(async () => {
        if (!dbRef.current) return;

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const files = getAllRequest.result;
                let clearedCount = 0;

                files.forEach(file => {
                    if (file.synced) {
                        store.delete(file.id);
                        clearedCount++;
                    }
                });

                console.log(`[IndexedDBCache] Cleared ${clearedCount} synced files, kept ${files.length - clearedCount} pending`);
            };
        } catch (err) {
            console.error('[IndexedDBCache] Clear synced failed:', err);
        }
    }, []);

    // Get all pending (unsynced) files - METADATA ONLY (fast!)
    const getPendingFilesMetadata = useCallback(async () => {
        if (!dbRef.current) return [];

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                // Get ALL files and filter in JS (IndexedDB doesn't support boolean keys)
                const request = store.getAll();
                request.onsuccess = () => {
                    // Filter for unsynced files, return ONLY metadata (not blobs)
                    const pending = (request.result || [])
                        .filter(file => !file.synced)
                        .map(file => ({
                            id: file.id,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            synced: file.synced,
                            timestamp: file.timestamp,
                            isChunked: file.isChunked
                        }));
                    console.log(`[IndexedDBCache] Found ${pending.length} pending files (metadata only)`);
                    resolve(pending);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error('[IndexedDBCache] Get pending metadata failed:', err);
            return [];
        }
    }, []);

    // Get file blob by ID (for upload - loads full blob)
    const getFileBlob = useCallback(async (fileId) => {
        if (!dbRef.current) return null;

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.get(fileId);
                request.onsuccess = () => {
                    const file = request.result;
                    if (file && file.blob) {
                        console.log(`[IndexedDBCache] Loaded blob for: ${file.name}`);
                        resolve(file);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error('[IndexedDBCache] Get file blob failed:', err);
            return null;
        }
    }, []);

    // Get all pending files WITH blobs (for background upload)
    const getPendingFiles = useCallback(async () => {
        if (!dbRef.current) return [];

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                // Get ALL files and filter in JS (IndexedDB doesn't support boolean keys)
                const request = store.getAll();
                request.onsuccess = () => {
                    const pending = (request.result || []).filter(file => !file.synced);
                    console.log(`[IndexedDBCache] Found ${pending.length} pending files for resume`);
                    resolve(pending);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error('[IndexedDBCache] Get pending failed:', err);
            return [];
        }
    }, []);

    // Clear all cache (manual clear button)
    const clearAllCache = useCallback(() => {
        if (!dbRef.current) {
            indexedDB.deleteDatabase(DB_NAME);
            console.log('[IndexedDBCache] Database deleted');
            return;
        }

        try {
            const transaction = dbRef.current.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear();

            setCachedFiles(new Map());
            setPendingSyncs(new Set());
            console.log('[IndexedDBCache] All cache cleared');
        } catch (err) {
            console.error('[IndexedDBCache] Clear failed:', err);
            indexedDB.deleteDatabase(DB_NAME);
        }
    }, []);

    // Check if file is in cache
    const isInCache = useCallback((fileId) => {
        return cachedFiles.has(fileId);
    }, [cachedFiles]);

    // Check if file is pending sync
    const isPendingSync = useCallback((fileId) => {
        return pendingSyncs.has(fileId);
    }, [pendingSyncs]);

    // Get cache stats
    const getCacheStats = useCallback(() => {
        let totalSize = 0;
        cachedFiles.forEach(file => {
            totalSize += file.size || 0;
        });
        return {
            fileCount: cachedFiles.size,
            totalSize: totalSize,
            pendingCount: pendingSyncs.size
        };
    }, [cachedFiles, pendingSyncs]);

    return {
        isReady,
        saveToCache,
        getFromCache,
        markAsSynced,
        deleteFromCache,
        clearAllCache,
        clearSyncedFilesOnly,
        getPendingFiles,
        getPendingFilesMetadata,
        getFileBlob,
        isInCache,
        isPendingSync,
        getCacheStats,
        cachedFiles,
        pendingSyncs
    };
}

export default useIndexedDBCache;
