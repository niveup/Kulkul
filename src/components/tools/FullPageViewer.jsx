import React from 'react';
import { X } from 'lucide-react';

const FullPageViewer = ({ isOpen, onClose, imageSrc }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'relative',
                    maxWidth: '90vw',
                    maxHeight: '90vh'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '0',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px'
                    }}
                >
                    <X size={16} />
                    Close
                </button>

                {/* Full page image */}
                <img
                    src={imageSrc}
                    alt="Full page view"
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        border: '2px solid #444',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                    }}
                />
            </div>
        </div>
    );
};

export default FullPageViewer;
