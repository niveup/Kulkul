/**
 * AuthContext - Frontend Authentication State Management
 * 
 * This context manages:
 * - isAuthenticated: User logged in with password (has valid session cookie)
 * - isGuest: User in guest mode (localStorage only, no DB/AI access)
 * - isLoading: Initial auth check in progress
 * 
 * Uses HttpOnly cookies set by /api/auth - no token stored in JavaScript
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Detect if running on localhost (development mode)
    const isLocalhost = () => {
        const hostname = window.location.hostname;
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.');
    };

    // Check if user has valid session (cookie is automatically sent)
    const checkAuthStatus = async () => {
        try {
            // Development mode: auto-authenticate on localhost
            if (isLocalhost()) {
                console.log('[Auth] Localhost detected - auto-authenticating');
                setIsAuthenticated(true);
                setIsGuest(false);
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/auth', {
                method: 'GET',
                credentials: 'include', // Include cookies
            });

            if (response.ok) {
                // Check if response is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    if (data.authenticated) {
                        setIsAuthenticated(true);
                        setIsGuest(false);
                    } else {
                        setIsAuthenticated(false);
                    }
                } else {
                    // API implementation missing or returning HTML fallback
                    // console.warn('[Auth] API not ready or returning HTML. Defaulting to unauthenticated.');
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('[Auth] Status check failed:', err);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Login with password
    const login = useCallback(async (password) => {
        setError(null);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                credentials: 'include', // Include cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsAuthenticated(true);
                setIsGuest(false);
                return true;
            } else {
                setError(data.error || 'Invalid credentials');
                return false;
            }
        } catch (err) {
            console.error('[Auth] Login failed:', err);
            setError('Connection error. Please try again.');
            return false;
        }
    }, []);

    // Enter guest mode (localStorage only, no DB/AI)
    const enterGuestMode = useCallback(() => {
        setIsGuest(true);
        setIsAuthenticated(false);
        // Store guest status in sessionStorage for refresh persistence
        sessionStorage.setItem('guestMode', 'true');
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth', {
                method: 'DELETE',
                credentials: 'include',
            });
        } catch (err) {
            console.error('[Auth] Logout request failed:', err);
        }

        setIsAuthenticated(false);
        setIsGuest(false);
        sessionStorage.removeItem('guestMode');
    }, []);

    // Check for guest mode on initial load
    useEffect(() => {
        if (!isAuthenticated && sessionStorage.getItem('guestMode') === 'true') {
            setIsGuest(true);
        }
    }, [isAuthenticated]);

    const value = {
        isAuthenticated,
        isGuest,
        isLoading,
        error,
        login,
        logout,
        enterGuestMode,
        checkAuthStatus, // Expose for manual refresh
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
