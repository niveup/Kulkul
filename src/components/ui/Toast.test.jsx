/**
 * Tests for Toast Component & Provider
 * 
 * Verifies that the toast context provides functional methods,
 * toasts render with correct types, and auto-dismiss/manual-dismiss work.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider, useToast } from './Toast';

// Mock framer-motion as usual to avoid JSDOM animation issues
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            ...actual.motion,
            div: ({ children, ...props }) => <div {...props}>{children}</div>,
        },
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

// Test component to consume the toast hook
const TestConsumer = () => {
    const toast = useToast();
    return (
        <div>
            <button onClick={() => toast.success('Success Title', 'Success Message')}>
                Show Success
            </button>
            <button onClick={() => toast.error('Error Title', 'Error Message')}>
                Show Error
            </button>
            <button onClick={() => toast.dismissAll()}>
                Dismiss All
            </button>
        </div>
    );
};

describe('Toast System', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders children of ToastProvider', () => {
        render(
            <ToastProvider>
                <div data-testid="child">Child Content</div>
            </ToastProvider>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('shows a success toast when triggered', () => {
        render(
            <ToastProvider>
                <TestConsumer />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));

        expect(screen.getByText('Success Title')).toBeInTheDocument();
        expect(screen.getByText('Success Message')).toBeInTheDocument();
    });

    it('shows an error toast when triggered', () => {
        render(
            <ToastProvider>
                <TestConsumer />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Error'));

        expect(screen.getByText('Error Title')).toBeInTheDocument();
        expect(screen.getByText('Error Message')).toBeInTheDocument();
    });

    it('removes a toast when the close button is clicked', () => {
        render(
            <ToastProvider>
                <TestConsumer />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        expect(screen.getByText('Success Title')).toBeInTheDocument();

        // Find the dismiss button by its title
        const dismissBtn = screen.getByTitle('Dismiss');

        fireEvent.click(dismissBtn);
        expect(screen.queryByText('Success Title')).not.toBeInTheDocument();
    });

    it('auto-dismisses after duration', () => {
        render(
            <ToastProvider>
                <TestConsumer />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        expect(screen.getByText('Success Title')).toBeInTheDocument();

        // Advance timers by 5000ms (default duration)
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('Success Title')).not.toBeInTheDocument();
    });

    it('dismissAll removes all active toasts', () => {
        render(
            <ToastProvider>
                <TestConsumer />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        fireEvent.click(screen.getByText('Show Error'));

        expect(screen.getByText('Success Title')).toBeInTheDocument();
        expect(screen.getByText('Error Title')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Dismiss All'));

        expect(screen.queryByText('Success Title')).not.toBeInTheDocument();
        expect(screen.queryByText('Error Title')).not.toBeInTheDocument();
    });

    it('throws error when useToast is used outside provider', () => {
        // Suppress console.error for this test to avoid noise
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => render(<TestConsumer />)).toThrow('useToast must be used within a ToastProvider');

        consoleSpy.mockRestore();
    });
});
