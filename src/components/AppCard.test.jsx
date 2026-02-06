/**
 * Tests for AppCard Component
 * 
 * Verifies rendering, interactions (hover, click, 3D tilt logic), 
 * and conditional rendering for custom apps.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppCard, { AddAppCard } from './AppCard';

// Mock framer-motion to avoid animation issues in jsdom
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
        useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
        useSpring: (v) => v,
        useTransform: () => ({ get: () => '' }),
    };
});

describe('AppCard Component', () => {
    const mockApp = {
        id: 'test-app',
        name: 'Test Application',
        description: 'A test description for the application.',
        url: 'https://example.com',
        icon: 'Globe',
        isCustom: false,
    };

    const mockHandlers = {
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.open
        vi.stubGlobal('open', vi.fn());
    });

    it('renders app information correctly', () => {
        render(<AppCard app={mockApp} index={0} />);

        expect(screen.getByText('Test Application')).toBeInTheDocument();
        expect(screen.getByText('A test description for the application.')).toBeInTheDocument();
    });

    it('opens the URL when clicked', () => {
        render(<AppCard app={mockApp} index={0} />);

        const card = screen.getByRole('button', { name: /test application/i });
        fireEvent.click(card);

        expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });

    it('handles Enter key for accessibility', () => {
        render(<AppCard app={mockApp} index={0} />);

        const card = screen.getByRole('button', { name: /test application/i });
        fireEvent.keyDown(card, { key: 'Enter' });

        expect(window.open).toHaveBeenCalled();
    });

    it('shows edit and delete buttons only for custom apps', () => {
        const customApp = { ...mockApp, isCustom: true };
        const { rerender } = render(<AppCard app={customApp} index={0} {...mockHandlers} />);

        expect(screen.getByRole('button', { name: /edit app/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete app/i })).toBeInTheDocument();

        // Rerender as non-custom
        rerender(<AppCard app={mockApp} index={0} {...mockHandlers} />);
        expect(screen.queryByRole('button', { name: /edit app/i })).not.toBeInTheDocument();
    });

    it('calls onEdit and onDelete when custom buttons are clicked', () => {
        const customApp = { ...mockApp, isCustom: true };
        render(<AppCard app={customApp} index={0} {...mockHandlers} />);

        fireEvent.click(screen.getByRole('button', { name: /edit app/i }));
        expect(mockHandlers.onEdit).toHaveBeenCalledWith(customApp);

        fireEvent.click(screen.getByRole('button', { name: /delete app/i }));
        expect(mockHandlers.onDelete).toHaveBeenCalledWith(customApp);
    });

    it('updates hover state on mouse events', () => {
        render(<AppCard app={mockApp} index={0} />);
        const card = screen.getByRole('button', { name: /test application/i });

        fireEvent.mouseEnter(card);
        fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
        fireEvent.mouseLeave(card);
    });
});

describe('AddAppCard Component', () => {
    it('renders and responds to clicks', () => {
        const onClick = vi.fn();
        render(<AddAppCard onClick={onClick} />);

        expect(screen.getByText('Add New App')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });
});
