import { useState, useCallback } from 'react';

// Configuration
const WORKER_URL = 'https://ai-api-proxy.kulkuljujum.workers.dev';
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function useNotesStorage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [fileSizeError, setFileSizeError] = useState(null);

    /**
     * Upload a file to Telegram via Cloudflare Worker
     * @param {File} file 
     * @returns {Promise<{fileId: string, url: string} | null>}
     */
    const uploadFile = useCallback(async (file) => {
        // Reset errors
        setError(null);
        setFileSizeError(null);

        // Check file size before upload
        if (file.size > MAX_FILE_SIZE_BYTES) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(1);
            setFileSizeError(`File too large (${sizeMB}MB). Maximum allowed: ${MAX_FILE_SIZE_MB}MB`);
            return null;
        }

        setIsUploading(true);
        setUploadProgress(10); // Start

        try {
            // 1. Prepare Form Data
            const formData = new FormData();
            formData.append('document', file);

            // 2. Upload to Cloudflare Worker
            // We use the Worker as a proxy to bypass Vercel's 4.5MB limit
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'X-Provider': 'telegram-upload'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }

            setUploadProgress(100);

            const data = await response.json();

            if (!data.success || !data.fileId) {
                throw new Error('Invalid response from upload server');
            }

            // 3. Construct View URL (Proxied via Vercel for security)
            // We use Vercel to view because it doesn't have the upload body limit for GET requests
            const viewUrl = `/api/storage/telegram-proxy?fileId=${data.fileId}`;

            return {
                id: data.fileId,
                fileId: data.fileId,
                downloadUrl: viewUrl, // For compatibility with existing UI
                name: file.name,
                size: file.size,
                type: file.type
            };

        } catch (err) {
            console.error('[useNotesStorage] Upload Error:', err);
            setError(err.message || 'Failed to upload file');
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);

    const clearFileSizeError = useCallback(() => {
        setFileSizeError(null);
    }, []);

    return {
        uploadFile,
        isUploading,
        uploadProgress,
        error,
        fileSizeError,
        clearFileSizeError,
        MAX_FILE_SIZE_MB
    };
}

