/**
 * Centralized API Client
 * 
 * Performance-optimized API client with:
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Response caching with TTL
 * - Automatic retry with exponential backoff
 * - Request cancellation via AbortController
 * 
 * @usage
 * import { api } from '@/services/api';
 * 
 * // GET with caching
 * const sessions = await api.get('/api/sessions');
 * 
 * // POST (skips cache)
 * const newSession = await api.post('/api/sessions', { minutes: 25 });
 */

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_CONFIG = {
    baseUrl: '',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    cacheTTL: 30000, // 30 seconds default cache
};

// =============================================================================
// Cache Implementation
// =============================================================================

const cache = new Map();
const inFlightRequests = new Map();

/**
 * Get cached response if valid
 */
function getCached(key) {
    const cached = cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
        cache.delete(key);
        return null;
    }

    return cached.data;
}

/**
 * Set cache with TTL
 */
function setCache(key, data, ttl = DEFAULT_CONFIG.cacheTTL) {
    cache.set(key, {
        data,
        expiry: Date.now() + ttl,
    });
}

/**
 * Clear all cache or specific key
 */
export function clearCache(key = null) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

/**
 * Clear cache matching pattern
 */
export function clearCachePattern(pattern) {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
}

// =============================================================================
// Request Utilities
// =============================================================================

/**
 * Sleep for exponential backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate backoff delay
 */
const getBackoffDelay = (attempt, baseDelay = DEFAULT_CONFIG.retryDelay) =>
    Math.min(baseDelay * Math.pow(2, attempt), 10000);

/**
 * Create cache key from request
 */
const createCacheKey = (url, options = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
};

// =============================================================================
// Core API Functions
// =============================================================================

/**
 * Make a fetch request with retry logic
 */
async function fetchWithRetry(url, options = {}, retries = DEFAULT_CONFIG.retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);

    const fetchOptions = {
        ...options,
        signal: controller.signal,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            if (!response.ok) {
                // Don't retry 4xx errors (client errors)
                if (response.status >= 400 && response.status < 500) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.response = response;
                    throw error;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }
            return await response.text();

        } catch (error) {
            lastError = error;

            // Don't retry aborted requests or client errors
            if (error.name === 'AbortError' || error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Wait before retry
            if (attempt < retries) {
                await sleep(getBackoffDelay(attempt));
            }
        }
    }

    clearTimeout(timeoutId);
    throw lastError;
}

/**
 * Make a deduplicated request
 */
async function deduplicatedFetch(cacheKey, fetchFn) {
    // Check for in-flight request
    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    // Create new request promise
    const requestPromise = fetchFn()
        .finally(() => inFlightRequests.delete(cacheKey));

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
}

// =============================================================================
// Public API
// =============================================================================

export const api = {
    /**
     * GET request with caching
     * @param {string} url - API endpoint
     * @param {Object} options - Fetch options
     * @param {number} options.cacheTTL - Cache time-to-live in ms (default: 30s)
     * @param {boolean} options.skipCache - Skip cache and fetch fresh
     */
    async get(url, options = {}) {
        const { cacheTTL = DEFAULT_CONFIG.cacheTTL, skipCache = false, ...fetchOptions } = options;
        const cacheKey = createCacheKey(url);

        // Check cache first
        if (!skipCache) {
            const cached = getCached(cacheKey);
            if (cached !== null) {
                return cached;
            }
        }

        // Make deduplicated request
        const data = await deduplicatedFetch(cacheKey, () =>
            fetchWithRetry(url, { ...fetchOptions, method: 'GET' })
        );

        // Cache the response
        if (cacheTTL > 0) {
            setCache(cacheKey, data, cacheTTL);
        }

        return data;
    },

    /**
     * POST request (clears related cache)
     */
    async post(url, body, options = {}) {
        const data = await fetchWithRetry(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });

        // Invalidate related cache
        clearCachePattern(url.split('?')[0]);

        return data;
    },

    /**
     * PUT request (clears related cache)
     */
    async put(url, body, options = {}) {
        const data = await fetchWithRetry(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });

        clearCachePattern(url.split('?')[0]);
        return data;
    },

    /**
     * PATCH request (clears related cache)
     */
    async patch(url, body, options = {}) {
        const data = await fetchWithRetry(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });

        clearCachePattern(url.split('?')[0]);
        return data;
    },

    /**
     * DELETE request (clears related cache)
     */
    async delete(url, options = {}) {
        const data = await fetchWithRetry(url, {
            ...options,
            method: 'DELETE',
        });

        clearCachePattern(url.split('?')[0]);
        return data;
    },
};

// =============================================================================
// React Hook for API calls
// =============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * React hook for API calls with loading/error state
 * 
 * @param {string} url - API endpoint
 * @param {Object} options - Options
 * @returns {{ data, loading, error, refetch }}
 */
export function useApi(url, options = {}) {
    const { immediate = true, ...fetchOptions } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const fetch = useCallback(async () => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await api.get(url, fetchOptions);
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [url, JSON.stringify(fetchOptions)]);

    useEffect(() => {
        mountedRef.current = true;
        if (immediate) {
            fetch();
        }
        return () => {
            mountedRef.current = false;
        };
    }, [fetch, immediate]);

    return { data, loading, error, refetch: fetch };
}

export default api;
