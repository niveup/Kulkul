/**
 * Tests for FluidInput Component
 * 
 * Verifies input interactions, focus states, loading state,
 * and callback triggers for change and submit.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FluidInput from './FluidInput';

// Mock framer-motion (Proxy version for better support)
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

describe('FluidInput Component', () => {
    it('renders with placeholder', () => {
        render(<FluidInput placeholder="Type here..." />);
        expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('triggers onChange when typing', () => {
        const onChange = vi.fn();
        render(<FluidInput onChange={onChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Hello' } });

        expect(onChange).toHaveBeenCalledWith('Hello');
    });

    it('triggers onSubmit when Enter is pressed', () => {
        const onSubmit = vi.fn();
        render(<FluidInput value="Test message" onSubmit={onSubmit} />);

        const input = screen.getByRole('textbox');
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(onSubmit).toHaveBeenCalledWith('Test message');
    });

    it('shows loading state properly', () => {
        render(<FluidInput isLoading={true} />);
        expect(screen.getByPlaceholderText('Thinking...')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('shows clear and submit buttons when value is present', () => {
        const onChange = vi.fn();
        render(<FluidInput value="Some text" onChange={onChange} />);

        expect(screen.getByTitle('Clear input')).toBeInTheDocument();
        expect(screen.getByTitle('Send message')).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', () => {
        const onChange = vi.fn();
        render(<FluidInput value="Old" onChange={onChange} />);

        fireEvent.click(screen.getByTitle('Clear input'));

        expect(onChange).toHaveBeenCalledWith('');
    });
});
