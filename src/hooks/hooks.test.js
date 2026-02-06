/**
 * Tests for Custom React Hooks
 * 
 * Tests the core custom hooks used throughout the application.
 * Uses @testing-library/react's renderHook utility.
 * 
 * Test Categories:
 * 1. useLocalStorage - localStorage persistence
 * 2. useDebounce - value debouncing
 * 3. useDebouncedCallback - callback debouncing
 * 4. useThrottledCallback - callback throttling
 * 5. useClickOutside - outside click detection
 * 6. useKeyPress - keyboard event handling
 * 7. useInterval/useTimeout - timer utilities
 * 8. usePrevious - previous value tracking
 * 9. useIsFirstRender - first render detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
    useLocalStorage,
    useDebounce,
    useDebouncedCallback,
    useThrottledCallback,
    usePrevious,
    useIsFirstRender,
    useInterval,
    useTimeout,
} from './index';

// =============================================================================
// Test Setup
// =============================================================================

// Create a proper localStorage mock with actual storage behavior
const createLocalStorageMock = () => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i) => Object.keys(store)[i] || null),
    };
};

let localStorageMock;

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Create fresh localStorage mock for each test
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    });
});

afterEach(() => {
    vi.useRealTimers();
});

// =============================================================================
// useLocalStorage
// =============================================================================
describe('useLocalStorage', () => {
    it('returns initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('initial');
    });

    it('returns stored value from localStorage', () => {
        localStorageMock.setItem('test-key', JSON.stringify('stored-value'));
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('stored-value');
    });

    it('updates value and localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('new-value');
        });

        expect(result.current[0]).toBe('new-value');
        expect(localStorageMock.setItem).toHaveBeenCalled();
        expect(JSON.parse(localStorageMock.getItem('test-key'))).toBe('new-value');
    });

    it('handles object values', () => {
        const initialObj = { name: 'Test', count: 0 };
        const { result } = renderHook(() => useLocalStorage('obj-key', initialObj));

        expect(result.current[0]).toEqual(initialObj);

        act(() => {
            result.current[1]({ name: 'Updated', count: 1 });
        });

        expect(result.current[0]).toEqual({ name: 'Updated', count: 1 });
    });

    it('handles array values', () => {
        const { result } = renderHook(() => useLocalStorage('arr-key', []));

        act(() => {
            result.current[1](['a', 'b', 'c']);
        });

        expect(result.current[0]).toEqual(['a', 'b', 'c']);
    });

    it('handles functional updates', () => {
        const { result } = renderHook(() => useLocalStorage('count-key', 0));

        act(() => {
            result.current[1](prev => prev + 1);
        });
        act(() => {
            result.current[1](prev => prev + 1);
        });

        expect(result.current[0]).toBe(2);
    });

    it('handles invalid JSON in localStorage gracefully', () => {
        // Directly set invalid JSON to the mock store
        localStorageMock.getItem = vi.fn(() => 'not valid json');
        const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
        expect(result.current[0]).toBe('fallback');
    });
});

// =============================================================================
// useDebounce
// =============================================================================
describe('useDebounce', () => {
    it('returns initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 300));
        expect(result.current).toBe('initial');
    });

    it('delays value updates', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });
        expect(result.current).toBe('initial'); // Still old value

        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(result.current).toBe('initial'); // Still old value

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe('updated'); // Now updated
    });

    it('resets timer on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'v1' } }
        );

        rerender({ value: 'v2' });
        act(() => vi.advanceTimersByTime(200));

        rerender({ value: 'v3' });
        act(() => vi.advanceTimersByTime(200));

        expect(result.current).toBe('v1'); // Still v1 (timer keeps resetting)

        act(() => vi.advanceTimersByTime(100));
        expect(result.current).toBe('v3'); // Now v3 (skipped v2)
    });

    it('uses custom delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => vi.advanceTimersByTime(400));
        expect(result.current).toBe('initial');

        act(() => vi.advanceTimersByTime(100));
        expect(result.current).toBe('updated');
    });
});

// =============================================================================
// useDebouncedCallback
// =============================================================================
describe('useDebouncedCallback', () => {
    it('debounces callback execution', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        result.current('arg1');
        result.current('arg2');
        result.current('arg3');

        expect(callback).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(300));

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('resets on each call', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        result.current('first');
        act(() => vi.advanceTimersByTime(200));
        result.current('second');
        act(() => vi.advanceTimersByTime(200));
        result.current('third');
        act(() => vi.advanceTimersByTime(300));

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('third');
    });

    it('maintains stable reference', () => {
        const callback = vi.fn();
        const { result, rerender } = renderHook(() => useDebouncedCallback(callback, 300));

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
    });
});

// =============================================================================
// useThrottledCallback
// =============================================================================
describe('useThrottledCallback', () => {
    it('executes immediately on first call', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 300));

        result.current('first');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('first');
    });

    it('blocks subsequent calls within throttle period', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 300));

        result.current('first');
        result.current('second');
        result.current('third');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('first');
    });

    it('allows calls after throttle period', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 300));

        result.current('first');
        act(() => vi.advanceTimersByTime(300));
        result.current('second');

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith('second');
    });
});

// =============================================================================
// usePrevious
// =============================================================================
describe('usePrevious', () => {
    it('returns undefined on first render', () => {
        const { result } = renderHook(() => usePrevious('initial'));
        expect(result.current).toBeUndefined();
    });

    it('returns previous value after update', () => {
        const { result, rerender } = renderHook(
            ({ value }) => usePrevious(value),
            { initialProps: { value: 'first' } }
        );

        expect(result.current).toBeUndefined();

        rerender({ value: 'second' });
        expect(result.current).toBe('first');

        rerender({ value: 'third' });
        expect(result.current).toBe('second');
    });

    it('works with objects', () => {
        const { result, rerender } = renderHook(
            ({ value }) => usePrevious(value),
            { initialProps: { value: { count: 0 } } }
        );

        rerender({ value: { count: 1 } });
        expect(result.current).toEqual({ count: 0 });
    });
});

// =============================================================================
// useIsFirstRender
// =============================================================================
describe('useIsFirstRender', () => {
    it('returns true on first render', () => {
        const { result } = renderHook(() => useIsFirstRender());
        expect(result.current).toBe(true);
    });

    it('returns false on subsequent renders', () => {
        const { result, rerender } = renderHook(() => useIsFirstRender());

        expect(result.current).toBe(true);

        rerender();
        expect(result.current).toBe(false);

        rerender();
        expect(result.current).toBe(false);
    });
});

// =============================================================================
// useInterval
// =============================================================================
describe('useInterval', () => {
    it('calls callback at specified interval', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, 1000));

        expect(callback).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1000));
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => vi.advanceTimersByTime(1000));
        expect(callback).toHaveBeenCalledTimes(2);

        act(() => vi.advanceTimersByTime(3000));
        expect(callback).toHaveBeenCalledTimes(5);
    });

    it('does not call when delay is null', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, null));

        act(() => vi.advanceTimersByTime(5000));
        expect(callback).not.toHaveBeenCalled();
    });

    it('cleans up on unmount', () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useInterval(callback, 1000));

        act(() => vi.advanceTimersByTime(1000));
        expect(callback).toHaveBeenCalledTimes(1);

        unmount();

        act(() => vi.advanceTimersByTime(5000));
        expect(callback).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('updates callback without resetting interval', () => {
        let count = 0;
        const { rerender } = renderHook(
            ({ cb }) => useInterval(cb, 1000),
            { initialProps: { cb: () => count++ } }
        );

        act(() => vi.advanceTimersByTime(1000));
        expect(count).toBe(1);

        // Update callback
        rerender({ cb: () => count += 10 });

        act(() => vi.advanceTimersByTime(1000));
        expect(count).toBe(11);
    });
});

// =============================================================================
// useTimeout
// =============================================================================
describe('useTimeout', () => {
    it('calls callback after delay', () => {
        const callback = vi.fn();
        renderHook(() => useTimeout(callback, 1000));

        expect(callback).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1000));
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('only calls callback once', () => {
        const callback = vi.fn();
        renderHook(() => useTimeout(callback, 1000));

        act(() => vi.advanceTimersByTime(5000));
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not call when delay is null', () => {
        const callback = vi.fn();
        renderHook(() => useTimeout(callback, null));

        act(() => vi.advanceTimersByTime(5000));
        expect(callback).not.toHaveBeenCalled();
    });

    it('cleans up on unmount', () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useTimeout(callback, 1000));

        act(() => vi.advanceTimersByTime(500));
        unmount();

        act(() => vi.advanceTimersByTime(1000));
        expect(callback).not.toHaveBeenCalled();
    });
});
