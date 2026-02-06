/**
 * useVault Hook - Vault State Management with Trash System
 * 
 * Handles:
 * - MEGA connection and authentication
 * - Client-side file uploads to MEGA
 * - File list management (from database)
 * - Trash with 10-day retention
 * - Restore and permanent delete
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useVaultStore } from '../store/vaultStore';

// API base URL - works for both local dev and Vercel
const API_BASE = '';

// Helper to format bytes to human-readable size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Helper to format relative time
export const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
};

export function useVault() {
    // All useState hooks first (consistent order)
    // Global State from Store
    const files = useVaultStore(state => state.files);
    const folders = useVaultStore(state => state.folders);
    const { setInitialData, addFile: addFileToStore, removeFile: removeFileFromStore, moveFiles: moveFilesInStore, addFolder, removeFolder } = useVaultStore();

    // Local State
    // const [files, setFiles] = useState([]); // Replaced by store
    const [localTrashFiles, setLocalTrashFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [megaConnected, setMegaConnected] = useState(false);
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 20 * 1024 * 1024 * 1024 });
    const [viewingPdf, setViewingPdf] = useState(null); // Currently viewing PDF

    // useRef
    const megaStorageRef = useRef(null);
    const initStartedRef = useRef(false);
    const pdfCacheRef = useRef(new Map()); // Cache downloaded PDFs: fileId -> blobUrl
    const verificationCacheRef = useRef(new Map()); // Cache verification results: url -> boolean

    // Initialize MEGA connection
    const initMega = useCallback(async () => {
        try {
            const email = import.meta.env.VITE_MEGA_EMAIL;
            const password = import.meta.env.VITE_MEGA_PASSWORD;

            if (!email || !password) {
                console.warn('MEGA credentials not configured');
                return;
            }

            const mega = await import('megajs');
            const { Storage } = mega;

            const storage = new Storage({
                email,
                password,
                userAgent: 'StudyDash/1.0'
            });

            // Timeout after 5 seconds to prevent hanging
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('MEGA_CONNECTION_TIMEOUT')), 5000));

            try {
                await Promise.race([storage.ready, timeoutPromise]);
                megaStorageRef.current = storage;
                setMegaConnected(true);
            } catch (error) {
                console.warn('MEGA initialization timed out or failed (Account likely blocked). Continuing without MEGA.', error);
                setMegaConnected(false);
                return; // Exit early to avoid further errors
            }

            // Get storage quota from MEGA using getAccountInfo
            try {
                if (megaStorageRef.current) {
                    const accountInfo = await storage.getAccountInfo();
                    const spaceUsed = accountInfo.spaceUsed || 0;
                    const spaceLimit = accountInfo.spaceLimit || 20 * 1024 * 1024 * 1024; // 20GB free default

                    console.log('MEGA Storage:', {
                        used: (spaceUsed / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                        total: (spaceLimit / 1024 / 1024 / 1024).toFixed(2) + ' GB'
                    });

                    setStorageInfo({
                        used: spaceUsed,
                        total: spaceLimit
                    });
                }
            } catch (quotaErr) {
                console.warn('Could not fetch MEGA quota:', quotaErr);
                // Fallback: estimate from storage object
                setStorageInfo({
                    used: storage.spaceUsed || 0,
                    total: storage.spaceLimit || 20 * 1024 * 1024 * 1024
                });
            }

            console.log('✓ MEGA connected successfully');
        } catch (err) {
            console.error('MEGA connection failed:', err);
            setMegaConnected(false);
        }
    }, []);

    // Fetch active files and folders
    const fetchFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE}/api/vault/list`);
            const data = await response.json();

            if (data.success) {
                // Sync to global store
                setInitialData({
                    files: data.files,
                    folders: data.folders || []
                });
            }
        } catch (err) {
            console.error('Fetch files error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [setInitialData]);

    // Fetch trash files
    const fetchTrash = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/vault/trash`);
            const data = await response.json();

            if (data.success) {
                setLocalTrashFiles(data.files);
            }
        } catch (err) {
            console.error('Fetch trash error:', err);
        }
    }, []);

    // useEffect after all useCallback definitions
    useEffect(() => {
        if (initStartedRef.current) return;
        initStartedRef.current = true;

        fetchFiles();
        fetchTrash();

        // Telegram storage is always available (no login required)
        // Set connected immediately for UI status
        setMegaConnected(true);

        // MEGA DISABLED - account is blocked and causes app freeze.
        // Using Telegram storage via useChunkedStorage hook instead.
        // initMega();
    }, [fetchFiles, fetchTrash]);

    // Upload file to MEGA
    const uploadFile = useCallback(async (file) => {
        if (!megaStorageRef.current) {
            setError('MEGA not connected. Please wait or refresh.');
            return null;
        }

        const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
        const isAllowed = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isAllowed) {
            setError('Only PDF and image files (PNG, JPG, JPEG, WEBP) are allowed');
            return null;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError(null);

            const arrayBuffer = await file.arrayBuffer();
            const storage = megaStorageRef.current;

            // Create upload with progress tracking
            const uploadStream = storage.upload({
                name: file.name,
                size: file.size,
            }, new Uint8Array(arrayBuffer));

            // Track upload progress
            uploadStream.on('progress', (info) => {
                const progress = Math.round((info.bytesLoaded / info.bytesTotal) * 100);
                setUploadProgress(progress);
            });

            // Wait for upload to complete
            const uploadedFile = await uploadStream.complete;

            setUploadProgress(100);

            const downloadUrl = await uploadedFile.link();
            const fileId = crypto.randomUUID();

            const saveResponse = await fetch(`${API_BASE}/api/vault/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: fileId,
                    filename: file.name,
                    sizeBytes: file.size,
                    megaNodeId: uploadedFile.nodeId,
                    downloadUrl
                })
            });

            const saveData = await saveResponse.json();

            if (!saveData.success) {
                throw new Error(saveData.error || 'Failed to save metadata');
            }

            const newFile = {
                id: fileId,
                name: file.name,
                size: file.size,
                megaNodeId: uploadedFile.nodeId,
                downloadUrl,
                createdAt: new Date().toISOString()
            };



            addFileToStore(newFile);
            setStorageInfo(prev => ({ ...prev, used: prev.used + file.size }));

            return newFile;
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed: ' + err.message);
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);

    // Move file to trash
    const moveToTrash = useCallback(async (fileId) => {
        try {
            const response = await fetch(`${API_BASE}/api/vault/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: fileId })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const movedFile = files.find(f => f.id === fileId);
            if (movedFile) {
                removeFileFromStore(fileId);
                setLocalTrashFiles(prev => [{ ...movedFile, deletedAt: new Date().toISOString(), daysRemaining: 10 }, ...prev]);
            }
            return true;
        } catch (err) {
            console.error('Move to trash error:', err);
            setError('Failed to move to trash');
            return false;
        }
    }, [files]);

    // Restore file from trash
    const restoreFile = useCallback(async (fileId) => {
        try {
            const response = await fetch(`${API_BASE}/api/vault/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: fileId })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const restoredFile = localTrashFiles.find(f => f.id === fileId);
            if (restoredFile) {
                setLocalTrashFiles(prev => prev.filter(f => f.id !== fileId));
                const { deletedAt, daysRemaining, ...cleanFile } = restoredFile;
                addFileToStore(cleanFile);
            }
            return true;
        } catch (err) {
            console.error('Restore error:', err);
            setError('Failed to restore file');
            return false;
        }
    }, [localTrashFiles]);

    // Permanently delete file (from database AND MEGA)
    const permanentDelete = useCallback(async (fileId) => {
        try {
            // Get the file info before deleting (need megaNodeId for MEGA deletion)
            const fileToDelete = localTrashFiles.find(f => f.id === fileId);

            // Delete from database first
            const response = await fetch(`${API_BASE}/api/vault/permanent-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: fileId })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            // Try to delete from MEGA if we have storage connection and nodeId
            if (fileToDelete?.megaNodeId && megaStorageRef.current) {
                try {
                    const storage = megaStorageRef.current;

                    // Find the file in storage by iterating all files
                    // MEGA files are stored in storage.files and storage.root.children
                    let megaFile = null;

                    // Check if storage.files is a Map/Object with nodeId keys
                    if (storage.files && storage.files[fileToDelete.megaNodeId]) {
                        megaFile = storage.files[fileToDelete.megaNodeId];
                    }

                    // Alternative: Search through root folder
                    if (!megaFile && storage.root && storage.root.children) {
                        megaFile = storage.root.children.find(f =>
                            f.nodeId === fileToDelete.megaNodeId ||
                            f.name === fileToDelete.name
                        );
                    }

                    if (megaFile && typeof megaFile.delete === 'function') {
                        await megaFile.delete(true); // true = permanent delete
                        console.log('✓ Deleted from MEGA:', fileToDelete.name);
                    } else {
                        console.warn('MEGA file not found in storage, may already be deleted');
                    }
                } catch (megaErr) {
                    // MEGA deletion failed - file may not be ours or already deleted
                    console.warn('MEGA deletion failed:', megaErr.message);
                }
            }

            setLocalTrashFiles(prev => prev.filter(f => f.id !== fileId));

            if (fileToDelete) {
                setStorageInfo(prev => ({ ...prev, used: Math.max(0, prev.used - fileToDelete.size) }));
            }
            return true;
        } catch (err) {
            console.error('Permanent delete error:', err);
            setError('Failed to permanently delete');
            return false;
        }
    }, [localTrashFiles]);

    // View PDF in modal (uses Google Docs viewer)
    const viewPdf = useCallback((file) => {
        if (file.downloadUrl) {
            setViewingPdf(file);
        } else {
            setError('PDF URL not available');
        }
    }, []);

    // Close PDF viewer
    const closePdfViewer = useCallback(() => {
        setViewingPdf(null);
    }, []);

    // Download file (opens in new tab)
    const downloadFile = useCallback((file) => {
        if (file.downloadUrl) {
            window.open(file.downloadUrl, '_blank');
        } else {
            setError('Download URL not available');
        }
    }, []);

    // Folder Management
    const createFolder = useCallback(async (name, parentId = null) => {
        try {
            const response = await fetch(`${API_BASE}/api/vault/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'create', name, parentId })
            });
            const data = await response.json();
            if (data.success) {
                addFolder(data.folder);
                return data.folder;
            }
        } catch (err) {
            console.error('Create folder error:', err);
            setError('Failed to create folder');
        }
        return null;
    }, [addFolder]);

    const deleteFolder = useCallback(async (folderId) => {
        try {
            const response = await fetch(`${API_BASE}/api/vault/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'delete', id: folderId })
            });
            const data = await response.json();
            if (data.success) {
                removeFolder(folderId);
                return true;
            }
        } catch (err) {
            console.error('Delete folder error:', err);
            setError('Failed to delete folder');
        }
        return false;
    }, [removeFolder]);

    const moveFile = useCallback(async (fileId, folderId) => {
        try {
            // Optimistic update
            moveFilesInStore([fileId], folderId);

            const response = await fetch(`${API_BASE}/api/vault/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, folderId })
            });
            const data = await response.json();
            if (!data.success) {
                // Revert if failed? (TODO: Implement revert strategy)
                console.error('Move failed on server');
                fetchFiles(); // Refetch to correct state
                return false;
            }
            return true;
        } catch (err) {
            console.error('Move file error:', err);
            fetchFiles();
            return false;
        }
    }, [moveFilesInStore, fetchFiles]);

    // Resolve MEGA links to direct blob URLs
    const resolveMediaUrl = useCallback(async (url) => {
        if (!url) return null;
        if (!url.includes('mega.nz')) return url;

        // Check cache
        if (pdfCacheRef.current.has(url)) {
            return pdfCacheRef.current.get(url);
        }

        try {
            const mega = await import('megajs');
            const file = mega.File.fromURL(url);
            await file.loadAttributes();

            const buffer = await file.downloadBuffer();
            // Try to detect type from name or default to image/png
            const extension = file.name.split('.').pop().toLowerCase();
            const mimeType = extension === 'pdf' ? 'application/pdf' : `image/${extension === 'jpg' ? 'jpeg' : extension}`;

            const blob = new Blob([buffer], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);

            pdfCacheRef.current.set(url, blobUrl);
            return blobUrl;
        } catch (err) {
            console.warn('MEGA Resolve Error:', err.message);
            // If the error indicates the file is gone, let the caller know
            if (err.message.includes('NOTFOUND') || err.message.includes('invalid') || err.message.includes('ENOENT')) {
                throw new Error('MEGA_FILE_GONE');
            }
            return url; // Return original if fails
        }
    }, [files]); // Added files to dependency for deletion logic

    // Delete a MEGA file by its public link using server-side API
    const deleteFileByUrl = useCallback(async (url) => {
        if (!url || !url.includes('mega.nz')) return false;

        try {
            console.log('[useVault] Requesting server to delete MEGA file:', url);
            const response = await fetch(`${API_BASE}/api/vault/delete-by-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (data.success) {
                console.log('[useVault] ✓ Server deleted file from MEGA');
                // Optmistically remove from local state if it was there
                const target = files.find(f => f.downloadUrl === url);
                if (target) {
                    removeFileFromStore(target.id);
                }
                return true;
            } else {
                console.warn('[useVault] Server deletion failed:', data.error);
                return false;
            }
        } catch (err) {
            console.error('[useVault] Delete MEGA file error:', err);
            return false;
        }
    }, [files, removeFileFromStore]);

    // ... existing functions ...

    // Check if a MEGA file still exists (lightweight check with session caching)
    const verifyFileExists = useCallback(async (url) => {
        if (!url || !url.includes('mega.nz')) return true;

        // Check cache first
        if (verificationCacheRef.current.has(url)) {
            return verificationCacheRef.current.get(url);
        }

        try {
            const mega = await import('megajs');
            const file = mega.File.fromURL(url);
            await file.loadAttributes();
            verificationCacheRef.current.set(url, true);
            return true;
        } catch (err) {
            if (err.message.includes('NOTFOUND') || err.message.includes('invalid') || err.message.includes('ENOENT')) {
                verificationCacheRef.current.set(url, false);
                return false;
            }
            return true; // If it's a transient error, assume it exists but don't cache
        }
    }, []);

    return {
        files,
        trashFiles: localTrashFiles,
        isLoading,
        isUploading,
        uploadProgress,
        error,
        megaConnected,
        storageInfo,
        viewingPdf,
        pdfCache: pdfCacheRef.current, // Session cache for downloaded PDFs
        uploadFile,
        moveToTrash,
        restoreFile,
        folders,
        createFolder,
        deleteFolder,
        moveFile,
        permanentDelete,
        viewPdf,
        closePdfViewer,
        downloadFile,
        refreshFiles: fetchFiles,
        refreshTrash: fetchTrash,
        resolveMediaUrl,
        deleteFileByUrl,
        verifyFileExists,
        clearError: useCallback(() => setError(null), [])
    };
}

export default useVault;
