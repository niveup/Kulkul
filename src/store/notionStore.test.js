/**
 * Tests for Notion Store
 * 
 * Verifies Zustand state management, pagination, and caching.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useNotionStore from './notionStore';
import * as notionService from '../services/notionService';

// Mock notionService
vi.mock('../services/notionService', () => ({
    searchPages: vi.fn(),
    getPage: vi.fn(),
    getPageContent: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    invalidateCache: vi.fn(),
}));

describe('Notion Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store
        act(() => useNotionStore.getState().reset());
    });

    // =========================================================================
    // Search & List Logic
    // =========================================================================

    describe('Search Pages', () => {
        it('fetches pages successfully', async () => {
            const mockResults = {
                results: [{ id: '1', title: 'Page 1' }],
                has_more: false,
                next_cursor: null,
            };
            notionService.searchPages.mockResolvedValue(mockResults);

            await act(async () => {
                await useNotionStore.getState().searchPages('test');
            });

            const state = useNotionStore.getState();
            expect(state.pages).toEqual(mockResults.results);
            expect(state.pagesLoading).toBe(false);
            expect(state.isInitialized).toBe(true);
        });

        it('handles search errors', async () => {
            notionService.searchPages.mockRejectedValue(new Error('API Error'));

            await expect(useNotionStore.getState().searchPages('test'))
                .rejects.toThrow('API Error');

            const state = useNotionStore.getState();
            expect(state.pagesError).toBe('API Error');
            expect(state.pagesLoading).toBe(false);
        });

        it('supports pagination (load more)', async () => {
            // First page
            notionService.searchPages.mockResolvedValueOnce({
                results: [{ id: '1' }],
                has_more: true,
                next_cursor: 'cursor-1',
            });

            await act(async () => {
                await useNotionStore.getState().searchPages('test');
            });

            // Second page
            notionService.searchPages.mockResolvedValueOnce({
                results: [{ id: '2' }],
                has_more: false,
                next_cursor: null,
            });

            await act(async () => {
                await useNotionStore.getState().loadMorePages();
            });

            const state = useNotionStore.getState();
            expect(state.pages).toHaveLength(2);
            expect(state.pages[0].id).toBe('1');
            expect(state.pages[1].id).toBe('2');
            expect(state.hasMorePages).toBe(false);
        });
    });

    // =========================================================================
    // Page Content Logic
    // =========================================================================

    describe('Page Content', () => {
        it('loads page details and content in parallel', async () => {
            const mockPage = { id: 'p1', title: 'Test' };
            const mockContent = { results: [{ type: 'paragraph' }] };

            notionService.getPage.mockResolvedValue(mockPage);
            notionService.getPageContent.mockResolvedValue(mockContent);

            await act(async () => {
                await useNotionStore.getState().loadPage('p1');
            });

            const state = useNotionStore.getState();
            expect(state.currentPage).toEqual(mockPage);
            expect(state.currentPageContent).toEqual(mockContent.results);
            expect(state.pageLoading).toBe(false);
        });

        it('clears current page state', () => {
            useNotionStore.setState({
                currentPage: { id: '1' },
                currentPageContent: [{ id: 'b1' }],
            });

            act(() => useNotionStore.getState().clearCurrentPage());

            const state = useNotionStore.getState();
            expect(state.currentPage).toBeNull();
            expect(state.currentPageContent).toEqual([]);
        });
    });

    // =========================================================================
    // Mutations & Optimistic Updates
    // =========================================================================

    describe('Mutations', () => {
        it('createPage adds to list optimistically', async () => {
            const newPage = { id: 'new', title: 'New Page' };
            notionService.createPage.mockResolvedValue(newPage);

            // Initial state
            useNotionStore.setState({ pages: [{ id: 'old' }] });

            await act(async () => {
                await useNotionStore.getState().createPage({ properties: {} });
            });

            const state = useNotionStore.getState();
            expect(state.pages).toHaveLength(2);
            expect(state.pages[0]).toEqual(newPage); // Added to top
        });

        it('updatePage updates list and current page', async () => {
            const oldPage = { id: 'p1', title: 'Old' };
            const updatedPage = { id: 'p1', title: 'Updated' };

            useNotionStore.setState({
                pages: [oldPage, { id: 'p2' }],
                currentPage: oldPage,
            });

            notionService.updatePage.mockResolvedValue(updatedPage);

            await act(async () => {
                await useNotionStore.getState().updatePage('p1', { title: 'Updated' });
            });

            const state = useNotionStore.getState();
            expect(state.pages[0].title).toBe('Updated');
            expect(state.currentPage.title).toBe('Updated');
        });

        it('archivePage removes from list', async () => {
            useNotionStore.setState({
                pages: [{ id: 'p1' }, { id: 'p2' }],
            });

            notionService.updatePage.mockResolvedValue({ id: 'p1', archived: true });

            await act(async () => {
                await useNotionStore.getState().archivePage('p1');
            });

            const state = useNotionStore.getState();
            expect(state.pages).toHaveLength(1);
            expect(state.pages[0].id).toBe('p2');
        });
    });
});
