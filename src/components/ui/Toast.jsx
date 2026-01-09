import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// =============================================================================
// Toast Context & Provider
// =============================================================================

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast types with their configurations
const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        className: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
        iconClass: 'text-emerald-500',
        progressClass: 'bg-emerald-500',
    },
    error: {
        icon: XCircle,
        className: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
        iconClass: 'text-rose-500',
        progressClass: 'bg-rose-500',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
        iconClass: 'text-amber-500',
        progressClass: 'bg-amber-500',
    },
    info: {
        icon: Info,
        className: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800',
        iconClass: 'text-sky-500',
        progressClass: 'bg-sky-500',
    },
};

// Individual Toast Component
const Toast = ({ id, type = 'info', title, message, duration = 5000, onDismiss }) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`
        relative overflow-hidden
        w-80 max-w-[calc(100vw-2rem)]
        border rounded-2xl shadow-lg
        backdrop-blur-xl
        ${config.className}
      `}
        >
            {/* Content */}
            <div className="flex gap-3 p-4">
                <div className={`flex-shrink-0 ${config.iconClass}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-0.5">
                            {title}
                        </h4>
                    )}
                    {message && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {message}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => onDismiss(id)}
                    className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Auto-dismiss progress bar */}
            {duration > 0 && (
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 h-1 ${config.progressClass}`}
                />
            )}
        </motion.div>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, dismissToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} onDismiss={dismissToast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        setToasts((prev) => [...prev, { id, type, title, message, duration }]);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                dismissToast(id);
            }, duration);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const dismissAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods
    const toast = {
        success: (title, message, duration) => addToast({ type: 'success', title, message, duration }),
        error: (title, message, duration) => addToast({ type: 'error', title, message, duration }),
        warning: (title, message, duration) => addToast({ type: 'warning', title, message, duration }),
        info: (title, message, duration) => addToast({ type: 'info', title, message, duration }),
        custom: addToast,
        dismiss: dismissToast,
        dismissAll: dismissAllToasts,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} dismissToast={dismissToast} />
        </ToastContext.Provider>
    );
};

export default ToastProvider;
