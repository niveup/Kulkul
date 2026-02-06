/**
 * Tests for Notion Service
 * 
 * Verifies API consumer logic, caching, retries, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as notionService from './notionService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock response
const mockResponse = (data, options = {}) => {
    const { ok = true, status = 200, statusText = 'OK' } = options;
    return Promise.resolve({
        ok,
        status,
        statusText,
        json: () => Promise.resolve(data),
    });
};

describe('Notion Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();
        // Clear internal cache (not exposed directly, so we rely on invalidateCache)
        notionService.invalidateCache();
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // =========================================================================
    // Core Request Logic (Retries, Caching)
    // =========================================================================

    describe('Core Request Logic', () => {
        it('retries on network failure', { timeout: 10000 }, async () => {
            vi.useRealTimers();
            // Fail twice, succeed on third attempt
            mockFetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockImplementationOnce(() => mockResponse({ success: true }));

            const result = await notionService.getPage('test-id');
            expect(result).toEqual({ success: true });
            expect(mockFetch).toHaveBeenCalledTimes(3);
            vi.useFakeTimers({ shouldAdvanceTime: true });
        });

        it('retries on 5xx errors', { timeout: 10000 }, async () => {
            vi.useRealTimers();
            mockFetch
                .mockImplementationOnce(() => mockResponse({}, { ok: false, status: 502 }))
                .mockImplementationOnce(() => mockResponse({ success: true }));

            const result = await notionService.getPage('test-id');
            expect(result).toEqual({ success: true });
            expect(mockFetch).toHaveBeenCalledTimes(2);
            vi.useFakeTimers({ shouldAdvanceTime: true });
        });

        it('does NOT retry on 4xx errors (except 429)', async () => {
            mockFetch.mockImplementationOnce(() => mockResponse(
                { message: 'Not Found' },
                { ok: false, status: 404 }
            ));

            try {
                await notionService.getPage('test-id');
                // Should fail if no error is thrown
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.status).toBe(404);
                expect(error.userMessage).toBe('Page or database not found in Notion');
            }

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('caches GET requests', async () => {
            mockFetch.mockImplementation(() => mockResponse({ id: 'cached-page' }));

            // First call - fetches
            await notionService.getPage('page-1');
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Second call - should benefit from cache
            await notionService.getPage('page-1');
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('skips cache for mutations (POST/PATCH)', async () => {
            mockFetch.mockImplementation(() => mockResponse({ id: 'new-page' }));

            await notionService.createPage({ parent: { page_id: 'p1' }, properties: {} });
            expect(mockFetch).toHaveBeenCalledTimes(1);

            await notionService.createPage({ parent: { page_id: 'p1' }, properties: {} });
            expect(mockFetch).toHaveBeenCalledTimes(2); // Should not cache POST
        });

        it('deduplicates pending requests', async () => {
            // Mock a "slow" request
            let resolveRequest;
            mockFetch.mockImplementation(() => new Promise(resolve => {
                resolveRequest = resolve;
            }));

            const promise1 = notionService.getPage('slow-page');
            const promise2 = notionService.getPage('slow-page');

            expect(mockFetch).toHaveBeenCalledTimes(1); // Only one fetch fired

            // Complete request
            resolveRequest({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ id: 'slow-page' })
            });

            const result1 = await promise1;
            const result2 = await promise2;

            expect(result1).toEqual({ id: 'slow-page' });
            expect(result2).toEqual({ id: 'slow-page' }); // Same object reference
        });
    });

    // =========================================================================
    // API Methods
    // =========================================================================

    describe('API Methods', () => {
        it('searchPages transforms query correctly', async () => {
            mockFetch.mockImplementation(() => mockResponse({ results: [] }));

            await notionService.searchPages('test query', { page_size: 10 });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/search'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ query: 'test query', page_size: 10 }),
                })
            );
        });

        it('createPage validates inputs', async () => {
            await expect(notionService.createPage({})).rejects.toThrow('Parent is required');
        });

        it('updatePage invalidates cache', async () => {
            // Setup cache
            mockFetch.mockImplementation(() => mockResponse({ id: 'p1', title: 'Old' }));
            await notionService.getPage('p1');

            // Check cache active
            await notionService.getPage('p1');
            expect(mockFetch).toHaveBeenCalledTimes(1); // Cached

            // Update page
            mockFetch.mockImplementation(() => mockResponse({ id: 'p1', title: 'New' }));
            await notionService.updatePage('p1', { title: 'New' });

            // Fetch again - should bypass cache
            await notionService.getPage('p1');
            expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + Update + Refetch
        });
    });

    // =========================================================================
    // Utilities
    // =========================================================================

    describe('Utilities', () => {
        it('extractPlainText handles rich text array', () => {
            const richText = [
                { plain_text: 'Hello ' },
                { plain_text: 'World' },
            ];
            expect(notionService.extractPlainText(richText)).toBe('Hello World');
        });

        it('getPageTitle safely extracts title', () => {
            const properties = {
                Name: {
                    type: 'title',
                    title: [{ plain_text: 'My Page' }]
                }
            };
            expect(notionService.getPageTitle(properties)).toBe('My Page');
        });

        it('formatNotionDate formats relatively', () => {
            const now = new Date();
            const fiveMinsAgo = new Date(now - 5 * 60000).toISOString();

            // Need to mock current time for stable test
            vi.setSystemTime(now);

            expect(notionService.formatNotionDate(fiveMinsAgo)).toBe('5m ago');
        });
    });
});
