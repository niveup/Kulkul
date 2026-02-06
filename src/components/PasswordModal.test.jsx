/**
 * Tests for PasswordModal Component
 * 
 * Verifies security entry flows, guest mode toggle,
 * and error shake animations (mocked).
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PasswordModal from './PasswordModal';
import { useAuth } from '../contexts/AuthContext';

// Mock Auth Context
vi.mock('../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
    default: { Provider: ({ children }) => <div>{children}</div> }
}));

// Mock framer-motion with our smart proxy
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: new Proxy(actual.motion, {
            get: (target, prop) => {
                if (typeof prop === 'string' && /^[a-z]/.test(prop)) {
                    return ({ children, whileHover, whileTap, layout, layoutId, initial, animate, exit, transition, ...props }) =>
                        React.createElement(prop, props, children);
                }
                return target[prop];
            },
        }),
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

describe('PasswordModal Component', () => {
    const mockAuth = {
        isAuthenticated: false,
        isGuest: false,
        login: vi.fn(),
        enterGuestMode: vi.fn(),
        error: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue(mockAuth);
    });

    it('renders nothing when authenticated', () => {
        useAuth.mockReturnValue({ ...mockAuth, isAuthenticated: true });
        const { container } = render(<PasswordModal />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when in guest mode', () => {
        useAuth.mockReturnValue({ ...mockAuth, isGuest: true });
        const { container } = render(<PasswordModal />);
        expect(container.firstChild).toBeNull();
    });

    it('renders login form when unauthenticated', () => {
        render(<PasswordModal />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
        expect(screen.getByText('Unlock Dashboard')).toBeInTheDocument();
    });

    it('submits password correctly', async () => {
        const loginMock = vi.fn().mockResolvedValue(true);
        useAuth.mockReturnValue({ ...mockAuth, login: loginMock });

        render(<PasswordModal />);

        const input = screen.getByPlaceholderText('Enter Password');
        fireEvent.change(input, { target: { value: 'secret' } });

        const submitBtn = screen.getByText('Unlock Dashboard');
        fireEvent.click(submitBtn);

        expect(loginMock).toHaveBeenCalledWith('secret');
        // Success view should appear
        expect(await screen.findByText('Access Granted')).toBeInTheDocument();
    });

    it('shows error on failed login', async () => {
        const loginMock = vi.fn().mockResolvedValue(false);
        useAuth.mockReturnValue({ ...mockAuth, login: loginMock });

        render(<PasswordModal />);

        const input = screen.getByPlaceholderText('Enter Password');
        fireEvent.change(input, { target: { value: 'wrong' } });

        fireEvent.click(screen.getByText('Unlock Dashboard'));

        expect(loginMock).toHaveBeenCalledWith('wrong');
        // It stays on the login screen (Access Granted not present)
        expect(screen.queryByText('Access Granted')).not.toBeInTheDocument();
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('enters guest mode when button clicked', () => {
        render(<PasswordModal />);

        const guestBtn = screen.getByText(/Guest Mode/i);
        fireEvent.click(guestBtn);

        expect(mockAuth.enterGuestMode).toHaveBeenCalled();
    });
});
