/**
 * Tests for AnimatedCounter Component
 * 
 * Verifies initial render, value parsing, and prefix/suffix application.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnimatedCounter from './AnimatedCounter';

// Mock framer-motion specifically for counter logic
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            span: ({ children, ...props }) => <span {...props}>{children}</span>,
        },
        useMotionValue: (initial) => {
            let val = initial;
            const listeners = new Set();
            return {
                set: (v) => {
                    val = v;
                    listeners.forEach(l => l(v));
                },
                get: () => val,
                on: (event, callback) => {
                    if (event === 'change') {
                        listeners.add(callback);
                        // Trigger immediately for sync test
                        callback(val);
                        return () => listeners.delete(callback);
                    }
                }
            };
        },
        useSpring: (mv) => mv, // Just pass through the mock motion value
    };
});

describe('AnimatedCounter Component', () => {
    it('renders with prefix and suffix', async () => {
        render(<AnimatedCounter value={100} prefix="$" suffix=" USD" />);
        expect(await screen.findByText('$100 USD')).toBeInTheDocument();
    });

    it('formats decimals correctly', async () => {
        render(<AnimatedCounter value={99.99} decimals={1} />);
        expect(await screen.findByText(/100.0/)).toBeInTheDocument();
    });

    it('handles string values by parsing them', async () => {
        render(<AnimatedCounter value="45.5 MB" decimals={1} />);
        expect(await screen.findByText('45.5')).toBeInTheDocument();
    });

    it('updates when value prop changes', async () => {
        const { rerender } = render(<AnimatedCounter value={10} />);
        expect(await screen.findByText('10')).toBeInTheDocument();

        rerender(<AnimatedCounter value={20} />);
        expect(await screen.findByText('20')).toBeInTheDocument();
    });
});
