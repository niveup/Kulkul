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

// Class 11 Physics Chapters - JEE Complete Syllabus
import { unitsDimensions } from '../data/units-dimensions';
import { kinematics } from '../data/kinematics';
import { lawsOfMotion } from '../data/laws-of-motion';
import { workEnergyPower } from '../data/work-energy-power';
import { rotationalMotion } from '../data/rotational-motion';
import { gravitation } from '../data/gravitation';
import { propertiesOfMatter } from '../data/properties-of-matter';
import { thermodynamics } from '../data/thermodynamics';
import { kineticTheory } from '../data/kinetic-theory';
import { oscillationsWaves } from '../data/oscillations-waves';

// Class 12 Physics Chapters - JEE Complete Syllabus
import { electrostatics } from '../data/electrostatics';
import { capacitor } from '../data/capacitor';
import { currentElectricity } from '../data/current-electricity';
import { magnetism } from '../data/magnetism';
import { electromagneticInduction } from '../data/electromagnetic-induction';
import { alternatingCurrent } from '../data/alternating-current';
import { electromagneticWaves } from '../data/electromagnetic-waves';
import { rayOptics } from '../data/ray-optics';
import { waveOptics } from '../data/wave-optics';
import { dualNature } from '../data/dual-nature';
import { atomsNuclei } from '../data/atoms-nuclei';
import { semiconductors } from '../data/semiconductors';

// Load physics chapters - Complete JEE Physics Syllabus
const formulas11 = [
    unitsDimensions,
    kinematics,
    lawsOfMotion,
    workEnergyPower,
    rotationalMotion,
    gravitation,
    propertiesOfMatter,
    thermodynamics,
    kineticTheory,
    oscillationsWaves
]; // Class 11 Physics chapters - All 10 JEE topics

const formulas12 = [
    electrostatics,
    capacitor,
    currentElectricity,
    magnetism,
    electromagneticInduction,
    alternatingCurrent,
    electromagneticWaves,
    rayOptics,
    waveOptics,
    dualNature,
    atomsNuclei,
    semiconductors
]; // Class 12 Physics chapters - All 12 JEE topics

// =============================================================================
// CONSTANTS
// =============================================================================
const HISTORY_RETENTION_MS = 24 * 60 * 60 * 1000; // 1 day
const STORAGE_KEY = 'resource-hub-store';

// =============================================================================
// UTILITY: Deep merge changes onto base
// =============================================================================
// eslint-disable-next-line no-unused-vars
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
                    ...concept
                })) || []
            };

        });
    });

    return {
        resources,
        layouts: layoutByTopic,
        theme: {
            accent: '#10b981', // Emerald
            glassIntensity: 0.8,
            borderRadius: 16
        },
        mastery: {} // { 'concept-id': 0-100 }
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
            mastery: {}, // Persistent mastery levels

            mastery: {}, // Persistent mastery levels

            // =======================================================================
            // ACTIONS
            // =======================================================================


            // Reset everything to default
            resetToDefault: () => {
                const defaultState = buildDefaultState();
                set({
                    ...defaultState,
                    deltas: [],
                    history: []
                });
            },

            // Get change history for last 24 hours
            getRecentHistory: () => {
                const state = get();
                return cleanExpiredHistory(state.history);
            },

            // Update mastery for a concept
            updateMastery: (conceptId, level) => {
                const state = get();
                const newMastery = {
                    ...state.mastery,
                    [conceptId]: Math.min(100, Math.max(0, level))
                };

                set({ mastery: newMastery });
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
                mastery: state.mastery,
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
export const useTheme = () => useResourceStore((s) => s.theme);
export const useResources = () => useResourceStore((s) => s.resources);
export const useLayouts = () => ({});
export const useMastery = () => useResourceStore((s) => s.mastery);

// Get individual actions directly from store to avoid creating new object every render
export const useResourceActions = () => {
    return {
        updateMastery: useResourceStore((s) => s.updateMastery)
    };
};
