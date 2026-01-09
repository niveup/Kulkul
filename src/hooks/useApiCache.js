/**
 * useApiCache - Caching hook for API responses
 * 
 * Reduces redundant API calls by caching responses with TTL.
 * Improves perceived performance on tab switches and page loads.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute default

/**
 * Hook for fetching and caching API data
 * @param {string} url - API endpoint to fetch
 * @param {object} options - Fetch options + cache config
 */
export function useApiCache(url, options = {}) {
    const {
        ttl = CACHE_TTL,
        skip = false,
        ...fetchOptions
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const cacheKey = `${url}-${JSON.stringify(fetchOptions)}`;

    const fetchData = useCallback(async (skipCache = false) => {
        if (skip) return null;

        // Check cache first
        const cached = cache.get(cacheKey);
        if (!skipCache && cached && Date.now() - cached.timestamp < ttl) {
            setData(cached.data);
            setLoading(false);
            return cached.data;
        }

        // Abort any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Update cache
            cache.set(cacheKey, { data: result, timestamp: Date.now() });
            setData(result);
            return result;
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                console.error(`[useApiCache] Error fetching ${url}:`, err);
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, [url, cacheKey, ttl, skip, fetchOptions]);

    // Initial fetch
    useEffect(() => {
        if (!skip) {
            fetchData();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, skip]);

    // Refetch function (bypasses cache)
    const refetch = useCallback(() => fetchData(true), [fetchData]);

    // Invalidate cache for this key
    const invalidate = useCallback(() => {
        cache.delete(cacheKey);
    }, [cacheKey]);

    return { data, loading, error, refetch, invalidate };
}

/**
 * Prefetch data into cache (useful for anticipated navigations)
 */
export function prefetchApi(url, options = {}) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = cache.get(cacheKey);

    // Don't prefetch if already cached and fresh
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return Promise.resolve(cached.data);
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(data => {
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        })
        .catch(err => {
            console.warn(`[prefetchApi] Failed to prefetch ${url}:`, err);
            return null;
        });
}

/**
 * Clear all cached data
 */
export function clearApiCache() {
    cache.clear();
}

export default useApiCache;
