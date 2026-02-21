/**
 * Core utility functions for the application
 * 
 * Provides common helpers for:
 * - Class name merging
 * - Number/text formatting
 * - Debounce/throttle
 * - Browser utilities
 * - Time formatting
 */

// =============================================================================
// Class Name Utilities
// =============================================================================

/**
 * Merge class names conditionally (simplified clsx alternative)
 * @param {...(string|boolean|undefined|null)} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}

// =============================================================================
// Formatting Utilities  
// =============================================================================

/**
 * Format a number with locale-aware separators
 * @param {number} num - Number to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted number string
 */
export function formatNumber(num, options = {}) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', options).format(num);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// =============================================================================
// Timing Utilities
// =============================================================================

/**
 * Debounce a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Sleep for specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// Browser Utilities
// =============================================================================

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = '') {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

/**
 * Check if code is running in browser
 * @returns {boolean}
 */
export function isBrowser() {
    return typeof window !== 'undefined';
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
    if (!isBrowser()) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safely parse JSON with fallback
 * @param {string} json - JSON string
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed value or fallback
 */
export function safeJsonParse(json, fallback = null) {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

// =============================================================================
// Time/Date Utilities
// =============================================================================

/**
 * Get time-based greeting
 * @returns {string} Greeting message
 */
export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

// =============================================================================
// Keyboard Utilities
// =============================================================================

/**
 * Common keyboard key codes
 */
export const Keys = {
    Enter: 'Enter',
    Space: ' ',
    Escape: 'Escape',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Tab: 'Tab',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
};

/**
 * Check if a key event matches specific key(s)
 * @param {KeyboardEvent} event - Keyboard event
 * @param {string|string[]} keys - Key(s) to check
 * @returns {boolean}
 */
export function isKey(event, keys) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.includes(event.key);
}

// =============================================================================
// URL Utilities
// =============================================================================

/**
 * Ensures a URL is absolute by prepending https:// if needed
 * @param {string} url - The URL to check
 * @returns {string} Absolute URL
 */
export function ensureAbsoluteUrl(url) {
    if (!url) return '';
    if (url.startsWith('/')) return url; // Let internal paths or API routes stay relative
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }
    return `https://${url}`;
}

/**
 * Gets a high-quality favicon URL for a given domain
 * @param {string} url - The URL or domain
 * @returns {string} Favicon URL
 */
export function getFaviconUrl(url) {
    if (!url) return '';
    try {
        // Clean URL to get domain
        let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        // Using DuckDuckGo's favicon API as it's less frequently blocked by adblockers than Google's
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
        return '';
    }
}
