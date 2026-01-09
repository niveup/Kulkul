/**
 * Custom React Hooks Collection
 * Industry-grade hooks for common patterns
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { debounce, throttle } from '../lib/utils';

// Re-export useApiCache for convenience
export { useApiCache, prefetchApi, clearApiCache } from './useApiCache';


// =============================================================================
// useLocalStorage - Persist state to localStorage
// =============================================================================

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}

// =============================================================================
// useMediaQuery - Responsive design helper
// =============================================================================

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        const handler = (event) => setMatches(event.matches);

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
        // Legacy browsers
        mediaQuery.addListener(handler);
        return () => mediaQuery.removeListener(handler);
    }, [query]);

    return matches;
}

// Preset breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

// =============================================================================
// useDebounce - Debounce a value
// =============================================================================

export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// =============================================================================
// useDebouncedCallback - Debounce a callback function
// =============================================================================

export function useDebouncedCallback(callback, delay = 300) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useMemo(
        () => debounce((...args) => callbackRef.current(...args), delay),
        [delay]
    );
}

// =============================================================================
// useThrottledCallback - Throttle a callback function
// =============================================================================

export function useThrottledCallback(callback, delay = 300) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useMemo(
        () => throttle((...args) => callbackRef.current(...args), delay),
        [delay]
    );
}

// =============================================================================
// useClickOutside - Detect clicks outside an element
// =============================================================================

export function useClickOutside(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, enabled]);
}

// =============================================================================
// useKeyPress - Detect specific key presses
// =============================================================================

export function useKeyPress(targetKey, handler, options = {}) {
    const {
        enabled = true,
        preventDefault = false,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        altKey = false,
    } = options;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            const modifiersMatch =
                event.ctrlKey === ctrlKey &&
                event.metaKey === metaKey &&
                event.shiftKey === shiftKey &&
                event.altKey === altKey;

            if (event.key === targetKey && modifiersMatch) {
                if (preventDefault) {
                    event.preventDefault();
                }
                handler(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [targetKey, handler, enabled, preventDefault, ctrlKey, metaKey, shiftKey, altKey]);
}

// =============================================================================
// useHotkey - Global keyboard shortcut
// =============================================================================

export function useHotkey(keys, callback, deps = []) {
    useEffect(() => {
        const handler = (event) => {
            // Skip if user is typing in an input field, textarea, or contenteditable
            const activeElement = document.activeElement;
            const isTyping = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable ||
                activeElement.getAttribute('contenteditable') === 'true'
            );

            // For single-key shortcuts (no modifiers), skip when typing
            const keyParts = keys.toLowerCase().split('+');
            const hasModifier = keyParts.some(k =>
                ['ctrl', 'control', 'meta', 'cmd', 'shift', 'alt'].includes(k)
            );

            if (isTyping && !hasModifier) {
                return; // Don't trigger single-key shortcuts while typing
            }

            const requiredMods = {
                ctrl: keyParts.includes('ctrl') || keyParts.includes('control'),
                meta: keyParts.includes('meta') || keyParts.includes('cmd'),
                shift: keyParts.includes('shift'),
                alt: keyParts.includes('alt'),
            };
            const key = keyParts.filter(k =>
                !['ctrl', 'control', 'meta', 'cmd', 'shift', 'alt'].includes(k)
            )[0];

            const modsMatch =
                event.ctrlKey === requiredMods.ctrl &&
                event.metaKey === requiredMods.meta &&
                event.shiftKey === requiredMods.shift &&
                event.altKey === requiredMods.alt;

            if (event.key.toLowerCase() === key && modsMatch) {
                event.preventDefault();
                callback(event);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [keys, callback, ...deps]);
}

// =============================================================================
// useInterval - Run code on an interval
// =============================================================================

export function useInterval(callback, delay) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

// =============================================================================
// useTimeout - Run code after a timeout
// =============================================================================

export function useTimeout(callback, delay) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}

// =============================================================================
// usePrevious - Get the previous value of a state
// =============================================================================

export function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

// =============================================================================
// useIsFirstRender - Check if this is the first render
// =============================================================================

export function useIsFirstRender() {
    const isFirst = useRef(true);

    if (isFirst.current) {
        isFirst.current = false;
        return true;
    }

    return false;
}

// =============================================================================
// useDocumentTitle - Set the document title
// =============================================================================

export function useDocumentTitle(title, options = {}) {
    const { restoreOnUnmount = true } = options;
    const prevTitleRef = useRef(document.title);

    useEffect(() => {
        document.title = title;

        return () => {
            if (restoreOnUnmount) {
                document.title = prevTitleRef.current;
            }
        };
    }, [title, restoreOnUnmount]);
}

// =============================================================================
// useCopyToClipboard - Copy text to clipboard
// =============================================================================

export function useCopyToClipboard() {
    const [copiedText, setCopiedText] = useState(null);
    const [error, setError] = useState(null);

    const copy = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            setError(new Error('Clipboard API not available'));
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setError(null);
            return true;
        } catch (err) {
            setError(err);
            setCopiedText(null);
            return false;
        }
    }, []);

    const reset = useCallback(() => {
        setCopiedText(null);
        setError(null);
    }, []);

    return { copiedText, error, copy, reset };
}

// =============================================================================
// useOnlineStatus - Track online/offline status
// =============================================================================

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

// =============================================================================
// useWindowSize - Track window dimensions
// =============================================================================

export function useWindowSize() {
    const [size, setSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
}

// =============================================================================
// useScrollPosition - Track scroll position
// =============================================================================

export function useScrollPosition() {
    const [scrollPosition, setScrollPosition] = useState({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition({
                x: window.scrollX,
                y: window.scrollY,
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollPosition;
}

// =============================================================================
// useHover - Track hover state
// =============================================================================

export function useHover() {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            node.removeEventListener('mouseenter', handleMouseEnter);
            node.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return [ref, isHovered];
}

// =============================================================================
// useFocus - Track focus state
// =============================================================================

export function useFocus() {
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const handleFocus = () => setIsFocused(true);
        const handleBlur = () => setIsFocused(false);

        node.addEventListener('focus', handleFocus);
        node.addEventListener('blur', handleBlur);

        return () => {
            node.removeEventListener('focus', handleFocus);
            node.removeEventListener('blur', handleBlur);
        };
    }, []);

    return [ref, isFocused];
}

// =============================================================================
// useToggle - Simple boolean toggle
// =============================================================================

export function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue(v => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return [value, { toggle, setTrue, setFalse, setValue }];
}

// =============================================================================
// useMounted - Check if component is mounted
// =============================================================================

export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
