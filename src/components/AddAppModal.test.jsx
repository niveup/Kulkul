/**
 * Tests for AddAppModal Component
 * 
 * Verifies form validation, favicon fetching, icon library selection,
 * and save/cancel logic in both Add and Edit modes.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddAppModal from './AddAppModal';

// Mock framer-motion
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

// Mock window.Image for favicon fetching
class MockImage {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.src = '';

        // Trigger onload/onerror after a short delay in tests
        setTimeout(() => {
            if (this.src.includes('error')) {
                this.onerror?.();
            } else {
                this.onload?.();
            }
        }, 10);
    }
}
global.window.Image = MockImage;

describe('AddAppModal Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders heading and inputs when open', () => {
        render(<AddAppModal {...defaultProps} />);
        expect(screen.getByText('Add App')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('App Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
    });

    it('validates required fields for Save button', () => {
        render(<AddAppModal {...defaultProps} />);
        const saveBtn = screen.getByText('Add App', { selector: 'button' });

        // Initially disabled because name and url are empty
        expect(saveBtn).toBeDisabled();

        // Fill name
        fireEvent.change(screen.getByPlaceholderText('App Name'), { target: { value: 'My App' } });
        // Still disabled (no URL and auto mode)
        expect(saveBtn).toBeDisabled();

        // Fill URL
        fireEvent.change(screen.getByPlaceholderText('https://...'), { target: { value: 'https://google.com' } });
        // Should be enabled now
        expect(saveBtn).not.toBeDisabled();
    });

    it('switches to custom icon library mode', () => {
        render(<AddAppModal {...defaultProps} />);

        const libBtn = screen.getByTitle('Icon Library');
        fireEvent.click(libBtn);

        // Should show icon categories
        expect(screen.getByText('ESSENTIALS')).toBeInTheDocument();
    });

    it('selects an icon from the library', () => {
        render(<AddAppModal {...defaultProps} />);
        fireEvent.click(screen.getByTitle('Icon Library'));

        const calcIcon = screen.getByTitle('Calculator');
        fireEvent.click(calcIcon);

        expect(calcIcon).toHaveClass('bg-indigo-600');
    });

    it('fetches favicon when URL is entered', async () => {
        render(<AddAppModal {...defaultProps} />);

        const urlInput = screen.getByPlaceholderText('https://...');
        fireEvent.change(urlInput, { target: { value: 'https://github.com' } });

        // Should show preview image (eventually)
        // Our mock Image triggers onload in 10ms
        const previewImg = await screen.findByAltText('Preview');
        expect(previewImg).toHaveAttribute('src', expect.stringContaining('github.com'));
    });

    it('calls onSave with correct data in Add mode', () => {
        render(<AddAppModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText('App Name'), { target: { value: 'Test App' } });
        fireEvent.change(screen.getByPlaceholderText('https://...'), { target: { value: 'https://test.com' } });

        // Click save button (which has the "Add App" text)
        fireEvent.click(screen.getByText('Add App', { selector: 'button' }));

        expect(defaultProps.onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test App',
                url: 'https://test.com',
                isCustom: true
            }),
            false
        );
    });

    it('populates fields in Edit mode', () => {
        const initialData = {
            id: '123',
            name: 'Existing App',
            url: 'https://old.com',
            icon: 'Terminal',
            isCustom: true
        };

        render(<AddAppModal {...defaultProps} initialData={initialData} />);

        expect(screen.getByText('Edit App')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Existing App')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://old.com')).toBeInTheDocument();
    });

    it('cancels changes when Close or Cancel is clicked', () => {
        render(<AddAppModal {...defaultProps} />);

        fireEvent.click(screen.getByText('Cancel'));
        expect(defaultProps.onClose).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('Close Modal'));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
    });
});
