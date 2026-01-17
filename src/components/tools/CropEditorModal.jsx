import React, { useState, useRef, useEffect, useCallback } from 'react';

const CropEditorModal = ({ isOpen, onClose, imageSrc, initialCrop, onSave }) => {
    const [crop, setCrop] = useState(initialCrop);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState(null);
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (initialCrop) {
            setCrop(initialCrop);
        }
    }, [initialCrop]);

    const handleImageLoad = (e) => {
        const img = e.target;
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

        // Calculate scale to fit in viewport
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        const scaleX = maxWidth / img.naturalWidth;
        const scaleY = maxHeight / img.naturalHeight;
        setScale(Math.min(scaleX, scaleY, 1));
    };

    const getMousePos = useCallback((e) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        };
    }, [scale]);

    const handleMouseDown = (e, handle = null) => {
        e.preventDefault();
        const pos = getMousePos(e);
        setDragStart(pos);

        if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
        }
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging && !isResizing) return;

        const pos = getMousePos(e);
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;

        if (isDragging) {
            setCrop(prev => ({
                ...prev,
                x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + dx)),
                y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + dy))
            }));
            setDragStart(pos);
        } else if (isResizing) {
            setCrop(prev => {
                const newCrop = { ...prev };

                if (resizeHandle.includes('e')) {
                    newCrop.width = Math.max(50, Math.min(imageSize.width - prev.x, prev.width + dx));
                }
                if (resizeHandle.includes('w')) {
                    const newWidth = Math.max(50, prev.width - dx);
                    const newX = prev.x + (prev.width - newWidth);
                    if (newX >= 0) {
                        newCrop.x = newX;
                        newCrop.width = newWidth;
                    }
                }
                if (resizeHandle.includes('s')) {
                    newCrop.height = Math.max(50, Math.min(imageSize.height - prev.y, prev.height + dy));
                }
                if (resizeHandle.includes('n')) {
                    const newHeight = Math.max(50, prev.height - dy);
                    const newY = prev.y + (prev.height - newHeight);
                    if (newY >= 0) {
                        newCrop.y = newY;
                        newCrop.height = newHeight;
                    }
                }

                return newCrop;
            });
            setDragStart(pos);
        }
    }, [isDragging, isResizing, dragStart, getMousePos, imageSize, resizeHandle]);

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove]);

    const handleSave = () => {
        onSave({
            x: Math.round(crop.x),
            y: Math.round(crop.y),
            width: Math.round(crop.width),
            height: Math.round(crop.height)
        });
        onClose();
    };

    if (!isOpen) return null;

    const scaledCrop = {
        x: crop.x * scale,
        y: crop.y * scale,
        width: crop.width * scale,
        height: crop.height * scale
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h3 style={{ color: '#fff', marginBottom: '15px', textAlign: 'center' }}>
                    Edit Diagram Crop
                </h3>

                <div
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        display: 'inline-block',
                        cursor: isDragging ? 'grabbing' : 'default'
                    }}
                >
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        alt="Source page"
                        onLoad={handleImageLoad}
                        style={{
                            display: 'block',
                            width: imageSize.width * scale,
                            height: imageSize.height * scale,
                            opacity: 0.4
                        }}
                    />

                    {/* Overlay to darken non-selected area */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none'
                    }}>
                        {/* Selected region highlight */}
                        <div style={{
                            position: 'absolute',
                            left: scaledCrop.x,
                            top: scaledCrop.y,
                            width: scaledCrop.width,
                            height: scaledCrop.height,
                            border: '2px dashed #00ff88',
                            backgroundColor: 'transparent',
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                            cursor: 'grab',
                            pointerEvents: 'auto'
                        }} onMouseDown={(e) => handleMouseDown(e)}>
                            {/* Resize handles */}
                            {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(handle => (
                                <div
                                    key={handle}
                                    onMouseDown={(e) => handleMouseDown(e, handle)}
                                    style={{
                                        position: 'absolute',
                                        width: handle.length === 1 ? '10px' : '12px',
                                        height: handle.length === 1 ? '10px' : '12px',
                                        backgroundColor: '#00ff88',
                                        borderRadius: '2px',
                                        cursor: `${handle}-resize`,
                                        ...(handle.includes('n') ? { top: '-6px' } : {}),
                                        ...(handle.includes('s') ? { bottom: '-6px' } : {}),
                                        ...(handle.includes('w') ? { left: '-6px' } : {}),
                                        ...(handle.includes('e') ? { right: '-6px' } : {}),
                                        ...(handle === 'n' || handle === 's' ? { left: '50%', transform: 'translateX(-50%)' } : {}),
                                        ...(handle === 'e' || handle === 'w' ? { top: '50%', transform: 'translateY(-50%)' } : {}),
                                        ...(handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se' ? {} : {})
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '15px',
                    gap: '10px'
                }}>
                    <span style={{ color: '#888', fontSize: '12px' }}>
                        x: {Math.round(crop.x)}, y: {Math.round(crop.y)},
                        w: {Math.round(crop.width)}, h: {Math.round(crop.height)}
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#333',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#00ff88',
                                color: '#000',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Save Crop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropEditorModal;
