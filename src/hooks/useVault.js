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
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
};

export function useVault() {
    // All useState hooks first (consistent order)
    const [files, setFiles] = useState([]);
    const [trashFiles, setTrashFiles] = useState([]);
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

            await storage.ready;
            megaStorageRef.current = storage;
            setMegaConnected(true);

            // Get storage quota from MEGA using getAccountInfo
            try {
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

    // Fetch active files from database
    const fetchFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE}/api/vault/list`);
            const data = await response.json();

            if (data.success) {
                setFiles(data.files);
            }
        } catch (err) {
            console.error('Fetch files error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch trash files
    const fetchTrash = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/vault/trash`);
            const data = await response.json();

            if (data.success) {
                setTrashFiles(data.files);
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
        initMega();
    }, [fetchFiles, fetchTrash, initMega]);

    // Upload file to MEGA
    const uploadFile = useCallback(async (file) => {
        if (!megaStorageRef.current) {
            setError('MEGA not connected. Please wait or refresh.');
            return null;
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF files are allowed');
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

            setFiles(prev => [newFile, ...prev]);
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
                setFiles(prev => prev.filter(f => f.id !== fileId));
                setTrashFiles(prev => [{ ...movedFile, deletedAt: new Date().toISOString(), daysRemaining: 10 }, ...prev]);
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

            const restoredFile = trashFiles.find(f => f.id === fileId);
            if (restoredFile) {
                setTrashFiles(prev => prev.filter(f => f.id !== fileId));
                const { deletedAt, daysRemaining, ...cleanFile } = restoredFile;
                setFiles(prev => [cleanFile, ...prev]);
            }
            return true;
        } catch (err) {
            console.error('Restore error:', err);
            setError('Failed to restore file');
            return false;
        }
    }, [trashFiles]);

    // Permanently delete file (from database AND MEGA)
    const permanentDelete = useCallback(async (fileId) => {
        try {
            // Get the file info before deleting (need megaNodeId for MEGA deletion)
            const fileToDelete = trashFiles.find(f => f.id === fileId);

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

            setTrashFiles(prev => prev.filter(f => f.id !== fileId));

            if (fileToDelete) {
                setStorageInfo(prev => ({ ...prev, used: Math.max(0, prev.used - fileToDelete.size) }));
            }
            return true;
        } catch (err) {
            console.error('Permanent delete error:', err);
            setError('Failed to permanently delete');
            return false;
        }
    }, [trashFiles]);

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

    return {
        files,
        trashFiles,
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
        permanentDelete,
        viewPdf,
        closePdfViewer,
        downloadFile,
        refreshFiles: fetchFiles,
        refreshTrash: fetchTrash,
        clearError: useCallback(() => setError(null), [])
    };
}

export default useVault;
