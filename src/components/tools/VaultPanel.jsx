import React, { useState, useRef, useCallback } from 'react';
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
    Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVault, formatFileSize, formatRelativeTime } from '../../hooks/useVault';
import PdfViewerModal from './PdfViewerModal';

// =============================================================================
// FILE CARD COMPONENT
// =============================================================================


const FileCard = ({ file, index, onView, onDownload, onDelete, isTrash = false, onRestore, onPermanentDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPermanentConfirm, setShowPermanentConfirm] = useState(false);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            layout
            className={cn(
                "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
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
                    : "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-white/10"
            )}>
                <FileText size={20} className="text-red-400" />
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
                <div className="flex items-center gap-3 mt-1 text-xs text-white/40 font-medium">
                    <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase tracking-wider">PDF</span>
                    <span>{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    {isTrash ? (
                        <span className="text-amber-400">{file.daysRemaining} days left</span>
                    ) : (
                        <span>{formatRelativeTime(file.createdAt)}</span>
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
                        <div className="flex items-center gap-2">
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
                        className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0"
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
        const pdfFile = files.find(f => f.name.toLowerCase().endsWith('.pdf'));
        if (pdfFile) {
            onUpload(pdfFile);
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
                accept=".pdf"
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
                        <p className="text-xs text-white/60">Uploading to MEGA...</p>
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
                                {isDragging ? 'Drop to upload' : 'Drag PDF file here'}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                                or <span className="text-indigo-400">browse computer</span>
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
    const {
        files,
        trashFiles,
        isLoading,
        isUploading,
        uploadProgress,
        error,
        megaConnected,
        storageInfo,
        viewingPdf,
        pdfCache,
        uploadFile,
        moveToTrash,
        restoreFile,
        permanentDelete,
        viewPdf,
        closePdfViewer,
        downloadFile,
        refreshFiles,
        refreshTrash,
        clearError
    } = useVault();

    const [searchQuery, setSearchQuery] = useState('');
    const [showTrash, setShowTrash] = useState(false);

    // Filter files by search
    const displayFiles = showTrash ? trashFiles : files;
    const filteredFiles = displayFiles.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate storage percentage
    const storagePercent = Math.round((storageInfo.used / storageInfo.total) * 100);

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden pt-6">
            {/* PDF Viewer Modal */}
            <AnimatePresence>
                {viewingPdf && (
                    <PdfViewerModal file={viewingPdf} onClose={closePdfViewer} pdfCache={pdfCache} />
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6">
                {/* ERROR BANNER */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="text-red-400" size={18} />
                                <span className="text-sm text-red-200">{error}</span>
                            </div>
                            <button onClick={clearError} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={16} className="text-white/60" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HEADER */}
                <header className="mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight mb-1">
                                Vault
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-white/40 font-medium text-sm">
                                    Secure PDF Cloud Storage
                                </p>
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                                    megaConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                )}>
                                    {megaConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                                    {megaConnected ? 'Connected' : 'Connecting...'}
                                </div>
                            </div>
                        </div>

                        {/* Storage & Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { refreshFiles(); refreshTrash(); }}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <span className="text-xs font-bold text-white/80">{formatFileSize(storageInfo.used)}</span>
                                <span className="text-[10px] text-white/40">/ {formatFileSize(storageInfo.total)}</span>
                            </div>
                        </div>
                    </motion.div>
                </header>

                {/* TAB SWITCHER */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setShowTrash(false)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            !showTrash
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <HardDrive size={14} />
                            Files ({files.length})
                        </span>
                    </button>
                    <button
                        onClick={() => setShowTrash(true)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all relative",
                            showTrash
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Trash2 size={14} />
                            Trash
                            {trashFiles.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-[10px] font-bold">
                                    {trashFiles.length}
                                </span>
                            )}
                        </span>
                    </button>

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="relative max-w-xs group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/5 border border-white/5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-indigo-500/30 transition-all"
                        />
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Upload & Files */}
                    <div className="col-span-8 space-y-6">
                        {!showTrash && (
                            <UploadZone
                                onUpload={uploadFile}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                            />
                        )}

                        {/* Trash Info Banner */}
                        {showTrash && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
                            >
                                <AlertTriangle className="text-amber-400 shrink-0" size={18} />
                                <div>
                                    <p className="text-sm text-amber-200 font-medium">Files in trash are automatically deleted after 10 days</p>
                                    <p className="text-xs text-amber-200/60 mt-0.5">Permanent deletion also removes files from MEGA storage</p>
                                </div>
                            </motion.div>
                        )}

                        {/* File List */}
                        <div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-indigo-400" size={24} />
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 rounded-2xl border border-dashed border-white/10"
                                >
                                    {showTrash ? (
                                        <>
                                            <Trash2 className="mx-auto text-white/20 mb-4" size={40} />
                                            <p className="text-white/40 font-medium">Trash is empty</p>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mx-auto text-white/20 mb-4" size={40} />
                                            <p className="text-white/40 font-medium">
                                                {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
                                            </p>
                                            <p className="text-xs text-white/20 mt-1">
                                                Drag a PDF onto the upload zone to get started
                                            </p>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {filteredFiles.map((file, i) => (
                                            <FileCard
                                                key={file.id}
                                                file={file}
                                                index={i}
                                                isTrash={showTrash}
                                                onView={viewPdf}
                                                onDownload={downloadFile}
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

                    {/* RIGHT COLUMN: Stats */}
                    <div className="col-span-4 space-y-4">
                        {/* Storage Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5"
                        >
                            <h3 className="text-xs font-bold text-white/60 mb-4 uppercase tracking-wider">Storage</h3>

                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(#6366f1 ${storagePercent}%, rgba(255,255,255,0.05) ${storagePercent}%)`
                                    }}
                                />
                                <div className="absolute inset-2 rounded-full bg-[#09090b]" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">{storagePercent}%</span>
                                    <span className="text-[10px] text-white/40">Used</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Used</span>
                                    <span className="text-white font-medium">{formatFileSize(storageInfo.used)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Available</span>
                                    <span className="text-white font-medium">{formatFileSize(storageInfo.total - storageInfo.used)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                                    <AlertCircle size={14} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-200 text-xs mb-0.5">Click to View</h4>
                                    <p className="text-[10px] text-indigo-200/60 leading-relaxed">
                                        Click any file name to preview the PDF directly in the browser.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default VaultPanel;
