/**
 * Tests for GlassPanel Component
 * 
 * Verifies rendering of children, variant class application,
 * and glow effect logic.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlassPanel, { materialVariants } from './GlassPanel';

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
    };
});

describe('GlassPanel Component', () => {
    it('renders children correctly', () => {
        render(
            <GlassPanel>
                <div data-testid="content">Hello World</div>
            </GlassPanel>
        );
        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('applies the correct classes for the base variant', () => {
        const { container } = render(<GlassPanel />);
        const panel = container.firstChild;

        expect(panel).toHaveClass(materialVariants.base.blur);
        expect(panel).toHaveClass(materialVariants.base.opacity);
    });

    it('applies the correct classes for the thick variant', () => {
        const { container } = render(<GlassPanel variant="thick" />);
        const panel = container.firstChild;

        expect(panel).toHaveClass(materialVariants.thick.blur);
        expect(panel).toHaveClass(materialVariants.thick.opacity);
    });

    it('applies the correct classes for the thin variant', () => {
        const { container } = render(<GlassPanel variant="thin" />);
        const panel = container.firstChild;

        expect(panel).toHaveClass(materialVariants.thin.blur);
        expect(panel).toHaveClass(materialVariants.thin.opacity);
    });

    it('applies glow classes when glow prop is true', () => {
        const { container } = render(<GlassPanel glow glowColor="cyan" />);
        const panel = container.firstChild;

        expect(panel).toHaveClass('shadow-cyan-500/20');
    });

    it('applies custom className correctly', () => {
        const { container } = render(<GlassPanel className="custom-test-class" />);
        const panel = container.firstChild;

        expect(panel).toHaveClass('custom-test-class');
    });

    it('respects the padding prop', () => {
        const { container, rerender } = render(<GlassPanel padding={true} />);
        expect(container.firstChild).toHaveClass('p-6');

        rerender(<GlassPanel padding={false} />);
        expect(container.firstChild).not.toHaveClass('p-6');
    });

    it('renders as a custom element type', () => {
        const { container } = render(<GlassPanel as="section" />);
        // Since we mocked motion.section would be motion['section']
        // Our mock returns a div for everything currently in the generic motion.div
        // Let's check if the element exists.
        expect(container.querySelector('section')).toBeInTheDocument();
    });
});
