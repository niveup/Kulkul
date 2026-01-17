/**
 * Vitest Test Setup
 * 
 * This file runs before each test file to set up the testing environment.
 * It configures:
 * - DOM testing utilities from @testing-library/jest-dom
 * - Mocks for browser APIs not available in jsdom
 * - Common mocks for third-party libraries
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test to prevent memory leaks and test pollution
afterEach(() => {
    cleanup();
});

// =============================================================================
// Browser API Mocks
// =============================================================================

// Mock matchMedia (used by responsive components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver (used by many UI components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver (used for lazy loading)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
}));

// Mock scrollTo (used by navigation)
window.scrollTo = vi.fn();

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock crypto.randomUUID (used for generating IDs)
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
    },
});

// =============================================================================
// Third-Party Library Mocks
// =============================================================================

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        // Provide simple div replacements for motion components
        motion: {
            div: ({ children, ...props }) => {
                // Filter out motion-specific props
                const {
                    initial, animate, exit, transition, variants,
                    whileHover, whileTap, whileFocus, whileInView,
                    onAnimationStart, onAnimationComplete,
                    ...htmlProps
                } = props;
                return <div {...htmlProps}>{children}</div>;
            },
            span: ({ children, ...props }) => {
                const { initial, animate, exit, transition, variants, ...htmlProps } = props;
                return <span {...htmlProps}>{children}</span>;
            },
            button: ({ children, ...props }) => {
                const { initial, animate, exit, transition, variants, whileHover, whileTap, ...htmlProps } = props;
                return <button {...htmlProps}>{children}</button>;
            },
            ul: ({ children, ...props }) => {
                const { initial, animate, exit, transition, variants, ...htmlProps } = props;
                return <ul {...htmlProps}>{children}</ul>;
            },
            li: ({ children, ...props }) => {
                const { initial, animate, exit, transition, variants, ...htmlProps } = props;
                return <li {...htmlProps}>{children}</li>;
            },
            p: ({ children, ...props }) => {
                const { initial, animate, exit, transition, variants, ...htmlProps } = props;
                return <p {...htmlProps}>{children}</p>;
            },
            circle: (props) => {
                const {
                    initial, animate, exit, transition, variants,
                    strokeDashoffset, strokeDasharray,
                    ...svgProps
                } = props;
                return <circle {...svgProps} />;
            },
        },
        AnimatePresence: ({ children }) => <>{children}</>,
        LayoutGroup: ({ children }) => <>{children}</>,
        useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
        useSpring: (value) => value,
        useTransform: (value) => value,
        useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    };
});

// =============================================================================
// Fetch Mock
// =============================================================================

// Basic fetch mock - can be overridden in individual tests
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    })
);

// =============================================================================
// Console Suppression (Optional - for cleaner test output)
// =============================================================================

// Suppress console.error for expected React errors during testing
const originalError = console.error;
console.error = (...args) => {
    // Suppress React 18 warnings about act()
    if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) {
        return;
    }
    // Suppress expected test errors
    if (args[0]?.includes?.('Error: Not implemented: navigation')) {
        return;
    }
    originalError.call(console, ...args);
};
