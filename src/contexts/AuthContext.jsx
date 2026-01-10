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

    // Check if user has valid session (cookie is automatically sent)
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth', {
                method: 'GET',
                credentials: 'include', // Include cookies
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    setIsAuthenticated(true);
                    setIsGuest(false);
                } else {
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
