/**
 * PdfViewerModal - Premium In-App PDF Viewer
 * 
 * Uses react-pdf for local PDF rendering
 * Downloads PDF from MEGA first, then renders locally
 * 
 * Features:
 * - Page navigation (prev/next, page jump)
 * - Zoom controls (fit width, zoom in/out)
 * - Loading progress indicator
 * - Keyboard shortcuts (arrows, +/-, Escape)
 * - Premium glassmorphic design
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    FileText,
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Loader2,
    AlertCircle,
    Download
} from 'lucide-react';
import { formatFileSize } from '../../hooks/useVault';

// Import react-pdf CSS for annotations
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Loading indicator component
const LoadingIndicator = ({ progress, message }) => (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
                <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                />
                <motion.circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={226}
                    initial={{ strokeDashoffset: 226 }}
                    animate={{ strokeDashoffset: 226 - (226 * (progress || 0) / 100) }}
                    transition={{ duration: 0.3 }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{Math.round(progress || 0)}%</span>
            </div>
        </div>
        <p className="text-sm text-white/60">{message || 'Loading PDF...'}</p>
    </div>
);

// Error display component
const ErrorDisplay = ({ error, onRetry, downloadUrl }) => (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="text-red-400" size={32} />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white mb-1">Failed to load PDF</h3>
            <p className="text-sm text-white/50 max-w-md">{error}</p>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
                Retry
            </button>
            <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors flex items-center gap-2"
            >
                <Maximize2 size={14} />
                Open in MEGA
            </a>
        </div>
    </div>
);

const PdfViewerModal = ({ file, onClose, pdfCache }) => {
    const [pdfData, setPdfData] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');
    const [isCached, setIsCached] = useState(false);

    // Check cache or download PDF from MEGA on mount
    useEffect(() => {
        if (!file?.id || !file?.downloadUrl) return;

        let cancelled = false;

        const loadPdf = async () => {
            try {
                // Check cache first
                if (pdfCache && pdfCache.has(file.id)) {
                    const cachedUrl = pdfCache.get(file.id);
                    setPdfData(cachedUrl);
                    setIsDownloading(false);
                    setIsCached(true);
                    return;
                }

                setIsDownloading(true);
                setError(null);
                setDownloadProgress(0);
                setLoadingMessage('Connecting to MEGA...');

                // Import megajs dynamically
                const mega = await import('megajs');
                const { File } = mega;

                // Create file from public URL
                setLoadingMessage('Fetching file info...');
                const megaFile = File.fromURL(file.downloadUrl);
                await megaFile.loadAttributes();

                if (cancelled) return;

                setLoadingMessage('Downloading PDF...');

                // Download as buffer with progress tracking
                const downloadStream = megaFile.download();
                const chunks = [];
                let downloadedBytes = 0;
                const totalBytes = megaFile.size;

                downloadStream.on('progress', (info) => {
                    if (cancelled) return;
                    downloadedBytes = info.bytesLoaded;
                    const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
                    setDownloadProgress(progress);
                });

                downloadStream.on('data', (chunk) => {
                    if (cancelled) return;
                    chunks.push(chunk);
                });

                await new Promise((resolve, reject) => {
                    downloadStream.on('end', resolve);
                    downloadStream.on('error', reject);
                });

                if (cancelled) return;

                // Convert chunks to blob (browser-native, no Buffer)
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const finalData = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) {
                    finalData.set(new Uint8Array(chunk), offset);
                    offset += chunk.length;
                }

                const blob = new Blob([finalData], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(blob);

                if (cancelled) {
                    URL.revokeObjectURL(pdfUrl);
                    return;
                }

                // Cache the blob URL for future instant access
                if (pdfCache) {
                    pdfCache.set(file.id, pdfUrl);
                }

                setLoadingMessage('Rendering PDF...');
                setPdfData(pdfUrl);
                setIsDownloading(false);

            } catch (err) {
                if (cancelled) return;
                console.error('MEGA download error:', err);
                setError(err.message || 'Failed to download PDF from MEGA');
                setIsDownloading(false);
            }
        };

        loadPdf();

        return () => {
            cancelled = true;
            // Don't revoke cached URLs - they persist for the session
        };
    }, [file?.id, file?.downloadUrl, pdfCache]);

    // Note: Don't cleanup blob URLs on unmount - they're cached for the session

    // PDF load handlers
    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
    }, []);

    const onDocumentLoadError = useCallback((error) => {
        console.error('PDF render error:', error);
        setError(error.message || 'Failed to render PDF');
    }, []);

    // Navigation
    const goToPrevPage = useCallback(() => {
        setPageNumber(prev => Math.max(1, prev - 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setPageNumber(prev => Math.min(numPages || 1, prev + 1));
    }, [numPages]);

    // Zoom
    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(3, prev + 0.25));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(0.5, prev - 0.25));
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1.2);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrevPage();
            if (e.key === 'ArrowRight') goToNextPage();
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToPrevPage, goToNextPage, zoomIn, zoomOut]);

    // Retry handler
    const handleRetry = useCallback(() => {
        setPdfData(null);
        setError(null);
        setIsDownloading(true);
        setDownloadProgress(0);
    }, []);

    if (!file) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col"
            onClick={onClose}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-6 py-3 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10">
                        <FileText className="text-red-400" size={18} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-sm truncate max-w-[300px]">{file.name}</h3>
                        <p className="text-white/40 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    {/* Page navigation */}
                    {numPages && (
                        <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                            <button
                                onClick={goToPrevPage}
                                disabled={pageNumber <= 1}
                                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1.5 px-2">
                                <input
                                    type="number"
                                    value={pageNumber}
                                    onChange={(e) => {
                                        const page = parseInt(e.target.value);
                                        if (page >= 1 && page <= numPages) {
                                            setPageNumber(page);
                                        }
                                    }}
                                    className="w-10 text-center bg-transparent text-white text-sm font-medium focus:outline-none"
                                    min={1}
                                    max={numPages}
                                />
                                <span className="text-white/40 text-sm">/ {numPages}</span>
                            </div>
                            <button
                                onClick={goToNextPage}
                                disabled={pageNumber >= numPages}
                                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Zoom controls */}
                    {!isDownloading && !error && (
                        <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                            <button
                                onClick={zoomOut}
                                disabled={scale <= 0.5}
                                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button
                                onClick={resetZoom}
                                className="px-2 py-0.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
                            >
                                {Math.round(scale * 100)}%
                            </button>
                            <button
                                onClick={zoomIn}
                                disabled={scale >= 3}
                                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <ZoomIn size={16} />
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Download"
                    >
                        <Download size={18} />
                    </a>
                    <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Open in MEGA"
                    >
                        <Maximize2 size={18} />
                    </a>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors ml-1"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div
                className="flex-1 overflow-auto flex items-start justify-center p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {isDownloading ? (
                    <LoadingIndicator progress={downloadProgress} message={loadingMessage} />
                ) : error ? (
                    <ErrorDisplay
                        error={error}
                        onRetry={handleRetry}
                        downloadUrl={file.downloadUrl}
                    />
                ) : pdfData ? (
                    <Document
                        file={pdfData}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="animate-spin text-indigo-400" size={24} />
                            </div>
                        }
                        className="flex flex-col items-center"
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            loading={
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="animate-spin text-indigo-400" size={24} />
                                </div>
                            }
                            className="shadow-2xl rounded-lg overflow-hidden"
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                ) : null}
            </div>

            {/* Footer hint */}
            {!isDownloading && !error && (
                <div className="py-2 text-center border-t border-white/5 flex items-center justify-center gap-4">
                    <p className="text-xs text-white/30">
                        Use ← → to navigate • +/- to zoom • Esc to close
                    </p>
                    {isCached && (
                        <span className="text-xs text-emerald-400/60 flex items-center gap-1">
                            ⚡ Loaded from cache
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default PdfViewerModal;
