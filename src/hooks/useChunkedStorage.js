import { useState, useCallback, useRef } from 'react';

// Configuration
const WORKER_URL = 'https://ai-api-proxy.kulkuljujum.workers.dev';
const DIRECT_UPLOAD_LIMIT = 20 * 1024 * 1024; // 20MB - Telegram getFile limit

// Adaptive chunk strategy based on file size
// IMPORTANT: Chunks MUST be under 20MB due to Telegram Bot API getFile limit
// OPTIMIZED: Increased parallelism for faster uploads
function getChunkConfig(fileSize) {
    if (fileSize < DIRECT_UPLOAD_LIMIT) {
        return { chunkSize: fileSize, parallel: 1, strategy: 'direct' };
    } else if (fileSize < 60 * 1024 * 1024) {
        // 20MB - 60MB: 19MB chunks, ALL parallel (max 3-4 chunks)
        // This covers most common large files (50MB PDFs)
        return { chunkSize: 19 * 1024 * 1024, parallel: 6, strategy: 'chunked' };
    } else if (fileSize < 200 * 1024 * 1024) {
        // 60MB - 200MB: 19MB chunks, 6 parallel
        return { chunkSize: 19 * 1024 * 1024, parallel: 6, strategy: 'chunked' };
    } else if (fileSize < 1024 * 1024 * 1024) {
        // 200MB - 1GB: 18MB chunks, 8 parallel
        return { chunkSize: 18 * 1024 * 1024, parallel: 8, strategy: 'chunked' };
    } else {
        // > 1GB: 17MB chunks, 10 parallel
        return { chunkSize: 17 * 1024 * 1024, parallel: 10, strategy: 'chunked' };
    }
}

