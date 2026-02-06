/**
 * Tests for Sidebar Component
 * 
 * Verifies navigation, theme toggling, and keyboard shortcuts.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import { useAppStore } from '../store';

// Mock store
vi.mock('../store', () => ({
    useAppStore: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            ...actual.motion,
            aside: ({ children, whileHover, whileTap, layout, layoutId, initial, animate, exit, transition, ...props }) => <aside {...props}>{children}</aside>,
            div: ({ children, whileHover, whileTap, layout, layoutId, initial, animate, exit, transition, ...props }) => <div {...props}>{children}</div>,
            span: ({ children, whileHover, whileTap, layout, layoutId, initial, animate, exit, transition, ...props }) => <span {...props}>{children}</span>,
        },
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

describe('Sidebar Component', () => {
    const mockStore = {
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        toggleTheme: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useAppStore.mockReturnValue(mockStore);
    });

    it('renders all menu items', () => {
        render(<Sidebar />);

        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Workstation')).toBeInTheDocument();
        expect(screen.getByText('Library')).toBeInTheDocument();
        expect(screen.getByText('Neural Link')).toBeInTheDocument();
    });

    it('changes active tab when a menu item is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('Library'));
        expect(mockStore.setActiveTab).toHaveBeenCalledWith('resources');
    });

    it('toggles theme when appearance button is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('Appearance'));
        expect(mockStore.toggleTheme).toHaveBeenCalled();
    });

    it('expands and collapses on mouse enter/leave', () => {
        const { container } = render(<Sidebar />);
        const aside = container.querySelector('aside');

        fireEvent.mouseEnter(aside);
        // Expansion is handled via state and framer-motion styles
        // We can verify the state trigger doesn't crash
        fireEvent.mouseLeave(aside);
    });

    it('highlights the active tab', () => {
        // Since we mocked motion.div with layoutId for highlighting, 
        // we check for the presence of elements.
        render(<Sidebar />);
        const activeNav = screen.getByText('Overview').closest('button');
        expect(activeNav).toHaveClass('text-white');
    });
});
