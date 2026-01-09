/**
 * Resource Store - Ultimate Resource Hub
 * 
 * Smart Diff-Based Persistence:
 * - Only stores deltas (changes), not full state
 * - Previous changes kept for 1 day history
 * - Auto-cleanup of expired history on load
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Data files removed - using empty defaults
// If you need to restore formula data, add JSON files back to src/data/
const formulas11 = [];
const formulas12 = [];

// =============================================================================
// CONSTANTS
// =============================================================================
const HISTORY_RETENTION_MS = 24 * 60 * 60 * 1000; // 1 day
const STORAGE_KEY = 'resource-hub-store';

// =============================================================================
// UTILITY: Deep merge changes onto base
// =============================================================================
const deepMerge = (base, changes) => {
    if (!changes || typeof changes !== 'object') return base;
    if (Array.isArray(changes)) return changes;

    const result = { ...base };
    for (const key of Object.keys(changes)) {
        if (changes[key] && typeof changes[key] === 'object' && !Array.isArray(changes[key])) {
            result[key] = deepMerge(base[key] || {}, changes[key]);
        } else {
            result[key] = changes[key];
        }
    }
    return result;
};

// =============================================================================
// UTILITY: Generate diff between old and new state (kept for future use)
// =============================================================================
// eslint-disable-next-line no-unused-vars
const generateDiff = (oldObj, newObj, path = '') => {
    const diff = {};

    for (const key of Object.keys(newObj)) {
        const fullPath = path ? `${path}.${key}` : key;

        if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
            const nestedDiff = generateDiff(oldObj?.[key] || {}, newObj[key], fullPath);
            if (Object.keys(nestedDiff).length > 0) {
                diff[key] = nestedDiff;
            }
        } else if (JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj[key])) {
            diff[key] = newObj[key];
        }
    }

    return diff;
};

// =============================================================================
// BUILD DEFAULT STATE FROM JSON
// =============================================================================
const buildDefaultState = () => {
    const resources = {
        '11': { Physics: {}, Chemistry: {}, Math: {} },
        '12': { Physics: {}, Chemistry: {}, Math: {} }
    };

    const layoutByTopic = {};

    // Process formulas into resources structure
    [formulas11, formulas12].forEach((formulas, classIndex) => {
        const classLevel = classIndex === 0 ? '11' : '12';

        formulas.forEach((chapter) => {
            const topicKey = chapter.topic.toLowerCase().replace(/\s+/g, '-');
            resources[classLevel].Physics[topicKey] = {
                name: chapter.topic,
                concepts: chapter.concepts?.map((concept, idx) => ({
                    id: `${classLevel}-${topicKey}-${idx}`,
                    ...concept,
                    style: {
                        bgGradient: 'default',
                        borderRadius: 16,
                        size: '1x1' // 1x1, 2x1, 2x2, full
                    }
                })) || []
            };

            // Default grid layout for this topic
            layoutByTopic[`${classLevel}-Physics-${topicKey}`] = {
                columns: 3,
                gap: 16
            };
        });
    });

    return {
        resources,
        layouts: layoutByTopic,
        theme: {
            accent: '#6366f1', // Indigo
            glassIntensity: 0.8,
            borderRadius: 16,
            density: 'comfortable' // compact, comfortable, spacious
        }
    };
};

// =============================================================================
// CLEAN EXPIRED HISTORY
// =============================================================================
const cleanExpiredHistory = (history) => {
    const now = Date.now();
    return history.filter(entry => (now - entry.timestamp) < HISTORY_RETENTION_MS);
};

// =============================================================================
// THE STORE
// =============================================================================
export const useResourceStore = create(
    persist(
        (set, get) => ({
            // Current state (computed from base + deltas)
            ...buildDefaultState(),

            // Change tracking
            deltas: [], // Current applied changes
            history: [], // Previous change sets (for undo/history)

            // UI State
            isEditMode: false,
            selectedWidgetId: null,

            // =======================================================================
            // ACTIONS
            // =======================================================================

            setEditMode: (enabled) => set({ isEditMode: enabled }),

            selectWidget: (widgetId) => set({ selectedWidgetId: widgetId }),

            // Update a specific widget's style (color, size, etc.)
            updateWidgetStyle: (classLevel, subject, topicKey, conceptId, styleChanges) => {
                const state = get();
                const currentResources = state.resources;

                // Find and update the concept
                const topic = currentResources[classLevel]?.[subject]?.[topicKey];
                if (!topic) return;

                const conceptIndex = topic.concepts.findIndex(c => c.id === conceptId);
                if (conceptIndex === -1) return;

                const oldStyle = topic.concepts[conceptIndex].style || {};
                const newStyle = { ...oldStyle, ...styleChanges };

                // Create the delta
                const delta = {
                    type: 'WIDGET_STYLE',
                    path: `${classLevel}.${subject}.${topicKey}.${conceptId}`,
                    changes: styleChanges,
                    timestamp: Date.now()
                };

                // Update resources
                const newConcepts = [...topic.concepts];
                newConcepts[conceptIndex] = {
                    ...newConcepts[conceptIndex],
                    style: newStyle
                };

                set({
                    resources: {
                        ...currentResources,
                        [classLevel]: {
                            ...currentResources[classLevel],
                            [subject]: {
                                ...currentResources[classLevel][subject],
                                [topicKey]: {
                                    ...topic,
                                    concepts: newConcepts
                                }
                            }
                        }
                    },
                    deltas: [...state.deltas, delta]
                });
            },

            // Update widget content (text, formula, etc.)
            updateWidgetContent: (classLevel, subject, topicKey, conceptId, contentChanges) => {
                const state = get();
                const currentResources = state.resources;

                const topic = currentResources[classLevel]?.[subject]?.[topicKey];
                if (!topic) return;

                const conceptIndex = topic.concepts.findIndex(c => c.id === conceptId);
                if (conceptIndex === -1) return;

                // Archive old value to history
                const oldConcept = topic.concepts[conceptIndex];
                const historyEntry = {
                    type: 'CONTENT_CHANGE',
                    path: `${classLevel}.${subject}.${topicKey}.${conceptId}`,
                    oldValue: { ...oldConcept },
                    timestamp: Date.now()
                };

                // Create the delta for current state
                const delta = {
                    type: 'WIDGET_CONTENT',
                    path: `${classLevel}.${subject}.${topicKey}.${conceptId}`,
                    changes: contentChanges,
                    timestamp: Date.now()
                };

                const newConcepts = [...topic.concepts];
                newConcepts[conceptIndex] = {
                    ...newConcepts[conceptIndex],
                    ...contentChanges
                };

                // Clean expired history before adding new entry
                const cleanedHistory = cleanExpiredHistory(state.history);

                set({
                    resources: {
                        ...currentResources,
                        [classLevel]: {
                            ...currentResources[classLevel],
                            [subject]: {
                                ...currentResources[classLevel][subject],
                                [topicKey]: {
                                    ...topic,
                                    concepts: newConcepts
                                }
                            }
                        }
                    },
                    deltas: [...state.deltas, delta],
                    history: [...cleanedHistory, historyEntry]
                });
            },

            // Update global theme
            updateTheme: (themeChanges) => {
                const state = get();
                const oldTheme = state.theme;

                // Archive old theme value
                const historyEntry = {
                    type: 'THEME_CHANGE',
                    path: 'theme',
                    oldValue: { ...oldTheme },
                    timestamp: Date.now()
                };

                const delta = {
                    type: 'THEME',
                    changes: themeChanges,
                    timestamp: Date.now()
                };

                const cleanedHistory = cleanExpiredHistory(state.history);

                set({
                    theme: { ...oldTheme, ...themeChanges },
                    deltas: [...state.deltas, delta],
                    history: [...cleanedHistory, historyEntry]
                });
            },

            // Update layout for a topic
            updateLayout: (layoutKey, layoutChanges) => {
                const state = get();
                const currentLayouts = state.layouts;

                const delta = {
                    type: 'LAYOUT',
                    path: layoutKey,
                    changes: layoutChanges,
                    timestamp: Date.now()
                };

                set({
                    layouts: {
                        ...currentLayouts,
                        [layoutKey]: {
                            ...currentLayouts[layoutKey],
                            ...layoutChanges
                        }
                    },
                    deltas: [...state.deltas, delta]
                });
            },

            // Reset everything to default
            resetToDefault: () => {
                const defaultState = buildDefaultState();
                set({
                    ...defaultState,
                    deltas: [],
                    history: [],
                    isEditMode: false,
                    selectedWidgetId: null
                });
            },

            // Get change history for last 24 hours
            getRecentHistory: () => {
                const state = get();
                return cleanExpiredHistory(state.history);
            },

            // Cleanup on store hydration
            _cleanupOnHydrate: () => {
                const state = get();
                const cleanedHistory = cleanExpiredHistory(state.history);
                if (cleanedHistory.length !== state.history.length) {
                    set({ history: cleanedHistory });
                }
            }
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => ({
                // Only persist the deltas and changed state, not default data
                deltas: state.deltas,
                history: state.history,
                theme: state.theme,
                layouts: state.layouts,
                resources: state.resources
            }),
            onRehydrateStorage: () => (state) => {
                // Cleanup expired history on load
                if (state) {
                    state._cleanupOnHydrate();
                }
            }
        }
    )
);

// =============================================================================
// SELECTORS
// =============================================================================
export const useIsEditMode = () => useResourceStore((s) => s.isEditMode);
export const useTheme = () => useResourceStore((s) => s.theme);
export const useResources = () => useResourceStore((s) => s.resources);
export const useLayouts = () => useResourceStore((s) => s.layouts);

// Get individual actions directly from store to avoid creating new object every render
export const useResourceActions = () => {
    const setEditMode = useResourceStore((s) => s.setEditMode);
    const selectWidget = useResourceStore((s) => s.selectWidget);
    const updateWidgetStyle = useResourceStore((s) => s.updateWidgetStyle);
    const updateWidgetContent = useResourceStore((s) => s.updateWidgetContent);
    const updateTheme = useResourceStore((s) => s.updateTheme);
    const updateLayout = useResourceStore((s) => s.updateLayout);
    const resetToDefault = useResourceStore((s) => s.resetToDefault);

    return {
        setEditMode,
        selectWidget,
        updateWidgetStyle,
        updateWidgetContent,
        updateTheme,
        updateLayout,
        resetToDefault
    };
};