export function useChunkedStorage() {
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    // Detailed upload tracking state
    const [uploadDetails, setUploadDetails] = useState({
        fileName: '',
        fileSize: 0,
        strategy: 'direct', // 'direct' or 'chunked'
        totalChunks: 0,
        chunksProgress: [], // Array of { index, percent, bytesUploaded, bytesTotal }
        bytesUploaded: 0,
        uploadSpeed: 0, // bytes per second
        eta: 0, // seconds remaining
        startTime: null,
        currentChunkIndex: -1
    });

    // Refs for tracking speed calculation
    const speedTrackingRef = useRef({ lastBytes: 0, lastTime: 0 });

    /**
     * Upload a file (handles both direct and chunked uploads)
     */
    const uploadFile = useCallback(async (file, onProgress) => {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);
        abortControllerRef.current = new AbortController();

        // Initialize upload details
        const startTime = Date.now();
        speedTrackingRef.current = { lastBytes: 0, lastTime: startTime };

        const config = getChunkConfig(file.size);
        const isChunked = config.strategy !== 'direct';
        const totalChunks = isChunked ? Math.ceil(file.size / config.chunkSize) : 1;

        // Initialize chunk progress array
        const initialChunksProgress = Array.from({ length: totalChunks }, (_, i) => ({
            index: i,
            percent: 0,
            bytesUploaded: 0,
            bytesTotal: isChunked ? Math.min(config.chunkSize, file.size - i * config.chunkSize) : file.size,
            status: 'pending' // 'pending', 'uploading', 'completed', 'failed'
        }));

        setUploadDetails({
            fileName: file.name,
            fileSize: file.size,
            strategy: isChunked ? 'chunked' : 'direct',
            totalChunks,
            chunksProgress: initialChunksProgress,
            bytesUploaded: 0,
            uploadSpeed: 0,
            eta: 0,
            startTime,
            currentChunkIndex: 0
        });

        // Helper to calculate speed and ETA
        const updateSpeedAndEta = (bytesUploaded) => {
            const now = Date.now();
            const timeDelta = (now - speedTrackingRef.current.lastTime) / 1000; // seconds

            if (timeDelta >= 0.5) { // Update speed every 0.5 seconds
                const bytesDelta = bytesUploaded - speedTrackingRef.current.lastBytes;
                const speed = timeDelta > 0 ? bytesDelta / timeDelta : 0;
                const remainingBytes = file.size - bytesUploaded;
                const eta = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;

                speedTrackingRef.current = { lastBytes: bytesUploaded, lastTime: now };

                return { uploadSpeed: speed, eta };
            }
            return null;
        };

        try {
            console.log(`[ChunkedStorage] Upload strategy: ${config.strategy}, File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

            if (config.strategy === 'direct') {
                // Direct upload for files under 20MB - with real-time progress
                const result = await uploadDirect(file, abortControllerRef.current.signal, (percent) => {
                    const bytesUploaded = Math.round((percent / 100) * file.size);
                    setUploadProgress(percent);
                    onProgress?.(percent);

                    // Update details with speed/ETA
                    const speedData = updateSpeedAndEta(bytesUploaded);
                    setUploadDetails(prev => ({
                        ...prev,
                        bytesUploaded,
                        currentChunkIndex: 0,
                        chunksProgress: [{
                            ...prev.chunksProgress[0],
                            percent,
                            bytesUploaded,
                            status: percent === 100 ? 'completed' : 'uploading'
                        }],
                        ...(speedData || {})
                    }));
                });

                // Mark complete
                setUploadProgress(100);
                setUploadDetails(prev => ({
                    ...prev,
                    bytesUploaded: file.size,
                    uploadSpeed: 0,
                    eta: 0,
                    chunksProgress: [{ ...prev.chunksProgress[0], percent: 100, bytesUploaded: file.size, status: 'completed' }]
                }));
                return result;
            }

            // Chunked upload for larger files
            const chunks = splitFileIntoChunks(file, config.chunkSize);
            console.log(`[ChunkedStorage] Split into ${chunks.length} chunks of ~${(config.chunkSize / 1024 / 1024).toFixed(0)}MB`);

            const chunkIds = [];

            // Track progress per chunk for smooth overall progress
            const chunkProgress = new Array(chunks.length).fill(0);

            const updateOverallProgress = () => {
                const totalProgress = chunkProgress.reduce((sum, p) => sum + p, 0);
                const overallPercent = Math.round(totalProgress / chunks.length);
                setUploadProgress(overallPercent);
                onProgress?.(overallPercent);

                // Calculate total bytes uploaded from all chunks
                const totalBytesUploaded = chunkProgress.reduce((sum, p, idx) => {
                    const chunkSize = initialChunksProgress[idx]?.bytesTotal || 0;
                    return sum + Math.round((p / 100) * chunkSize);
                }, 0);

                // Update speed and ETA
                const speedData = updateSpeedAndEta(totalBytesUploaded);

                // Update chunksProgress state with current values
                const updatedChunksProgress = initialChunksProgress.map((chunk, idx) => {
                    const percent = chunkProgress[idx] || 0;
                    const bytesUploaded = Math.round((percent / 100) * chunk.bytesTotal);
                    return {
                        ...chunk,
                        percent,
                        bytesUploaded,
                        status: percent === 100 ? 'completed' : (percent > 0 ? 'uploading' : 'pending')
                    };
                });

                setUploadDetails(prev => ({
                    ...prev,
                    bytesUploaded: totalBytesUploaded,
                    chunksProgress: updatedChunksProgress,
                    ...(speedData || {})
                }));
            };

            // Upload chunks in parallel batches
            for (let i = 0; i < chunks.length; i += config.parallel) {
                const batch = chunks.slice(i, i + config.parallel);

                // Mark current batch as uploading
                setUploadDetails(prev => ({
                    ...prev,
                    currentChunkIndex: i
                }));

                const batchResults = await Promise.all(
                    batch.map(async (chunk, batchIndex) => {
                        const chunkIndex = i + batchIndex;
                        const chunkFile = new File([chunk], `${file.name}.part${chunkIndex}`, { type: file.type });

                        // Per-chunk progress callback
                        const result = await uploadDirect(chunkFile, abortControllerRef.current.signal, (percent) => {
                            chunkProgress[chunkIndex] = percent;
                            updateOverallProgress();
                        });

                        // Mark chunk as 100% complete
                        chunkProgress[chunkIndex] = 100;
                        updateOverallProgress();

                        return { index: chunkIndex, fileId: result.fileId };
                    })
                );

                chunkIds.push(...batchResults);
            }

            // Sort by index to ensure correct order
            chunkIds.sort((a, b) => a.index - b.index);

            // Return metadata about the chunked file
            const metadata = {
                fileId: `chunked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                isChunked: true,
                chunks: chunkIds.map(c => c.fileId),
                totalSize: file.size,
                fileName: file.name,
                mimeType: file.type,
                chunkCount: chunks.length
            };

            console.log(`[ChunkedStorage] Upload complete:`, metadata);
            setUploadProgress(100);

            // Mark all complete in details
            setUploadDetails(prev => ({
                ...prev,
                bytesUploaded: file.size,
                uploadSpeed: 0,
                eta: 0,
                chunksProgress: prev.chunksProgress.map(c => ({ ...c, percent: 100, status: 'completed' }))
            }));

            return metadata;

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('[ChunkedStorage] Upload cancelled');
                setError('Upload cancelled');
            } else {
                console.error('[ChunkedStorage] Upload error:', err);
                setError(err.message || 'Upload failed');
            }
            return null;
        } finally {
            setIsUploading(false);
        }
    }, []);

    /**
     * Download a file (handles both direct and chunked downloads)
     */
    const downloadFile = useCallback(async (fileMetadata, onProgress) => {
        setIsDownloading(true);
        setDownloadProgress(0);
        setError(null);
        abortControllerRef.current = new AbortController();

        try {
            // Check if it's a chunked file
            if (fileMetadata.isChunked && fileMetadata.chunks) {
                console.log(`[ChunkedStorage] Downloading ${fileMetadata.chunks.length} chunks for ${fileMetadata.fileName}`);

                const config = getChunkConfig(fileMetadata.totalSize);
                const chunkBuffers = new Array(fileMetadata.chunks.length);
                let completedChunks = 0;

                // Download chunks in parallel batches
                for (let i = 0; i < fileMetadata.chunks.length; i += config.parallel) {
                    const batch = fileMetadata.chunks.slice(i, i + config.parallel);
                    console.log(`[ChunkedStorage] Downloading batch ${Math.floor(i / config.parallel) + 1}, chunks: ${batch.length}`);

                    await Promise.all(
                        batch.map(async (chunkFileId, batchIndex) => {
                            const chunkIndex = i + batchIndex;
                            const buffer = await downloadChunk(chunkFileId, abortControllerRef.current.signal);
                            chunkBuffers[chunkIndex] = buffer;

                            completedChunks++;
                            const progress = Math.round((completedChunks / fileMetadata.chunks.length) * 100);
                            console.log(`[ChunkedStorage] Progress: ${progress}% (${completedChunks}/${fileMetadata.chunks.length})`);
                            setDownloadProgress(progress);
                            onProgress?.(progress);
                        })
                    );
                }

                // Reassemble the file
                console.log('[ChunkedStorage] Reassembling file...');
                const blob = new Blob(chunkBuffers, { type: fileMetadata.mimeType });
                const url = URL.createObjectURL(blob);

                setDownloadProgress(100);
                return { url, blob, fileName: fileMetadata.fileName };

            } else {
                // Direct download for single file
                const buffer = await downloadChunk(fileMetadata.fileId, abortControllerRef.current.signal);
                const blob = new Blob([buffer], { type: fileMetadata.mimeType || 'application/octet-stream' });
                const url = URL.createObjectURL(blob);

                setDownloadProgress(100);
                return { url, blob, fileName: fileMetadata.fileName };
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('[ChunkedStorage] Download cancelled');
                setError('Download cancelled');
            } else {
                console.error('[ChunkedStorage] Download error:', err);
                setError(err.message || 'Download failed');
            }
            return null;
        } finally {
            setIsDownloading(false);
        }
    }, []);

    /**
     * Cancel ongoing upload/download
     */
    const cancel = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    return {
        uploadFile,
        downloadFile,
        cancel,
        isUploading,
        isDownloading,
        uploadProgress,
        downloadProgress,
        uploadDetails,
        error
    };
}

