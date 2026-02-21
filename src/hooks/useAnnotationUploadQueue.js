import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotesStore } from '../store/notesStore';

const STORAGE_KEY = 'annotation-upload-queue';
const WORKER_URL = 'https://ai-api-proxy.kulkuljujum.workers.dev';

/**
 * Converts a Base64 data URL to a File object.
 */
function dataUrlToFile(dataUrl, filename = 'annotated-image.webp') {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
        throw new Error('Provided string is not a valid base64 data URL');
    }
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/webp';
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new File([array], filename, { type: mime });
}

/**
 * Upload a File to Telegram via the Cloudflare Worker proxy.
 * Returns { fileId, proxyUrl } on success.
 */
async function uploadToTelegram(file) {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'X-Provider': 'telegram-upload' },
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.fileId) {
        throw new Error('Invalid response from upload server');
    }

    const proxyUrl = `/api/storage/telegram-proxy?fileId=${data.fileId}`;
    return { fileId: data.fileId, proxyUrl };
}

/**
 * Read the pending queue from localStorage.
 */
function readQueue() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Write the pending queue to localStorage.
 */
function writeQueue(queue) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Hook: useAnnotationUploadQueue
 *
 * Provides:
 * - uploadAnnotation(noteId, oldImageObj, base64DataUrl) — uploads to Telegram, falls back to localStorage queue
 * - isUploading — boolean
 * - pendingCount — number of queued items awaiting retry
 */
export function useAnnotationUploadQueue() {
    const [isUploading, setIsUploading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const retryingRef = useRef(false);

    const updateNoteImage = useNotesStore(s => s.updateNoteImage);

    // Count pending items on mount
    useEffect(() => {
        setPendingCount(readQueue().length);
    }, []);

    /**
     * Upload an annotated image to Telegram.
     * On failure, queues it in localStorage for later retry.
     */
    const uploadAnnotation = useCallback(async (noteId, oldImageObj, base64DataUrl) => {
        setIsUploading(true);

        // Pre-validate that we have an actual base64 image and not a fallback HTTP url due to CORS
        if (!base64DataUrl || !base64DataUrl.startsWith('data:')) {
            console.error('[AnnotationQueue] Cannot upload. The provided string is not a valid base64 image (likely a CORS failure fallback).');
            setIsUploading(false);
            return { success: false, error: 'Not a valid base64 image' };
        }

        try {
            const file = dataUrlToFile(base64DataUrl, `annotation-${Date.now()}.webp`);
            const { proxyUrl } = await uploadToTelegram(file);

            // Success → update the note's image array with the Telegram proxy URL
            await updateNoteImage(noteId, oldImageObj, proxyUrl);

            // Fully clear the queue from localStorage on success
            localStorage.removeItem(STORAGE_KEY);
            setPendingCount(0);

            return { success: true, url: proxyUrl };
        } catch (err) {
            console.error('[AnnotationQueue] Upload failed, queuing for retry:', err.message);

            // Queue in localStorage
            const queue = readQueue();
            queue.push({
                noteId,
                oldImageUrl: typeof oldImageObj === 'string' ? oldImageObj : oldImageObj?.url,
                base64DataUrl,
                timestamp: Date.now(),
            });
            writeQueue(queue);
            setPendingCount(queue.length);

            // Still update the note with the base64 as a temporary fallback so the UI shows the drawing
            await updateNoteImage(noteId, oldImageObj, base64DataUrl);

            return { success: false, error: err.message, queued: true };
        } finally {
            setIsUploading(false);
        }
    }, [updateNoteImage]);

    /**
     * Retry all pending uploads from the queue.
     * Called automatically on mount and can be called manually.
     */
    const retryPending = useCallback(async () => {
        if (retryingRef.current) return;
        retryingRef.current = true;

        const queue = readQueue();
        if (queue.length === 0) {
            retryingRef.current = false;
            return;
        }

        console.log(`[AnnotationQueue] Retrying ${queue.length} pending uploads...`);

        const remaining = [];

        for (const item of queue) {
            // Clean up invalid records silently
            if (!item.base64DataUrl || !item.base64DataUrl.startsWith('data:')) {
                console.warn(`[AnnotationQueue] Removing invalid non-base64 queue item for note ${item.noteId}`);
                continue; // Do not push to remaining
            }

            try {
                const file = dataUrlToFile(item.base64DataUrl, `annotation-retry-${Date.now()}.webp`);
                const { proxyUrl } = await uploadToTelegram(file);

                // Update the note: replace the base64 string with the Telegram URL
                const note = useNotesStore.getState().notes.find(n => n.id === item.noteId);
                if (note) {
                    await updateNoteImage(item.noteId, { url: item.base64DataUrl }, proxyUrl);
                }

                console.log(`[AnnotationQueue] Retry succeeded for note ${item.noteId}`);
            } catch (err) {
                console.warn(`[AnnotationQueue] Retry failed for note ${item.noteId}:`, err.message);
                remaining.push(item);
            }
        }

        if (remaining.length === 0) {
            // All uploads succeeded — fully clear localStorage
            localStorage.removeItem(STORAGE_KEY);
        } else {
            writeQueue(remaining);
        }
        setPendingCount(remaining.length);
        retryingRef.current = false;
    }, [updateNoteImage]);

    // Auto-retry on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            retryPending();
        }, 5000); // Wait 5s after app load before retrying

        return () => clearTimeout(timer);
    }, [retryPending]);

    return {
        uploadAnnotation,
        retryPending,
        isUploading,
        pendingCount,
    };
}
