/**
 * useSearch - Advanced Search Hook with Fuse.js
 * 
 * Features:
 * - Fuzzy search with typo tolerance
 * - Operator support (AND, OR, NOT)
 * - Search history tracking
 * - Debounced input
 * - Cloud-ready (localStorage for guest, API for authenticated)
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import { shouldUseLocalStorage } from '../utils/authMode';

// Debounce delay for search input
const DEBOUNCE_MS = 300;
const MAX_HISTORY = 20;
const MAX_RESULTS = 50;

/**
 * Parse search query for operators
 * Supports: AND, OR, NOT (case insensitive)
 * Example: "velocity AND acceleration NOT circular"
 */
const parseSearchQuery = (query) => {
    const normalizedQuery = query.trim();

    // Check for operators
    const hasOperators = /\b(AND|OR|NOT)\b/i.test(normalizedQuery);

    if (!hasOperators) {
        return { type: 'simple', terms: [normalizedQuery] };
    }

    // Parse operators
    const parts = normalizedQuery.split(/\b(AND|OR|NOT)\b/i);
    const tokens = [];
    let currentOperator = 'AND'; // Default operator

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        const upperPart = part.toUpperCase();
        if (['AND', 'OR', 'NOT'].includes(upperPart)) {
            currentOperator = upperPart;
        } else {
            tokens.push({ term: part, operator: currentOperator });
            currentOperator = 'AND'; // Reset to default
        }
    }

    return { type: 'complex', tokens };
};

/**
 * Execute complex query with operators
 */
const executeComplexQuery = (fuse, parsedQuery, allItems) => {
    if (parsedQuery.type === 'simple') {
        return fuse.search(parsedQuery.terms[0]).map(r => r.item);
    }

    let resultSet = new Set();
    let isFirstPositive = true;

    for (const { term, operator } of parsedQuery.tokens) {
        const matches = new Set(fuse.search(term).map(r => r.item));

        if (operator === 'NOT') {
            // Remove NOT matches from current results
            matches.forEach(item => resultSet.delete(item));
        } else if (operator === 'OR') {
            // Union with current results
            matches.forEach(item => resultSet.add(item));
        } else {
            // AND - intersection with current results
            if (isFirstPositive) {
                resultSet = matches;
                isFirstPositive = false;
            } else {
                resultSet = new Set([...resultSet].filter(item => matches.has(item)));
            }
        }
    }

    return [...resultSet];
};

/**
 * Custom hook for advanced search functionality
 * 
 * @param {Object} options
 * @param {Array} options.data - Array of items to search
 * @param {Array} options.keys - Keys to search within each item
 * @param {number} options.fuzzyThreshold - Fuse.js threshold (0 = exact, 1 = match anything)
 * @param {number} options.maxResults - Maximum results to return
 */
export const useSearch = ({
    data = [],
    keys = ['concept', 'theory', 'formula', 'tags', 'uid'],
    fuzzyThreshold = 0.3,
    maxResults = MAX_RESULTS,
}) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimerRef = useRef(null);

    // Build Fuse index once when data changes
    const fuse = useMemo(() => {
        if (!data.length) return null;

        return new Fuse(data, {
            keys,
            threshold: fuzzyThreshold,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2,
            // Extended search for special characters
            useExtendedSearch: true,
        });
    }, [data, keys, fuzzyThreshold]);

    // Debounce the search query
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        setIsLoading(true);
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedQuery(query);
            setIsLoading(false);
        }, DEBOUNCE_MS);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query]);

    // Load search history on mount
    useEffect(() => {
        const loadHistory = async () => {
            if (shouldUseLocalStorage()) {
                const stored = localStorage.getItem('searchHistory');
                if (stored) {
                    try {
                        setHistory(JSON.parse(stored));
                    } catch (e) {
                        console.error('[useSearch] Failed to parse history:', e);
                    }
                }
            } else {
                try {
                    const res = await fetch('/api/search/history');
                    if (res.ok) {
                        const data = await res.json();
                        setHistory(data.history || []);
                    }
                } catch (e) {
                    console.log('[useSearch] Failed to load history from API:', e);
                }
            }
        };
        loadHistory();
    }, []);

    // Execute search
    const results = useMemo(() => {
        if (!fuse || !debouncedQuery.trim()) return [];

        const parsedQuery = parseSearchQuery(debouncedQuery);
        const searchResults = executeComplexQuery(fuse, parsedQuery, data);

        return searchResults.slice(0, maxResults);
    }, [fuse, debouncedQuery, data, maxResults]);

    // Generate suggestions based on partial input
    const suggestions = useMemo(() => {
        if (!fuse || query.length < 2) return [];

        // Get top suggestions from search results
        const searchResults = fuse.search(query, { limit: 5 });
        return searchResults.map(r => ({
            text: r.item.concept || r.item.uid,
            score: r.score,
        }));
    }, [fuse, query]);

    // Add to search history
    const addToHistory = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) return;

        const newHistory = [
            { query: searchQuery, timestamp: Date.now() },
            ...history.filter(h => h.query !== searchQuery),
        ].slice(0, MAX_HISTORY);

        setHistory(newHistory);

        // Persist history
        if (shouldUseLocalStorage()) {
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        } else {
            try {
                await fetch('/api/search/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchQuery }),
                });
            } catch (e) {
                console.log('[useSearch] Failed to save history to API:', e);
            }
        }
    }, [history]);

    // Clear search history
    const clearHistory = useCallback(async () => {
        setHistory([]);

        if (shouldUseLocalStorage()) {
            localStorage.removeItem('searchHistory');
        } else {
            try {
                await fetch('/api/search/history', { method: 'DELETE' });
            } catch (e) {
                console.log('[useSearch] Failed to clear history from API:', e);
            }
        }
    }, []);

    // Search and add to history
    const search = useCallback((searchQuery) => {
        setQuery(searchQuery);
        if (searchQuery.trim().length >= 3) {
            addToHistory(searchQuery);
        }
    }, [addToHistory]);

    return {
        query,
        setQuery,
        results,
        suggestions,
        history,
        isLoading,
        search,
        addToHistory,
        clearHistory,
        resultCount: results.length,
    };
};

export default useSearch;