// Helper: Split file into chunks
function splitFileIntoChunks(file, chunkSize) {
    const chunks = [];
    let offset = 0;

    while (offset < file.size) {
        const end = Math.min(offset + chunkSize, file.size);
        chunks.push(file.slice(offset, end));
        offset = end;
    }

    return chunks;
}

// Helper: Upload a single file/chunk to Telegram with REAL progress
async function uploadDirect(file, signal, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('document', file);

        // Real-time upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success && data.fileId) {
                        resolve({
                            fileId: data.fileId,
                            downloadUrl: `/api/storage/telegram-proxy?fileId=${data.fileId}`
                        });
                    } else {
                        reject(new Error('Invalid upload response'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload aborted'));

        // Handle abort signal
        if (signal) {
            signal.addEventListener('abort', () => xhr.abort());
        }

        xhr.open('POST', WORKER_URL);
        xhr.setRequestHeader('X-Provider', 'telegram-upload');
        xhr.send(formData);
    });
}

// Helper: Download a single chunk from Telegram with logging
async function downloadChunk(fileId, signal, retries = 3) {
    const url = `/api/storage/telegram-proxy?fileId=${fileId}`;
    console.log(`[ChunkedStorage] Fetching chunk: ${fileId.substring(0, 20)}...`);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, { signal });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error(`[ChunkedStorage] Chunk download failed (${response.status}):`, errorText);
                throw new Error(`Chunk download failed: ${response.status} - ${errorText}`);
            }

            const buffer = await response.arrayBuffer();
            console.log(`[ChunkedStorage] Chunk downloaded: ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB`);
            return buffer;

        } catch (err) {
            if (err.name === 'AbortError') throw err;

            console.warn(`[ChunkedStorage] Download attempt ${attempt}/${retries} failed:`, err.message);

            if (attempt === retries) {
                throw new Error(`Failed after ${retries} attempts: ${err.message}`);
            }

            // Wait before retry (exponential backoff)
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}
