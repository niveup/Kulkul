/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the whole app.
 * 
 * Industry standard for production React applications.
 */

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { cn } from '../../lib/utils';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({ errorInfo });

        // In production, you would send this to an error tracking service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Optionally reload the page
        // window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={cn(
                    'min-h-screen flex items-center justify-center p-6',
                    'bg-gradient-to-br from-slate-50 to-slate-100',
                    'dark:from-slate-950 dark:to-slate-900'
                )}>
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={cn(
                            'max-w-lg w-full',
                            'bg-white dark:bg-slate-900',
                            'rounded-3xl',
                            'border border-slate-200 dark:border-slate-800',
                            'shadow-xl shadow-slate-200/50 dark:shadow-none',
                            'overflow-hidden'
                        )}
                    >
                        {/* Header */}
                        <div className="p-8 pb-0 text-center">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className={cn(
                                    'inline-flex items-center justify-center',
                                    'w-20 h-20 rounded-full mb-6',
                                    'bg-gradient-to-br from-rose-100 to-rose-50',
                                    'dark:from-rose-900/30 dark:to-rose-800/30'
                                )}
                            >
                                <AlertTriangle
                                    size={36}
                                    className="text-rose-500 dark:text-rose-400"
                                />
                            </motion.div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Oops! Something went wrong
                            </h1>

                            {/* Description */}
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                We encountered an unexpected error. Don't worry, your data is safe.
                                Try refreshing the page or going back to the home screen.
                            </p>
                        </div>

                        {/* Error details (collapsible in production) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mx-8 mt-6">
                                <details className="group">
                                    <summary className={cn(
                                        'flex items-center gap-2 cursor-pointer',
                                        'text-sm font-medium text-slate-500 dark:text-slate-400',
                                        'hover:text-slate-700 dark:hover:text-slate-300',
                                        'transition-colors'
                                    )}>
                                        <Bug size={16} />
                                        <span>Error Details (Dev Mode)</span>
                                    </summary>
                                    <div className={cn(
                                        'mt-3 p-4 rounded-xl',
                                        'bg-slate-100 dark:bg-slate-800',
                                        'text-xs font-mono text-slate-600 dark:text-slate-300',
                                        'overflow-x-auto',
                                        'max-h-40 overflow-y-auto'
                                    )}>
                                        <p className="text-rose-600 dark:text-rose-400 font-semibold mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <pre className="whitespace-pre-wrap text-slate-500 dark:text-slate-400">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="p-8 flex flex-col sm:flex-row gap-3">
                            <motion.button
                                onClick={this.handleReset}
                                className={cn(
                                    'flex-1 inline-flex items-center justify-center gap-2',
                                    'px-6 py-3 rounded-xl',
                                    'bg-gradient-to-r from-indigo-600 to-indigo-500',
                                    'text-white font-semibold',
                                    'shadow-lg shadow-indigo-500/30',
                                    'hover:shadow-xl hover:shadow-indigo-500/40',
                                    'transition-all duration-200'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </motion.button>

                            <motion.button
                                onClick={this.handleGoHome}
                                className={cn(
                                    'flex-1 inline-flex items-center justify-center gap-2',
                                    'px-6 py-3 rounded-xl',
                                    'bg-slate-100 dark:bg-slate-800',
                                    'text-slate-700 dark:text-slate-200 font-semibold',
                                    'border border-slate-200 dark:border-slate-700',
                                    'hover:bg-slate-200 dark:hover:bg-slate-700',
                                    'transition-all duration-200'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Home size={18} />
                                Go Home
                            </motion.button>
                        </div>

                        {/* Support Link */}
                        <div className="px-8 pb-8 text-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                If this problem persists, please{' '}
                                <a
                                    href="mailto:support@studyhub.com"
                                    className="text-indigo-500 hover:text-indigo-600 underline"
                                >
                                    contact support
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Functional wrapper for easier use
 */
export const withErrorBoundary = (Component, fallback = null) => {
    return function WrappedComponent(props) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};

/**
 * Hook for programmatic error throwing (for testing)
 */
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);

    if (error) {
        throw error;
    }

    return setError;
};

export default ErrorBoundary;
