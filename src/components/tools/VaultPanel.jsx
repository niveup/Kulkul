import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    UploadCloud,
    Download,
    Trash2,
    Search,
    CheckCircle2,
    AlertCircle,
    Loader2,
    HardDrive,
    X,
    Wifi,
    WifiOff,
    RefreshCw,
    RotateCcw,
    AlertTriangle,
    ExternalLink,
    Clock,
    FolderOpen,
    Move,
    Film,
    Image as ImageIcon,
    Music,
    Package,
    Code,
    File as GenericFileIcon
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    useDraggable
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../lib/utils';
import { useVault, formatFileSize, formatRelativeTime } from '../../hooks/useVault';
import { useChunkedStorage } from '../../hooks/useChunkedStorage';
import { useIndexedDBCache } from '../../hooks/useIndexedDBCache';
import { useVaultStore } from '../../store/vaultStore';
import FolderTree from './vault/FolderTree';
import PdfViewerModal from './PdfViewerModal';
import { shouldUseLocalStorage } from '../../utils/authMode';

// =============================================================================
// FILE CARD COMPONENT
// =============================================================================


// Helper to get icon and color based on file type
const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase() || '';

    // Video
    if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm', 'm4v'].includes(ext)) {
        return { Icon: Film, bg: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/20', text: 'text-pink-400' };
    }
    // Image
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(ext)) {
        return { Icon: ImageIcon, bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20', text: 'text-blue-400' };
    }
    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
        return { Icon: Music, bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20', text: 'text-violet-400' };
    }
    // Code / Text
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'txt', 'md', 'xml'].includes(ext)) {
        return { Icon: Code, bg: 'from-slate-500/20 to-emerald-500/20', border: 'border-slate-500/20', text: 'text-emerald-400' };
    }
    // Archive / App
    if (['zip', 'rar', '7z', 'tar', 'gz', 'exe', 'msi', 'apk', 'dmg', 'iso'].includes(ext)) {
        return { Icon: Package, bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/20', text: 'text-amber-400' };
    }
    // PDF (Default high vis)
    if (['pdf'].includes(ext)) {
        return { Icon: FileText, bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/20', text: 'text-red-400' };
    }
    // Default
    return { Icon: GenericFileIcon, bg: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20', text: 'text-indigo-400' };
};

const FileCard = ({ file, index, onView, onDownload, onDelete, isTrash = false, onRestore, onPermanentDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPermanentConfirm, setShowPermanentConfirm] = useState(false);

    // Get distinct icon info
    const { Icon, bg, border, text } = getFileIcon(file.name);

    const handleDelete = async () => {
        setIsDeleting(true);
        if (isTrash) {
            await onPermanentDelete(file.id);
        } else {
            await onDelete(file.id);
        }
        setIsDeleting(false);
        setShowConfirm(false);
        setShowPermanentConfirm(false);
    };

    const handleRestore = async () => {
        setIsDeleting(true);
        await onRestore(file.id);
        setIsDeleting(false);
    };

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: file.id,
        data: { type: 'file', file }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, scale: isDragging ? 1.05 : 1, zIndex: isDragging ? 999 : 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            layout
            onClick={(e) => {
                // Only trigger view if not clicking on buttons and not in trash
                if (!isTrash && e.target.closest('button') === null) {
                    onView(file);
                }
            }}
            className={cn(
                "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] touch-none", // touch-none for dnd
                isDragging ? "bg-indigo-500/20 border-indigo-500/50 shadow-2xl cursor-grabbing" : isTrash ? "cursor-default" : "cursor-pointer",
                isTrash
                    ? "bg-red-500/[0.02] border-red-500/10 hover:bg-red-500/[0.05]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            )}
        >
            {/* Icon Container */}
            <div className={cn(
                "relative w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300",
                isTrash
                    ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/20"
                    : `bg-gradient-to-br ${bg} ${border}`
            )}>
                <Icon size={20} className={isTrash ? "text-red-400" : text} />
                {isTrash && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Clock size={10} className="text-black" />
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <button
                    onClick={() => !isTrash && onView(file)}
                    className={cn(
                        "text-sm font-medium truncate text-left w-full transition-colors",
                        isTrash
                            ? "text-white/60 cursor-default"
                            : "text-white/90 hover:text-indigo-400 cursor-pointer group-hover:text-white"
                    )}
                    title={isTrash ? file.name : `Click to view: ${file.name}`}
                    disabled={isTrash}
                >
                    {file.name}
                </button>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/40 font-medium whitespace-nowrap overflow-hidden">
                    <span className="shrink-0">{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    {isTrash ? (
                        <span className="text-amber-400 shrink-0 truncate">{file.daysRemaining} days left</span>
                    ) : (
                        <span className="truncate">{formatRelativeTime(file.createdAt)}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <AnimatePresence mode="wait">
                {showPermanentConfirm ? (
                    <motion.div
                        key="permanent-confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-end gap-1"
                    >
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                            <AlertTriangle size={12} />
                            <span>Permanently delete?</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-medium disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Delete Forever'}
                            </button>
                            <button
                                onClick={() => setShowPermanentConfirm(false)}
                                className="p-1 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                ) : showConfirm ? (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-xs text-white/60 mr-2">Move to trash?</span>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0"
                    >
                        {isTrash ? (
                            <>
                                <button
                                    onClick={handleRestore}
                                    disabled={isDeleting}
                                    className="p-2 rounded-lg hover:bg-emerald-500/20 text-white/40 hover:text-emerald-400 transition-colors disabled:opacity-50"
                                    title="Restore"
                                >
                                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                                </button>
                                <button
                                    onClick={() => setShowPermanentConfirm(true)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                    title="Delete Forever"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => onView(file)}
                                    className="p-2 rounded-lg hover:bg-indigo-500/20 text-white/40 hover:text-indigo-400 transition-colors"
                                    title="View PDF"
                                >
                                    <ExternalLink size={16} />
                                </button>
                                <button
                                    onClick={() => onDownload(file)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="p-2 rounded-lg hover:bg-amber-500/20 text-white/40 hover:text-amber-400 transition-colors"
                                    title="Move to Trash"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// =============================================================================
// UPLOAD ZONE COMPONENT
// =============================================================================

const UploadZone = ({ onUpload, isUploading, uploadProgress }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onUpload(files[0]); // Upload first file
        }
    }, [onUpload]);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        e.target.value = '';
    }, [onUpload]);

    const handleClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
                "relative w-full h-48 rounded-3xl border border-dashed transition-all overflow-hidden group cursor-pointer",
                isDragging
                    ? "border-indigo-500/50 bg-indigo-500/10 scale-[1.02]"
                    : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03]",
                isUploading && "pointer-events-none"
            )}
        >
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                "bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]",
                isDragging && "opacity-100"
            )} />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                    cx="32" cy="32" r="28"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="32" cy="32" r="28"
                                    fill="none"
                                    stroke="url(#uploadGradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={175.93}
                                    initial={{ strokeDashoffset: 175.93 }}
                                    animate={{ strokeDashoffset: 175.93 - (175.93 * uploadProgress / 100) }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                                <defs>
                                    <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{uploadProgress}%</span>
                            </div>
                        </div>
                        <p className="text-xs text-white/60">Uploading to Telegram...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            animate={{ y: isDragging ? -5 : 0, scale: isDragging ? 1.1 : 1 }}
                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center"
                        >
                            <UploadCloud size={24} className="text-indigo-300" />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-white/80">
                                {isDragging ? 'Drop to upload' : 'Drag any file here'}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                                or <span className="text-indigo-400">browse computer</span> • Files over 50MB are chunked automatically
                            </p>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

// =============================================================================
// MAIN VAULT PANEL COMPONENT
// =============================================================================

const VaultPanel = ({ isDarkMode }) => {
    // Chunked storage hook for Telegram uploads
    const {
        uploadFile: uploadToTelegram,
        downloadFile: downloadFromTelegram,
        cancel: cancelChunkedOperation,
        isUploading,
        isDownloading,
        uploadProgress,
        downloadProgress,
        uploadDetails,
        error: storageError
    } = useChunkedStorage();

    // IndexedDB cache for instant access (session-based, auto-clears synced on site close)
    const {
        saveToCache,
        getFromCache,
        markAsSynced,
        deleteFromCache,
        getPendingFiles,
        getPendingFilesMetadata,
        getFileBlob,
        isInCache,
        isPendingSync,
        getCacheStats,
        isReady: cacheReady
    } = useIndexedDBCache();

    // Legacy hook for MEGA operations (some features still used)
    const {
        files: legacyFiles,
        trashFiles: legacyTrashFiles,
        isLoading: isMegaLoading,
        error: megaError,
        megaConnected,
        storageInfo,
        viewingPdf,
        pdfCache,
        moveToTrash,
        restoreFile,
        permanentDelete,
        viewPdf,
        closePdfViewer,
        refreshFiles,
        refreshTrash,
        clearError,
        createFolder,
        moveFile
    } = useVault();

    // Track current file being processed for progress display
    const [currentFile, setCurrentFile] = useState(null);
    const [operationType, setOperationType] = useState(null); // 'upload' or 'download'

    // Track local files (from IndexedDB) - shown instantly before Telegram sync completes
    const [localFiles, setLocalFiles] = useState([]);

    // Track current uploading file ID for cancel functionality
    const [currentUploadingFileId, setCurrentUploadingFileId] = useState(null);

    // Floating Progress Monitor Component - ONLY for DOWNLOADS (uploads are silent)
    const ProgressMonitor = () => {
        // Only show for DOWNLOADS, not uploads (uploads use silent background sync)
        if (!isDownloading) return null;

        const progress = downloadProgress;
        const type = 'Downloading';
        const fileName = currentFile?.name || 'File';
        const fileSize = currentFile?.size ? formatFileSize(currentFile.size) : '';

        return (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl min-w-[320px]">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Download className="w-5 h-5 text-white" />
                            </div>
                            <motion.div
                                className="absolute -right-1 -top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{fileName}</p>
                            <p className="text-white/50 text-xs">{type} • {fileSize}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>

                    {/* Progress Text */}
                    <div className="flex justify-between items-center">
                        <span className="text-white/70 text-xs">
                            {(() => {
                                const totalChunks = currentFile?.chunks?.length || Math.ceil((currentFile?.size || 50000000) / (19 * 1024 * 1024));
                                const completedChunks = Math.ceil((progress / 100) * totalChunks);
                                return progress < 100 ? `Chunk ${completedChunks} of ${totalChunks}` : 'Finalizing...';
                            })()}
                        </span>
                        <span className="text-white font-bold text-lg">
                            {progress}%
                        </span>
                    </div>

                    {/* Animated dots for activity */}
                    {progress < 100 && (
                        <div className="flex gap-1 mt-3 justify-center">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    // Track files currently syncing to Telegram
    const [syncingFiles, setSyncingFiles] = useState(new Map());
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, fileName: '' });

    // Handle cancel upload - stops upload, deletes from IndexedDB, removes from UI
    const handleCancelUpload = useCallback(async () => {
        if (!currentUploadingFileId && syncingFiles.size === 0) return;

        const fileIdToCancel = currentUploadingFileId || [...syncingFiles.keys()][0];
        console.log('[VaultPanel] Cancelling upload:', fileIdToCancel);

        // 1. Abort the chunked upload operation
        cancelChunkedOperation();

        // 2. Delete from IndexedDB
        if (fileIdToCancel) {
            await deleteFromCache(fileIdToCancel);
        }

        // 3. Remove from localFiles display
        setLocalFiles(prev => prev.filter(f => f.id !== fileIdToCancel));

        // 4. Remove from syncing files
        setSyncingFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileIdToCancel);
            return newMap;
        });

        // 5. Clear current file state
        setCurrentFile(null);
        setCurrentUploadingFileId(null);

        console.log('[VaultPanel] ✓ Upload cancelled and cleaned up');
    }, [currentUploadingFileId, syncingFiles, cancelChunkedOperation, deleteFromCache]);

    // State for expandable detail panel
    const [syncBarExpanded, setSyncBarExpanded] = useState(false);

    // Compact Sync Bar Component with expandable detail panel
    const SyncBar = () => {
        if (syncingFiles.size === 0 && !isUploading) return null;

        // Use uploadDetails from hook for accurate tracking
        const details = uploadDetails;
        const progress = uploadProgress;
        const fileName = details.fileName || currentFile?.name || 'File';
        const fileSize = details.fileSize || currentFile?.size || 0;
        const bytesUploaded = details.bytesUploaded || 0;
        const speed = details.uploadSpeed || 0;
        const eta = details.eta || 0;
        const chunksProgress = details.chunksProgress || [];
        const strategy = details.strategy || 'direct';
        const totalChunks = details.totalChunks || 1;

        // Format bytes to readable size
        const formatSize = (bytes) => {
            if (!bytes || bytes < 0) return '0 B';
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        };

        // Format speed
        const formatSpeed = (bytesPerSec) => {
            if (!bytesPerSec || bytesPerSec <= 0) return '--';
            if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
            if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
            return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
        };

        // Format ETA
        const formatEta = (seconds) => {
            if (!seconds || seconds <= 0) return '--';
            if (seconds < 60) return `${Math.ceil(seconds)}s`;
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
            return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
        };

        // Chunk status icon and color
        const getChunkStatus = (chunk) => {
            if (chunk.status === 'completed') return { icon: '✓', color: 'text-green-400', bg: 'bg-green-500' };
            if (chunk.status === 'uploading') return { icon: '↑', color: 'text-yellow-400', bg: 'bg-yellow-500' };
            return { icon: '○', color: 'text-white/30', bg: 'bg-white/20' };
        };

        return (
            <div className="mb-4 rounded-xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-500/15 border border-indigo-500/30 backdrop-blur-sm overflow-hidden">
                {/* Main compact bar - clickable */}
                <div
                    className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setSyncBarExpanded(!syncBarExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* File name and percentage */}
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-white font-medium truncate">{fileName}</span>
                                    <span className="text-white/40 shrink-0">({formatSize(fileSize)})</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <span className="text-indigo-300 text-[10px]">{formatSpeed(speed)}</span>
                                    <span className="text-indigo-400 font-bold text-sm">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Quick stats */}
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-white/60">
                                    {formatSize(bytesUploaded)} / {formatSize(fileSize)}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-white/40">
                                        ETA: <span className="text-indigo-300">{formatEta(eta)}</span>
                                    </span>
                                    <span className="text-white/40">
                                        {strategy === 'chunked' ? `${totalChunks} chunks` : 'Direct'}
                                    </span>
                                    <span className="text-white/30 transition-transform duration-200" style={{ transform: syncBarExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                                </div>
                            </div>
                        </div>

                        {/* Cancel button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCancelUpload(); }}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all shrink-0"
                            title="Cancel upload"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Expanded detail panel - CSS transition instead of framer-motion */}
                <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{
                        maxHeight: syncBarExpanded ? '500px' : '0px',
                        opacity: syncBarExpanded ? 1 : 0
                    }}
                >
                    <div className="p-3 pt-0 border-t border-indigo-500/20 space-y-3">
                        {/* Upload Strategy Info */}
                        <div className="flex items-center justify-between text-[11px] pt-3">
                            <div className="flex items-center gap-2">
                                <span className="text-white/50">Strategy:</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${strategy === 'chunked'
                                    ? 'bg-purple-500/30 text-purple-300'
                                    : 'bg-blue-500/30 text-blue-300'
                                    }`}>
                                    {strategy === 'chunked' ? `Chunked (${totalChunks} parts)` : 'Direct Upload'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-white/50">
                                <span>Speed: <span className="text-green-400">{formatSpeed(speed)}</span></span>
                                <span>ETA: <span className="text-yellow-400">{formatEta(eta)}</span></span>
                            </div>
                        </div>

                        {/* Chunk-by-chunk progress (only for chunked uploads) */}
                        {strategy === 'chunked' && chunksProgress.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-[10px] text-white/40 font-medium">Chunk Progress:</div>
                                <div className="grid gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                                    {chunksProgress.map((chunk, idx) => {
                                        const status = getChunkStatus(chunk);
                                        return (
                                            <div key={idx} className="flex items-center gap-2 text-[10px]">
                                                <span className={`w-4 text-center ${status.color}`}>{status.icon}</span>
                                                <span className="text-white/50 w-14">Part {idx + 1}</span>
                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${status.bg} rounded-full transition-all duration-300`}
                                                        style={{ width: `${chunk.percent}%` }}
                                                    />
                                                </div>
                                                <span className="w-10 text-right text-white/60">{Math.round(chunk.percent)}%</span>
                                                <span className="w-24 text-right text-white/40 text-[9px]">
                                                    {formatSize(chunk.bytesUploaded)}/{formatSize(chunk.bytesTotal)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Direct upload single chunk view */}
                        {strategy === 'direct' && (
                            <div className="text-[11px] text-white/50 flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Uploading entire file directly (under 20MB)</span>
                            </div>
                        )}

                        {/* Technical details */}
                        <div className="pt-2 border-t border-white/5 text-[9px] text-white/30 flex items-center justify-between">
                            <span>File: {fileName}</span>
                            <span>Size: {formatSize(fileSize)}</span>
                            <span>Uploaded: {formatSize(bytesUploaded)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STEP 1: Load pending files for INSTANT display (no upload yet)
    // This runs immediately when cache is ready
    useEffect(() => {
        if (!cacheReady) return;

        const loadPendingFilesForDisplay = async () => {
            try {
                // Use metadata-only fetch for speed (doesn't load blobs)
                const pending = await getPendingFilesMetadata();

                if (pending.length > 0) {
                    console.log(`[VaultPanel] Found ${pending.length} pending files - displaying immediately`);

                    // Add to UI INSTANTLY (before any upload attempts)
                    const pendingEntries = pending.map(file => ({
                        id: file.id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        storagePlatform: 'local',
                        isLocal: true,
                        isSyncing: false,  // Not syncing YET - just displaying
                        isPending: true,   // Waiting to be synced
                        createdAt: file.timestamp ? new Date(file.timestamp).toISOString() : new Date().toISOString()
                    }));
                    setLocalFiles(pendingEntries);
                    console.log(`[VaultPanel] ✓ ${pending.length} pending files now visible in vault`);
                }
            } catch (err) {
                console.error('[VaultPanel] Failed to load pending files:', err);
            }
        };

        loadPendingFilesForDisplay();
    }, [cacheReady, getPendingFilesMetadata]);

    // STEP 2: Resume uploads in background (separate effect, runs after display)
    // This is triggered after files are displayed, with a small delay
    useEffect(() => {
        if (!cacheReady || localFiles.length === 0) return;

        // Only process files that are pending (not already syncing)
        const pendingToSync = localFiles.filter(f => f.isPending && !f.isSyncing && !f.syncFailed);
        if (pendingToSync.length === 0) return;

        // Small delay to ensure UI is rendered first
        const syncTimeout = setTimeout(async () => {
            console.log(`[VaultPanel] Starting background sync for ${pendingToSync.length} files`);

            for (const localFile of pendingToSync) {
                // Mark as syncing in UI
                setLocalFiles(prev => prev.map(f =>
                    f.id === localFile.id ? { ...f, isSyncing: true, isPending: false } : f
                ));
                setSyncingFiles(prev => new Map(prev).set(localFile.id, { name: localFile.name, progress: 0 }));

                try {
                    // Load the actual blob from IndexedDB
                    const fileData = await getFileBlob(localFile.id);
                    if (!fileData || !fileData.blob) {
                        console.warn(`[VaultPanel] No blob found for ${localFile.name}, skipping`);
                        setLocalFiles(prev => prev.map(f =>
                            f.id === localFile.id ? { ...f, isSyncing: false, syncFailed: true } : f
                        ));
                        continue;
                    }

                    const fileToUpload = new File([fileData.blob], localFile.name, { type: localFile.type });
                    const metadata = await uploadToTelegram(fileToUpload);

                    if (metadata?.aborted) {
                        console.log('[VaultPanel] Upload cancelled (clean exit)');
                        setLocalFiles(prev => prev.map(f =>
                            f.id === localFile.id ? { ...f, isSyncing: false, isPending: true } : f
                        ));
                        continue; // Skip this file
                    }

                    if (metadata) {
                        const saveData = {
                            id: metadata.fileId || localFile.id,
                            name: localFile.name,
                            size: localFile.size,
                            type: localFile.type,
                            isChunked: metadata.isChunked || false,
                            chunks: metadata.chunks || null,
                            downloadUrl: metadata.downloadUrl || null,
                            storagePlatform: 'telegram',
                            folderId: localFile.folderId || currentFolderId // Ensure folder logic
                        };

                        const response = await fetch('/api/vault/save-telegram', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(saveData)
                        });

                        if (response.ok) {
                            await markAsSynced(localFile.id);
                            await deleteFromCache(localFile.id);
                            setLocalFiles(prev => prev.filter(f => f.id !== localFile.id));
                            console.log(`[VaultPanel] ✓ Synced: ${localFile.name}`);
                            refreshFiles();
                        } else {
                            throw new Error('API save failed');
                        }
                    } else {
                        throw new Error('Upload returned no metadata');
                    }
                } catch (err) {
                    console.error(`[VaultPanel] Sync failed for ${localFile.name}:`, err);
                    setLocalFiles(prev => prev.map(f =>
                        f.id === localFile.id ? { ...f, isSyncing: false, syncFailed: true } : f
                    ));
                } finally {
                    setSyncingFiles(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(localFile.id);
                        return newMap;
                    });
                }
            }
        }, 500); // 500ms delay to let UI render first

        return () => clearTimeout(syncTimeout);
    }, [cacheReady, localFiles, uploadToTelegram, markAsSynced, deleteFromCache, refreshFiles, getFileBlob]);



    // Handle file upload with INSTANT save + TRUE background sync (non-blocking)
    const handleUpload = useCallback(async (file) => {
        console.log('[VaultPanel] Starting upload:', file.name, 'Size:', formatFileSize(file.size));

        // Generate unique ID for this file
        const fileId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;



        // Step 1: Save to IndexedDB IMMEDIATELY (instant!)
        console.log('[VaultPanel] Saving to local cache...');
        await saveToCache(fileId, file, {
            name: file.name,
            synced: false,
            isChunked: file.size > 20 * 1024 * 1024
        });

        // Step 2: Add to localFiles state for INSTANT display in vault list!
        const localFileEntry = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            storagePlatform: 'local',
            isLocal: true,
            isSyncing: true,
            createdAt: new Date().toISOString()
        };
        setLocalFiles(prev => [...prev, localFileEntry]);
        console.log('[VaultPanel] ✓ File added to vault list instantly!');

        // Mark as syncing (for top bar indicator)
        setSyncingFiles(prev => new Map(prev).set(fileId, { name: file.name, progress: 0 }));

        // Step 2: Sync to Telegram in TRUE BACKGROUND (don't await!)
        // This runs completely in background, user can continue working
        (async () => {
            try {
                console.log('[VaultPanel] Background sync starting for:', file.name);

                const metadata = await uploadToTelegram(file);

                if (metadata) {
                    // Save to API
                    const fileData = {
                        id: metadata.fileId || fileId,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        isChunked: metadata.isChunked || false,
                        chunks: metadata.chunks || null,
                        downloadUrl: metadata.downloadUrl || null,
                        storagePlatform: 'telegram'
                    };

                    const response = await fetch('/api/vault/save-telegram', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fileData)
                    });

                    if (response.ok) {
                        await markAsSynced(fileId);
                        await deleteFromCache(fileId);
                        console.log('[VaultPanel] ✓ Synced to cloud:', file.name);
                        console.log('[VaultPanel] ✓ Synced to cloud:', file.name);
                        // Don't remove from localFiles here! usage of useEffect (above) handles it seamlessly.
                    } else {
                        await markAsSynced(fileId);
                        // Keep local file until refreshFiles brings in the failed state or handled otherwise
                        console.warn('[VaultPanel] API save failed, but file is in Telegram');
                    }
                    refreshFiles();
                } else {
                    // Sync failed - mark file with error indicator
                    console.warn('[VaultPanel] Sync failed, keeping in local storage');
                    setLocalFiles(prev => prev.map(f =>
                        f.id === fileId ? { ...f, isSyncing: false, syncFailed: true } : f
                    ));
                }
            } catch (err) {
                console.error('[VaultPanel] Background sync error:', err);
            } finally {
                setSyncingFiles(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(fileId);
                    return newMap;
                });
            }
        })(); // Immediately Invoked Function Expression - runs in background

        // Immediately return - user sees their file and can continue
        setCurrentFile(null);
    }, [uploadToTelegram, refreshFiles, saveToCache, markAsSynced, deleteFromCache]);

    // Handle file viewing (download and open in viewer/new tab)
    const handleView = useCallback(async (file) => {
        console.log('[VaultPanel] Viewing:', file.name, 'Platform:', file.storagePlatform);

        // Set current file for progress display
        setCurrentFile(file);

        // LOCAL files (from IndexedDB) - view instantly!
        if (file.isLocal || file.storagePlatform === 'local') {
            const cached = await getFromCache(file.id);
            if (cached && cached.blob) {
                console.log('[VaultPanel] Local file - loading instantly!');
                const url = URL.createObjectURL(cached.blob);
                window.open(url, '_blank');
                setCurrentFile(null);
                return;
            }
        }

        // For Telegram files (chunked or single), check cache first
        if (file.storagePlatform === 'telegram' || file.isChunked) {
            // Check IndexedDB cache first for instant access
            const cacheKey = file.id || file.name;
            const cached = await getFromCache(cacheKey);

            if (cached && cached.blob) {
                console.log('[VaultPanel] Cache HIT! Loading instantly...');
                const url = URL.createObjectURL(cached.blob);
                window.open(url, '_blank');
                setCurrentFile(null);
                return;
            }

            console.log('[VaultPanel] Cache MISS - downloading from Telegram...');

            if (file.isChunked && file.chunks) {
                // Chunked file - download all chunks and reassemble
                console.log('[VaultPanel] Starting chunked download...');
                const result = await downloadFromTelegram({
                    isChunked: true,
                    chunks: file.chunks,
                    totalSize: file.size,
                    fileName: file.name,
                    mimeType: file.type || 'application/octet-stream'
                });

                console.log('[VaultPanel] Download result:', result ? 'Success' : 'Failed');

                if (result) {
                    // Save to IndexedDB cache for instant access next time
                    await saveToCache(cacheKey, result.blob, {
                        name: file.name,
                        synced: true // Already synced to Telegram
                    });

                    console.log('[VaultPanel] Saved to cache, opening...');
                    // Try to open in new tab, fallback to link click if popup blocked
                    const newWindow = window.open(result.url, '_blank');
                    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                        // Popup was blocked - use link click to force new tab
                        console.log('[VaultPanel] Popup blocked, using link click...');
                        const link = document.createElement('a');
                        link.href = result.url;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            } else if (file.downloadUrl) {
                // Single Telegram file - open proxy URL directly
                window.open(file.downloadUrl, '_blank');
            }
        } else {
            // Legacy MEGA files or other - use existing viewPdf logic
            viewPdf(file);
        }

        // Clear current file after operation
        setCurrentFile(null);
    }, [downloadFromTelegram, viewPdf, getFromCache, saveToCache]);

    // Handle file download with chunked storage - opens in new tab after download
    const handleDownload = useCallback(async (file) => {
        console.log('[VaultPanel] Downloading:', file.name);

        // Set current file for progress display
        setCurrentFile(file);

        // If file has chunk metadata, use chunked download
        if (file.isChunked && file.chunks) {
            const result = await downloadFromTelegram({
                isChunked: true,
                chunks: file.chunks,
                totalSize: file.size,
                fileName: file.name,
                mimeType: file.type || 'application/octet-stream'
            });

            if (result) {
                console.log('[VaultPanel] Download complete, opening in new tab');
                // Open file in new tab for viewing
                const newWindow = window.open(result.url, '_blank');
                if (!newWindow || newWindow.closed) {
                    // Popup blocked - use link click to force new tab
                    console.log('[VaultPanel] Popup blocked, using link click...');
                    const link = document.createElement('a');
                    link.href = result.url;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        } else if (file.storagePlatform === 'telegram' && file.downloadUrl) {
            // Single Telegram file - open proxy URL in new tab
            window.open(file.downloadUrl, '_blank');
        } else {
            // Legacy MEGA files
            window.open(file.downloadUrl || file.url, '_blank');
        }
    }, [downloadFromTelegram]);

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id && active.data.current?.type === 'file' && over.data.current?.type === 'folder') {
            const fileId = active.id;
            const folderId = over.id;
            console.log(`Moving file ${fileId} to folder ${folderId}`);
            await moveFile(fileId, folderId);
        }
    };

    // New Store
    const {
        files,
        currentFolderId,
        setInitialData,
        setLoading,
        searchQuery,
        setSearchQuery
    } = useVaultStore();

    // Auto-cleanup hook: Removes local file ONLY when it appears in remote list (Moved here to avoid TDZ error)
    useEffect(() => {
        if (files && files.length > 0 && localFiles.length > 0) {
            const remoteKeys = new Set(files.map(f => `${f.name}-${f.size}`));
            setLocalFiles(prev => {
                const shouldUpdate = prev.some(l => remoteKeys.has(`${l.name}-${l.size}`));
                return shouldUpdate ? prev.filter(l => !remoteKeys.has(`${l.name}-${l.size}`)) : prev;
            });
        }
    }, [files, localFiles]);

    const [showTrash, setShowTrash] = useState(false);

    // Sync legacy files to store when they change
    useEffect(() => {
        if (legacyFiles.length > 0) {
            // In a real app we'd fetch folders/tags here too
            // For now, just syncing files
            setInitialData({ files: legacyFiles, folders: [], tags: [] });
        }
    }, [legacyFiles, setInitialData]);

    // Fetch folders on mount (simulated for now until we hook up API)
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await fetch('/api/vault/folders');
                const data = await res.json();
                if (data.success) {
                    useVaultStore.setState(state => ({ folders: data.folders }));
                }
            } catch (e) {
                console.error("Failed to load folders", e);
            }
        };
        fetchFolders();
    }, []);

    // Filter files by folder and search
    // Combine local files (from IndexedDB) with remote files for instant display
    const remoteFiles = showTrash ? legacyTrashFiles : files;
    const displayFiles = [...localFiles, ...remoteFiles]; // Local files appear first
    const filteredFiles = displayFiles.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = showTrash ? true : (file.folderId === currentFolderId || (!file.folderId && !currentFolderId));
        return matchesSearch && matchesFolder;
    });

    // Calculate storage percentage
    const storagePercent = Math.round((storageInfo.used / storageInfo.total) * 100);

    // Guest mode check
    if (shouldUseLocalStorage()) {
        // ... (keep existing guest mode UI)
        return (
            <div className="min-h-screen pb-20 overflow-x-hidden pt-6">
                <div className="max-w-7xl mx-auto px-6">
                    <header className="mb-6">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight mb-1">Vault</h1>
                            <p className="text-white/40 font-medium text-sm">Secure PDF Cloud Storage</p>
                        </motion.div>
                    </header>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-6">
                            <WifiOff size={32} className="text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white/90 mb-2">Offline Mode</h2>
                        <p className="text-white/50 text-sm text-center max-w-md mb-6">Vault requires authentication to access cloud storage. Please log in with your password.</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden pt-6">
            {/* Floating Progress Monitor */}
            <AnimatePresence>
                <ProgressMonitor />
            </AnimatePresence>
            <AnimatePresence>
                {viewingPdf && <PdfViewerModal file={viewingPdf} onClose={closePdfViewer} pdfCache={pdfCache} />}
            </AnimatePresence>

            <div className="max-w-[1600px] mx-auto px-6">
                {/* Compact Sync Bar (non-blocking) */}
                <AnimatePresence>
                    <SyncBar />
                </AnimatePresence>
                {/* Header built with existing aesthetic */}
                <header className="mb-8 relative z-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                                    <FileText className="text-white" size={20} />
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Vault</h1>
                            </div>
                            <div className="flex items-center gap-3 ml-1">
                                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors",
                                    megaConnected
                                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                )}>
                                    {megaConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                                    {megaConnected ? 'SYNC ACTIVE' : 'CONNECTING'}
                                </div>
                                <span className="text-white/20 text-xs font-medium tracking-wide">SECURE PREMIERE STORAGE</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { refreshFiles(); refreshTrash(); }} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><RefreshCw size={16} /></button>
                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <span className="text-xs font-bold text-white/80">{formatFileSize(storageInfo.used)}</span>
                                <span className="text-[10px] text-white/40">/ {formatFileSize(storageInfo.total)}</span>
                            </div>
                        </div>
                    </motion.div>
                </header>

                <div className="flex gap-8 items-start min-h-[calc(100vh-200px)]">
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        {/* LEFT SIDEBAR: FOLDER TREE (Sticky) */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden md:flex flex-col w-72 shrink-0 sticky top-6 h-[calc(100vh-120px)] p-4 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-2xl shadow-xl overflow-hidden"
                        >
                            <FolderTree onCreateFolder={(name) => createFolder(name)} />

                            {/* Storage Widget moved to sidebar footer */}
                            <div className="mt-auto pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Storage Used</span>
                                    <span className="text-xs font-bold text-white">{storagePercent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${storagePercent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/30 mt-2 text-right">
                                    {formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.total)}
                                </p>
                            </div>
                        </motion.div>


                        {/* MAIN CONTENT AREA */}
                        <div className="flex-1 min-w-0">
                            {/* TAB SWITCHER & SEARCH */}
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setShowTrash(false)} className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all", !showTrash ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10")}>
                                    <span className="flex items-center gap-2"><HardDrive size={14} />Files ({files.length})</span>
                                </button>
                                <button onClick={() => setShowTrash(true)} className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all relative", showTrash ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10")}>
                                    <span className="flex items-center gap-2"><Trash2 size={14} />Trash {legacyTrashFiles.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-[10px] font-bold">{legacyTrashFiles.length}</span>}</span>
                                </button>
                                <div className="flex-1" />
                                <div className="relative max-w-xs group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={14} />
                                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/5 border border-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-indigo-500/30 transition-all" />
                                </div>
                            </div>

                            {/* CONTENT: UPLOAD & FILES */}
                            <div className="space-y-6">
                                {!showTrash && !currentFolderId && (
                                    <UploadZone onUpload={handleUpload} isUploading={isUploading} uploadProgress={uploadProgress} />
                                )}

                                {/* Folder Title if selected */}
                                {currentFolderId && (
                                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                        <FolderOpen size={20} className="text-indigo-400" />
                                        <h2 className="text-xl font-bold text-white">Current Folder</h2>
                                    </div>
                                )}

                                {showTrash && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                                        <AlertTriangle className="text-amber-400 shrink-0" size={18} />
                                        <div>
                                            <p className="text-sm text-amber-200 font-medium">Files in trash are automatically deleted after 10 days</p>
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    {isMegaLoading ? (
                                        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
                                    ) : filteredFiles.length === 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 rounded-2xl border border-dashed border-white/10">
                                            {showTrash ? (
                                                <>
                                                    <Trash2 className="mx-auto text-white/20 mb-4" size={40} />
                                                    <p className="text-white/40 font-medium">Trash is empty</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FolderOpen className="mx-auto text-white/20 mb-4" size={40} />
                                                    <p className="text-white/40 font-medium">{searchQuery ? 'No files match your search' : 'This folder is empty'}</p>
                                                </>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <AnimatePresence>
                                                {filteredFiles.map((file, i) => (
                                                    <FileCard
                                                        key={file.id}
                                                        file={file}
                                                        index={i}
                                                        isTrash={showTrash}
                                                        onView={handleView}
                                                        onDownload={handleDownload}
                                                        onDelete={moveToTrash}
                                                        onRestore={restoreFile}
                                                        onPermanentDelete={permanentDelete}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DndContext>
                </div>
            </div>
        </div>
    );
};

export default VaultPanel;
