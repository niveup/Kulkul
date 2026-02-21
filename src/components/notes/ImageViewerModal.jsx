import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Maximize, Edit3, Trash2, Check, Download, Palette, MousePointer2, Move, AlertTriangle, Loader2 } from 'lucide-react';
import { cn, ensureAbsoluteUrl } from '../../lib/utils';
import { useAnnotationUploadQueue } from '../../hooks/useAnnotationUploadQueue';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#000000'];

const ImageViewerModal = ({ isOpen, imageObj, noteId, onClose, onUpdateImage, onDeleteImage }) => {
    const { uploadAnnotation, isUploading } = useAnnotationUploadQueue();
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Modes
    const [mode, setMode] = useState('pan'); // 'pan' | 'draw'

    // Deletion Modal State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Drawing State
    const [color, setColor] = useState(COLORS[0]);
    const [isDrawing, setIsDrawing] = useState(false);

    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const actualUrl = typeof imageObj === 'string' ? imageObj : imageObj?.url;

    // Initialize Canvas on Open
    useEffect(() => {
        if (!isOpen || !canvasRef.current || !imageRef.current) return;

        const canvas = canvasRef.current;
        const img = imageRef.current;

        // Ensure canvas perfectly overlays the image dimensions
        const setupCanvas = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';

            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 5;
            contextRef.current = ctx;
        };

        if (img.complete) {
            setupCanvas();
        } else {
            img.onload = setupCanvas;
        }

        // Reset state on open
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setMode('pan');

    }, [isOpen, actualUrl]);

    // Handle Pan logic
    const handlePointerDown = (e) => {
        if (mode === 'pan') {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        } else if (mode === 'draw' && contextRef.current) {
            // Draw logic
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            // Calculate exact position based on current scale and translation
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);

            contextRef.current.strokeStyle = color;
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const handlePointerMove = (e) => {
        if (mode === 'pan' && isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        } else if (mode === 'draw' && isDrawing && contextRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);

            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        }
    };

    const handlePointerUp = () => {
        if (mode === 'pan') {
            setIsDragging(false);
        } else if (mode === 'draw' && isDrawing && contextRef.current) {
            contextRef.current.closePath();
            setIsDrawing(false);
        }
    };

    // Zoom Handling
    const handleWheel = (e) => {
        if (e.ctrlKey || mode === 'pan') {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.1;
            setScale(prev => Math.min(Math.max(0.1, prev + delta), 4));
        }
    };

    // Actions
    const clearCanvas = () => {
        if (!canvasRef.current || !contextRef.current) return;
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const downloadImage = () => {
        // Merge image and canvas for download
        saveMergedImage((mergedUrl) => {
            const link = document.createElement('a');
            link.download = `annotated-${Date.now()}.png`;
            link.href = mergedUrl;
            link.click();
        });
    };

    const saveMergedImage = (callback) => {
        if (!canvasRef.current || !imageRef.current) return;

        const img = imageRef.current;
        const drawCanvas = canvasRef.current;

        // Create an offscreen merge canvas
        const mergeCanvas = document.createElement('canvas');
        mergeCanvas.width = img.naturalWidth;
        mergeCanvas.height = img.naturalHeight;

        const ctx = mergeCanvas.getContext('2d');

        // Ensure CORS allows drawing if it's an external URL (though local blobs usually work)
        try {
            // Draw base image
            ctx.drawImage(img, 0, 0);
            // Draw annotations on top
            ctx.drawImage(drawCanvas, 0, 0);

            const dataUrl = mergeCanvas.toDataURL('image/webp', 0.9);
            callback(dataUrl);
        } catch (e) {
            console.error("Failed to merge canvas. CORS issue or tainted canvas.", e);
            // Fallback: Just return current image if we can't merge
            callback(actualUrl);
        }
    };

    const handleUpdate = async () => {
        saveMergedImage(async (dataUrl) => {
            // If dataUrl is same as original, no drawing was made
            if (dataUrl === actualUrl) {
                onClose();
                return;
            }

            // Upload to Telegram via the queue hook
            const result = await uploadAnnotation(noteId, imageObj, dataUrl);

            if (result.queued) {
                console.log('[ImageViewer] Upload queued for retry — base64 saved as fallback');
            }

            onClose();
        });
    };

    if (!isOpen || !actualUrl) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-md select-none touch-none"
                onWheel={handleWheel}
            >
                {/* Top Action Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-b from-slate-950/80 to-transparent z-10 pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl">
                        <button
                            onClick={() => { setMode('pan'); setScale(1); setPosition({ x: 0, y: 0 }); }}
                            className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                            title="Reset View"
                        >
                            <Maximize size={18} />
                        </button>
                        <div className="w-px h-6 bg-slate-700/50 mx-1" />
                        <button
                            onClick={() => setScale(s => Math.max(0.1, s - 0.25))}
                            className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                            title="Zoom Out"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <div className="px-2 font-mono text-sm text-slate-400 font-bold min-w-[3rem] text-center">
                            {Math.round(scale * 100)}%
                        </div>
                        <button
                            onClick={() => setScale(s => Math.min(4, s + 0.25))}
                            className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                            title="Zoom In"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl">
                        <button
                            onClick={() => setMode('pan')}
                            className={cn("p-2.5 flex items-center gap-2 rounded-xl transition-all font-bold text-sm", mode === 'pan' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50")}
                        >
                            <Move size={16} /> <span className="hidden sm:inline">Pan</span>
                        </button>
                        <button
                            onClick={() => setMode('draw')}
                            className={cn("p-2.5 flex items-center gap-2 rounded-xl transition-all font-bold text-sm", mode === 'draw' ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50")}
                        >
                            <Edit3 size={16} /> <span className="hidden sm:inline">Draw</span>
                        </button>

                        {mode === 'draw' && (
                            <>
                                <div className="w-px h-6 bg-slate-700/50 mx-1" />
                                <div className="flex items-center gap-1.5 px-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={cn("w-6 h-6 rounded-full border-2 transition-transform", color === c ? "scale-110 border-white" : "border-transparent opacity-70 hover:opacity-100")}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <div className="w-px h-6 bg-slate-700/50 mx-1" />
                                <button
                                    onClick={clearCanvas}
                                    className="p-2.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all group"
                                    title="Erase All Drawings"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={handleUpdate}
                            disabled={isUploading}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all border",
                                isUploading
                                    ? "bg-emerald-600/50 border-emerald-500/20 cursor-wait"
                                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 border-emerald-400/20"
                            )}
                        >
                            {isUploading ? (
                                <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                            ) : (
                                <><Check size={18} /> Save Update</>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 shadow-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main View Area */}
                <div
                    ref={containerRef}
                    className={cn(
                        "w-full h-full flex items-center justify-center overflow-hidden",
                        mode === 'pan' ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"
                    )}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <motion.div
                        className="relative origin-center"
                        style={{
                            scale,
                            x: position.x,
                            y: position.y
                        }}
                    >
                        {/* The Image */}
                        <img
                            ref={imageRef}
                            src={ensureAbsoluteUrl(actualUrl)}
                            alt="Viewer"
                            className="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none rounded-sm shadow-2xl"
                            crossOrigin="anonymous" // IMPORTANT: Try to allow CORS for canvas drawing
                        />

                        {/* The Drawing Canvas overlay perfectly matching image size */}
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 touch-none pointer-events-none"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </motion.div>
                </div>

                {/* Bottom Action Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto bg-slate-900/80 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl">
                    <button
                        onClick={downloadImage}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all text-sm font-bold"
                    >
                        <Download size={16} /> Download Copy
                    </button>

                    <div className="w-px h-6 bg-slate-700/50 mx-1" />

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all text-sm font-bold"
                    >
                        <Trash2 size={16} /> Delete Image
                    </button>
                </div>

                {/* Custom Deletion Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md touch-none pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 10, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-[420px] p-8 rounded-[32px] border-2 border-slate-800 bg-slate-900/95 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
                            >
                                {/* Background glow effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />

                                <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 text-red-500 flex items-center justify-center mb-6 relative z-10 shadow-inner">
                                    <AlertTriangle size={36} strokeWidth={1.5} />
                                </div>

                                <h3 className="text-2xl font-black text-white tracking-tight mb-3 relative z-10">
                                    Say Goodbye?
                                </h3>

                                <p className="text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
                                    This isn't a drill. Once you delete this image, it's permanently vanished into the digital void. We can't recover it. Ready to let it go?
                                </p>

                                <div className="flex gap-3 w-full relative z-10">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 hover:border-slate-600 shadow-sm"
                                    >
                                        Keep it
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDeleteImage(noteId, actualUrl);
                                            setShowDeleteConfirm(false);
                                            onClose();
                                        }}
                                        className="flex-1 py-3.5 px-2 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/25 border border-red-400/20 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} /> Yes, Trash It
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageViewerModal;
