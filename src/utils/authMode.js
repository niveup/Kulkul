/**
 * Auth Mode Utilities
 * 
 * Synchronous utilities to check auth mode from localStorage/sessionStorage.
 * Used in places where useAuth() hook cannot be used (e.g., outside AuthProvider).
 */

// Check if currently in guest mode (stored in sessionStorage by AuthContext)
export const isGuestMode = () => {
    return sessionStorage.getItem('guestMode') === 'true';
};

// Check if on localhost (development = auto-authenticated)
export const isLocalhost = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.');
};

// Check if we should use local-only storage (guest mode AND not localhost)
export const shouldUseLocalStorage = () => {
    // On localhost, we're auto-authenticated, so use API
    if (isLocalhost()) {
        return false;
    }
    // Otherwise, check if user is in guest mode
    return isGuestMode();
};

// Helper to conditionally call API or skip
export const conditionalFetch = async (url, options = {}) => {
    if (shouldUseLocalStorage()) {
        console.log('[Auth] Guest mode - skipping API call:', url);
        return null;
    }
    return fetch(url, options);
};
