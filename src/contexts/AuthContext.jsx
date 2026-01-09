
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // changing this to true default for dev, but will change to false for prod
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check session storage on load
        const sessionAuth = sessionStorage.getItem('isAuthenticated');
        if (sessionAuth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password) => {
        // In real impl, this will call API. For UI demo, we'll simulate.
        // HASH for 'bittu$7645' (simple verification for now, will move to server later)
        // For UI dev phase, we accept the raw string to test success animation
        if (password === 'bittu$7645') {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAuthenticated', 'true');
            return true;
        }
        return false;
    };

    const enterGuestMode = () => {
        setIsGuest(true);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsGuest(false);
        sessionStorage.removeItem('isAuthenticated');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isGuest, isLoading, login, logout, enterGuestMode }}>
            {children}
        </AuthContext.Provider>
    );
};
