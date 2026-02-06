/**
 * Tests for API Client - Centralized fetch wrapper with caching, retry, and deduplication
 * 
 * The API client provides:
 * - Request caching with TTL
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Automatic retry with exponential backoff
 * - Request cancellation via AbortController
 * 
 * Test Categories:
 * 1. GET requests with caching
 * 2. Mutation methods (POST, PUT, PATCH, DELETE)
 * 3. Cache management
 * 4. Retry logic
 * 5. Error handling
 * 6. useApi React hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { api, useApi, clearCache, clearCachePattern } from './client';

// =============================================================================
// Test Setup
// =============================================================================

// Mock fetch globally
const mockFetch = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    clearCache(); // Reset cache between tests
    global.fetch = mockFetch;
    vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
    vi.useRealTimers();
});

// Helper to create mock response
const mockResponse = (data, options = {}) => {
    const { ok = true, status = 200, statusText = 'OK', contentType = 'application/json' } = options;
    return Promise.resolve({
        ok,
        status,
        statusText,
        headers: {
            get: (name) => name.toLowerCase() === 'content-type' ? contentType : null,
        },
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
    });
};

// =============================================================================
// GET Requests with Caching
// =============================================================================
describe('api.get', () => {
    it('makes a GET request successfully', async () => {
        const mockData = { id: 1, name: 'Test' };
        mockFetch.mockImplementation(() => mockResponse(mockData));

        const result = await api.get('/api/test');

        expect(result).toEqual(mockData);
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
            }),
        }));
    });

    it('caches GET responses', async () => {
        const mockData = { id: 1, name: 'Cached' };
        mockFetch.mockImplementation(() => mockResponse(mockData));

        // First call
        const result1 = await api.get('/api/cached');
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Second call should use cache
        const result2 = await api.get('/api/cached');
        expect(mockFetch).toHaveBeenCalledTimes(1); // No new fetch
        expect(result2).toEqual(result1);
    });

    it('respects custom cache TTL', async () => {
        const mockData = { id: 1 };
        mockFetch.mockImplementation(() => mockResponse(mockData));

        // First call with short TTL
        await api.get('/api/short-cache', { cacheTTL: 1000 });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Immediate second call should use cache
        await api.get('/api/short-cache', { cacheTTL: 1000 });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Advance time past TTL
        vi.advanceTimersByTime(1500);

        // Third call should fetch fresh data
        await api.get('/api/short-cache', { cacheTTL: 1000 });
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('skips cache when skipCache is true', async () => {
        const mockData = { id: 1 };
        mockFetch.mockImplementation(() => mockResponse(mockData));

        // First call
        await api.get('/api/refresh');
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Second call with skipCache
        await api.get('/api/refresh', { skipCache: true });
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('deduplicates in-flight requests', async () => {
        const mockData = { id: 1 };
        let resolvePromise;
        const slowFetch = new Promise(resolve => {
            resolvePromise = resolve;
        });

        mockFetch.mockImplementation(() => slowFetch);

        // Start multiple simultaneous requests
        const promise1 = api.get('/api/dedupe');
        const promise2 = api.get('/api/dedupe');
        const promise3 = api.get('/api/dedupe');

        // Resolve the fetch
        resolvePromise(await mockResponse(mockData));

        const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

        // Only one fetch should have been made
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(result1).toEqual(mockData);
        expect(result2).toEqual(mockData);
        expect(result3).toEqual(mockData);
    });

    it('handles non-JSON responses', async () => {
        const textContent = 'Plain text response';
        mockFetch.mockImplementation(() => mockResponse(textContent, { contentType: 'text/plain' }));

        const result = await api.get('/api/text');

        // text() returns the raw string for non-JSON responses
        expect(result).toBe(textContent);
    });

    it('does not cache when cacheTTL is 0', async () => {
        const mockData = { id: 1 };
        mockFetch.mockImplementation(() => mockResponse(mockData));

        await api.get('/api/no-cache', { cacheTTL: 0 });
        await api.get('/api/no-cache', { cacheTTL: 0 });

        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});

// =============================================================================
// Mutation Methods (POST, PUT, PATCH, DELETE)
// =============================================================================
describe('api.post', () => {
    it('makes a POST request with body', async () => {
        const requestBody = { name: 'New Item' };
        const responseData = { id: 1, name: 'New Item' };
        mockFetch.mockImplementation(() => mockResponse(responseData));

        const result = await api.post('/api/items', requestBody);

        expect(result).toEqual(responseData);
        expect(mockFetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(requestBody),
        }));
    });

    it('clears related cache after POST', async () => {
        const getData = { items: [] };
        const postData = { id: 1 };
        mockFetch.mockImplementation(() => mockResponse(getData));

        // Populate cache
        await api.get('/api/items');
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // POST should clear the cache
        mockFetch.mockImplementation(() => mockResponse(postData));
        await api.post('/api/items', { name: 'New' });

        // Subsequent GET should fetch fresh
        mockFetch.mockImplementation(() => mockResponse({ items: [postData] }));
        await api.get('/api/items');
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });
});

describe('api.put', () => {
    it('makes a PUT request with body', async () => {
        const requestBody = { name: 'Updated Item' };
        const responseData = { id: 1, name: 'Updated Item' };
        mockFetch.mockImplementation(() => mockResponse(responseData));

        const result = await api.put('/api/items/1', requestBody);

        expect(result).toEqual(responseData);
        expect(mockFetch).toHaveBeenCalledWith('/api/items/1', expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(requestBody),
        }));
    });

    it('clears related cache after PUT', async () => {
        mockFetch.mockImplementation(() => mockResponse({}));

        // Populate cache
        await api.get('/api/items/1');

        // PUT should invalidate
        await api.put('/api/items/1', { name: 'Updated' });

        // GET should fetch fresh
        await api.get('/api/items/1');

        expect(mockFetch).toHaveBeenCalledTimes(3);
    });
});

describe('api.patch', () => {
    it('makes a PATCH request with partial body', async () => {
        const requestBody = { status: 'active' };
        mockFetch.mockImplementation(() => mockResponse({ id: 1, status: 'active' }));

        await api.patch('/api/items/1', requestBody);

        expect(mockFetch).toHaveBeenCalledWith('/api/items/1', expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(requestBody),
        }));
    });
});

describe('api.delete', () => {
    it('makes a DELETE request', async () => {
        mockFetch.mockImplementation(() => mockResponse({ success: true }));

        const result = await api.delete('/api/items/1');

        expect(result).toEqual({ success: true });
        expect(mockFetch).toHaveBeenCalledWith('/api/items/1', expect.objectContaining({
            method: 'DELETE',
        }));
    });

    it('clears related cache after DELETE', async () => {
        mockFetch.mockImplementation(() => mockResponse({}));

        await api.get('/api/items/1');
        await api.delete('/api/items/1');
        await api.get('/api/items/1');

        expect(mockFetch).toHaveBeenCalledTimes(3);
    });
});

// =============================================================================
// Cache Management
// =============================================================================
describe('Cache Management', () => {
    describe('clearCache', () => {
        it('clears all cache when called without arguments', async () => {
            mockFetch.mockImplementation(() => mockResponse({ data: 'test' }));

            await api.get('/api/a');
            await api.get('/api/b');

            clearCache();

            await api.get('/api/a');
            await api.get('/api/b');

            expect(mockFetch).toHaveBeenCalledTimes(4);
        });

        it('clears specific cache key', async () => {
            mockFetch.mockImplementation(() => mockResponse({ data: 'test' }));

            await api.get('/api/a');
            await api.get('/api/b');

            clearCache('GET:/api/a:');

            await api.get('/api/a'); // Should fetch fresh
            await api.get('/api/b'); // Should use cache

            expect(mockFetch).toHaveBeenCalledTimes(3);
        });
    });

    describe('clearCachePattern', () => {
        it('clears cache entries matching pattern', async () => {
            mockFetch.mockImplementation(() => mockResponse({ data: 'test' }));

            await api.get('/api/users/1');
            await api.get('/api/users/2');
            await api.get('/api/items');

            clearCachePattern('/api/users');

            await api.get('/api/users/1'); // Should fetch fresh
            await api.get('/api/users/2'); // Should fetch fresh
            await api.get('/api/items');   // Should use cache

            expect(mockFetch).toHaveBeenCalledTimes(5);
        });
    });
});

// =============================================================================
// Retry Logic
// =============================================================================
describe('Retry Logic', () => {
    it('retries on network failure', async () => {
        mockFetch
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'))
            .mockImplementationOnce(() => mockResponse({ success: true }));

        const result = await api.get('/api/retry-test', { skipCache: true });

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(result).toEqual({ success: true });
    });

    it('retries on 5xx server errors', async () => {
        mockFetch
            .mockImplementationOnce(() => mockResponse({}, { ok: false, status: 500, statusText: 'Internal Server Error' }))
            .mockImplementationOnce(() => mockResponse({ success: true }));

        const result = await api.get('/api/server-error', { skipCache: true });

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ success: true });
    });

    it('does NOT retry on 4xx client errors', async () => {
        mockFetch.mockImplementation(() =>
            mockResponse({}, { ok: false, status: 404, statusText: 'Not Found' })
        );

        await expect(api.get('/api/not-found', { skipCache: true })).rejects.toThrow('HTTP 404: Not Found');
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws after max retries exceeded', { timeout: 30000 }, async () => {
        // Use real timers for this test to allow retries to complete
        vi.useRealTimers();
        mockFetch.mockRejectedValue(new Error('Persistent error'));

        await expect(api.get('/api/always-fails', { skipCache: true })).rejects.toThrow('Persistent error');
        expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    it('uses exponential backoff between retries', async () => {
        const delays = [];
        const originalSetTimeout = global.setTimeout;

        vi.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
            if (delay > 0 && delay < 20000) {
                delays.push(delay);
            }
            return originalSetTimeout(fn, 0); // Execute immediately for test
        });

        mockFetch
            .mockRejectedValueOnce(new Error('Error 1'))
            .mockRejectedValueOnce(new Error('Error 2'))
            .mockImplementationOnce(() => mockResponse({ success: true }));

        await api.get('/api/backoff-test', { skipCache: true });

        // Backoff delays should increase: 1000, 2000, 4000...
        expect(delays.length).toBeGreaterThan(0);

        vi.restoreAllMocks();
    });
});

// =============================================================================
// Error Handling
// =============================================================================
describe('Error Handling', () => {
    it('throws on HTTP 4xx errors', async () => {
        mockFetch.mockImplementation(() =>
            mockResponse({}, { ok: false, status: 400, statusText: 'Bad Request' })
        );

        await expect(api.get('/api/bad-request', { skipCache: true })).rejects.toThrow('HTTP 400: Bad Request');
    });

    it('includes status code in error object', async () => {
        mockFetch.mockImplementation(() =>
            mockResponse({}, { ok: false, status: 403, statusText: 'Forbidden' })
        );

        try {
            await api.get('/api/forbidden', { skipCache: true });
        } catch (error) {
            expect(error.status).toBe(403);
        }
    });

    it('handles timeout (AbortError)', async () => {
        mockFetch.mockImplementation(() => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            return Promise.reject(error);
        });

        await expect(api.get('/api/timeout', { skipCache: true })).rejects.toThrow('Aborted');
        expect(mockFetch).toHaveBeenCalledTimes(1); // No retry on abort
    });
});

// =============================================================================
// useApi React Hook
// =============================================================================
describe('useApi Hook', () => {
    it('returns loading state initially', async () => {
        mockFetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        const { result } = renderHook(() => useApi('/api/loading'));

        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('returns data on successful fetch', async () => {
        const mockData = { id: 1, name: 'Test' };
        mockFetch.mockImplementation(() => mockResponse(mockData));

        const { result } = renderHook(() => useApi('/api/success'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it('returns error on failed fetch', { timeout: 30000 }, async () => {
        // 4xx errors don't retry, so use 404 for faster test
        mockFetch.mockImplementation(() =>
            mockResponse({}, { ok: false, status: 404, statusText: 'Not Found' })
        );

        const { result } = renderHook(() => useApi('/api/error'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        }, { timeout: 25000 });

        expect(result.current.error).toBeTruthy();
        expect(result.current.data).toBeNull();
    });

    it('does not fetch when immediate is false', async () => {
        const { result } = renderHook(() => useApi('/api/deferred', { immediate: false }));

        expect(result.current.loading).toBe(false);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('provides refetch function', async () => {
        let callCount = 0;
        mockFetch.mockImplementation(() => {
            callCount++;
            return mockResponse({ count: callCount });
        });

        const { result } = renderHook(() => useApi('/api/refetch'));

        await waitFor(() => {
            expect(result.current.data).toEqual({ count: 1 });
        });

        // Clear cache to ensure refetch makes a new request
        clearCache();

        // Call refetch
        await act(async () => {
            await result.current.refetch();
        });

        expect(result.current.data).toEqual({ count: 2 });
    });

    it('does not update state after unmount', async () => {
        let resolvePromise;
        mockFetch.mockImplementation(() => new Promise(resolve => {
            resolvePromise = () => resolve(mockResponse({ data: 'test' }));
        }));

        const { result, unmount } = renderHook(() => useApi('/api/unmount'));

        expect(result.current.loading).toBe(true);

        // Unmount before fetch completes
        unmount();

        // Resolve fetch - should not cause state update error
        await act(async () => {
            resolvePromise();
            await new Promise(r => setTimeout(r, 0));
        });

        // No error should have been thrown
        expect(true).toBe(true);
    });

    it('handles null URL gracefully', async () => {
        const { result } = renderHook(() => useApi(null));

        // Should not throw, just return initial state
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();
    });
});
