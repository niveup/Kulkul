/**
 * Dashboard Store - Zustand store for dashboard state
 * Manages widget preferences, cached data, and dashboard-specific state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useDashboardStore = create(
    persist(
        (set, get) => ({
            // -------------------------------------------------------------------------
            // Widget Visibility Preferences
            // -------------------------------------------------------------------------
            visibleWidgets: {
                stats: true,
                streakHeatmap: true,
                problemOfDay: true,
                quickAccess: true,
                recentActivity: true,
            },
            toggleWidget: (widgetId) => set((state) => ({
                visibleWidgets: {
                    ...state.visibleWidgets,
                    [widgetId]: !state.visibleWidgets[widgetId],
                }
            })),

            // -------------------------------------------------------------------------
            // Problem of the Day State
            // -------------------------------------------------------------------------
            problemOfDay: null,
            problemOfDayDate: null, // Track which day the problem was set
            problemOfDayStatus: 'unsolved', // 'unsolved' | 'revealed' | 'attempted'

            setProblemOfDay: (problem) => set({
                problemOfDay: problem,
                problemOfDayDate: new Date().toDateString(),
                problemOfDayStatus: 'unsolved',
            }),

            revealProblemOfDay: () => set({ problemOfDayStatus: 'revealed' }),

            markProblemAttempted: () => set({ problemOfDayStatus: 'attempted' }),

            // Check if we need a new problem (new day)
            shouldRefreshProblem: () => {
                const state = get();
                const today = new Date().toDateString();
                return state.problemOfDayDate !== today || !state.problemOfDay;
            },

            // -------------------------------------------------------------------------
            // Recent Activity Log
            // -------------------------------------------------------------------------
            recentActivities: [],
            addActivity: (activity) => set((state) => ({
                recentActivities: [
                    { ...activity, timestamp: new Date().toISOString(), id: Date.now() },
                    ...state.recentActivities.slice(0, 19), // Keep last 20
                ]
            })),
            clearActivities: () => set({ recentActivities: [] }),

            // -------------------------------------------------------------------------
            // Quick Stats Cache
            // -------------------------------------------------------------------------
            cachedStats: {
                totalFocusTime: 0,
                totalSessions: 0,
                currentStreak: 0,
                longestStreak: 0,
                tasksCompletedToday: 0,
                lastUpdated: null,
            },
            updateCachedStats: (stats) => set((state) => ({
                cachedStats: {
                    ...state.cachedStats,
                    ...stats,
                    lastUpdated: new Date().toISOString(),
                }
            })),
        }),
        {
            name: 'studyhub-dashboard-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useDashboardStore;
