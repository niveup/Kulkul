/**
 * Notion Store - Zustand State Management
 * 
 * Manages:
 * - Pages list with pagination
 * - Current page content
 * - Loading/error states
 * - Optimistic updates
 */

import { create } from 'zustand';
import * as notionService from '../services/notionService.js';

// =============================================================================
// Store Definition
// =============================================================================

const useNotionStore = create((set, get) => ({
    // =========================================================================
    // State
    // =========================================================================

    // Pages list
    pages: [],
    pagesLoading: false,
    pagesError: null,
    hasMorePages: false,
    nextCursor: null,
    lastSearchQuery: '',

    // Current page
    currentPage: null,
    currentPageContent: [],
    pageLoading: false,
    pageError: null,

    // Global
    isInitialized: false,

    // =========================================================================
    // Actions - Search & List
    // =========================================================================

    /**
     * Search Notion pages
     * @param {string} query - Search query
     * @param {boolean} append - Append to existing results (pagination)
     */
    searchPages: async (query = '', append = false) => {
        const { nextCursor, lastSearchQuery } = get();

        // Reset if new search
        if (!append || query !== lastSearchQuery) {
            set({
                pages: [],
                pagesLoading: true,
                pagesError: null,
                nextCursor: null,
                lastSearchQuery: query
            });
        } else {
            set({ pagesLoading: true, pagesError: null });
        }

        try {
            const options = {
                page_size: 20,
                filter: { value: 'page', property: 'object' },
            };

            if (append && nextCursor) {
                options.start_cursor = nextCursor;
            }

            const result = await notionService.searchPages(query, options);

            set(state => ({
                pages: append ? [...state.pages, ...result.results] : result.results,
                hasMorePages: result.has_more,
                nextCursor: result.next_cursor,
                pagesLoading: false,
                isInitialized: true,
            }));

            return result;
        } catch (error) {
            set({
                pagesError: error.userMessage || error.message,
                pagesLoading: false,
                isInitialized: true,
            });
            throw error;
        }
    },

    /**
     * Load more pages (pagination)
     */
    loadMorePages: async () => {
        const { hasMorePages, pagesLoading, lastSearchQuery } = get();
        if (!hasMorePages || pagesLoading) return;

        return get().searchPages(lastSearchQuery, true);
    },

    /**
     * Refresh pages list
     */
    refreshPages: async () => {
        notionService.invalidateCache('search:');
        return get().searchPages(get().lastSearchQuery);
    },

    // =========================================================================
    // Actions - Page Content
    // =========================================================================

    /**
     * Load page details and content
     * @param {string} pageId - Notion page ID
     */
    loadPage: async (pageId) => {
        if (!pageId) return;

        set({
            pageLoading: true,
            pageError: null,
            currentPage: null,
            currentPageContent: [],
        });

        try {
            // Load page metadata and content in parallel
            const [page, content] = await Promise.all([
                notionService.getPage(pageId),
                notionService.getPageContent(pageId),
            ]);

            set({
                currentPage: page,
                currentPageContent: content.results,
                pageLoading: false,
            });

            return { page, content };
        } catch (error) {
            set({
                pageError: error.userMessage || error.message,
                pageLoading: false
            });
            throw error;
        }
    },

    /**
     * Clear current page
     */
    clearCurrentPage: () => {
        set({
            currentPage: null,
            currentPageContent: [],
            pageError: null,
        });
    },

    // =========================================================================
    // Actions - Create & Update
    // =========================================================================

    /**
     * Create a new page
     * @param {Object} params - Page creation params
     */
    createPage: async (params) => {
        try {
            const newPage = await notionService.createPage(params);

            // Optimistic update - add to beginning of list
            set(state => ({
                pages: [newPage, ...state.pages],
            }));

            return newPage;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update a page
     * @param {string} pageId - Page ID
     * @param {Object} updates - Update data
     */
    updatePage: async (pageId, updates) => {
        const { pages, currentPage } = get();

        try {
            const updatedPage = await notionService.updatePage(pageId, updates);

            // Update in list
            set({
                pages: pages.map(p => p.id === pageId ? updatedPage : p),
                currentPage: currentPage?.id === pageId ? updatedPage : currentPage,
            });

            return updatedPage;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Archive a page (soft delete)
     * @param {string} pageId - Page ID
     */
    archivePage: async (pageId) => {
        const { pages } = get();

        try {
            await notionService.updatePage(pageId, { archived: true });

            // Remove from list
            set({
                pages: pages.filter(p => p.id !== pageId),
            });
        } catch (error) {
            throw error;
        }
    },

    // =========================================================================
    // Actions - Utility
    // =========================================================================

    /**
     * Clear all errors
     */
    clearErrors: () => {
        set({ pagesError: null, pageError: null });
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
        set({
            pages: [],
            pagesLoading: false,
            pagesError: null,
            hasMorePages: false,
            nextCursor: null,
            lastSearchQuery: '',
            currentPage: null,
            currentPageContent: [],
            pageLoading: false,
            pageError: null,
            isInitialized: false,
        });
    },
}));

// =============================================================================
// Selectors (for performance - memoized)
// =============================================================================

export const selectPages = (state) => state.pages;
export const selectPagesLoading = (state) => state.pagesLoading;
export const selectPagesError = (state) => state.pagesError;
export const selectCurrentPage = (state) => state.currentPage;
export const selectPageLoading = (state) => state.pageLoading;
export const selectIsInitialized = (state) => state.isInitialized;

export default useNotionStore;
