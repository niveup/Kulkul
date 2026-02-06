/**
 * Tag Definitions for Physics Concepts
 * Centralized tag registry with metadata for visual display
 * 
 * @cloud-ready: This structure is JSON-serializable for API transport
 */

// Color palette for tags (using Tailwind-compatible colors)
export const TAG_COLORS = {
    emerald: { light: 'bg-emerald-100 text-emerald-700 border-emerald-200', dark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    teal: { light: 'bg-teal-100 text-teal-700 border-teal-200', dark: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    green: { light: 'bg-green-100 text-green-700 border-green-200', dark: 'bg-green-500/20 text-green-300 border-green-500/30' },
    cyan: { light: 'bg-cyan-100 text-cyan-700 border-cyan-200', dark: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    orange: { light: 'bg-orange-100 text-orange-700 border-orange-200', dark: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    amber: { light: 'bg-amber-100 text-amber-700 border-amber-200', dark: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    red: { light: 'bg-red-100 text-red-700 border-red-200', dark: 'bg-red-500/20 text-red-300 border-red-500/30' },
    slate: { light: 'bg-slate-100 text-slate-700 border-slate-200', dark: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

// Difficulty levels with visual styling
export const DIFFICULTY_LEVELS = {
    Easy: {
        color: 'green',
        icon: '🟢',
        label: 'Easy',
        description: 'Basic concepts, direct formula application'
    },
    Medium: {
        color: 'amber',
        icon: '🟡',
        label: 'Medium',
        description: 'Multiple steps, concept combinations'
    },
    Hard: {
        color: 'red',
        icon: '🔴',
        label: 'Hard',
        description: 'Complex problems, deep understanding required'
    }
};

/**
 * Physics Tags Registry
 * Organized by broad categories for easier filtering
 */
export const PHYSICS_TAGS = {
    // Motion & Mechanics
    'kinematics': { label: 'Kinematics', color: 'emerald', category: 'mechanics' },
    'dynamics': { label: 'Dynamics', color: 'emerald', category: 'mechanics' },
    'linear-motion': { label: 'Linear Motion', color: 'emerald', category: 'mechanics' },
    'circular-motion': { label: 'Circular Motion', color: 'emerald', category: 'mechanics' },
    'projectile': { label: 'Projectile', color: 'emerald', category: 'mechanics' },
    'relative-motion': { label: 'Relative Motion', color: 'emerald', category: 'mechanics' },
    'rotational': { label: 'Rotational', color: 'emerald', category: 'mechanics' },

    // Forces & Newton's Laws
    'forces': { label: 'Forces', color: 'teal', category: 'forces' },
    'friction': { label: 'Friction', color: 'teal', category: 'forces' },
    'tension': { label: 'Tension', color: 'teal', category: 'forces' },
    'gravity': { label: 'Gravity', color: 'teal', category: 'forces' },
    'normal-force': { label: 'Normal Force', color: 'teal', category: 'forces' },

    // Energy & Work
    'energy': { label: 'Energy', color: 'green', category: 'energy' },
    'work': { label: 'Work', color: 'green', category: 'energy' },
    'power': { label: 'Power', color: 'green', category: 'energy' },
    'conservation': { label: 'Conservation', color: 'green', category: 'energy' },
    'collision': { label: 'Collision', color: 'green', category: 'energy' },

    // Vectors & Math
    'vectors': { label: 'Vectors', color: 'orange', category: 'math' },
    'calculus': { label: 'Calculus', color: 'orange', category: 'math' },
    'graphs': { label: 'Graphs', color: 'orange', category: 'math' },
    'trigonometry': { label: 'Trigonometry', color: 'orange', category: 'math' },

    // Electromagnetism
    'electrostatics': { label: 'Electrostatics', color: 'teal', category: 'em' },
    'current': { label: 'Current', color: 'teal', category: 'em' },
    'magnetism': { label: 'Magnetism', color: 'teal', category: 'em' },
    'electromagnetic': { label: 'Electromagnetic', color: 'teal', category: 'em' },
    'capacitor': { label: 'Capacitor', color: 'teal', category: 'em' },
    'inductor': { label: 'Inductor', color: 'teal', category: 'em' },

    // Waves & Optics
    'waves': { label: 'Waves', color: 'cyan', category: 'waves' },
    'oscillation': { label: 'Oscillation', color: 'cyan', category: 'waves' },
    'optics': { label: 'Optics', color: 'cyan', category: 'waves' },
    'interference': { label: 'Interference', color: 'cyan', category: 'waves' },
    'diffraction': { label: 'Diffraction', color: 'cyan', category: 'waves' },

    // Thermodynamics
    'thermodynamics': { label: 'Thermodynamics', color: 'red', category: 'thermo' },
    'heat': { label: 'Heat', color: 'red', category: 'thermo' },
    'entropy': { label: 'Entropy', color: 'red', category: 'thermo' },
    'gas-laws': { label: 'Gas Laws', color: 'red', category: 'thermo' },

    // Modern Physics
    'atomic': { label: 'Atomic', color: 'pink', category: 'modern' },
    'nuclear': { label: 'Nuclear', color: 'pink', category: 'modern' },
    'quantum': { label: 'Quantum', color: 'pink', category: 'modern' },
    'photoelectric': { label: 'Photoelectric', color: 'pink', category: 'modern' },
    'semiconductor': { label: 'Semiconductor', color: 'pink', category: 'modern' },

    // Problem Types
    'numerical': { label: 'Numerical', color: 'slate', category: 'type' },
    'conceptual': { label: 'Conceptual', color: 'slate', category: 'type' },
    'derivation': { label: 'Derivation', color: 'slate', category: 'type' },
    'jee-advanced': { label: 'JEE Advanced', color: 'amber', category: 'exam' },
    'jee-mains': { label: 'JEE Mains', color: 'amber', category: 'exam' },
};

/**
 * Tag categories for grouped filtering
 */
export const TAG_CATEGORIES = {
    mechanics: { label: 'Mechanics', order: 1 },
    forces: { label: 'Forces & Laws', order: 2 },
    energy: { label: 'Energy & Work', order: 3 },
    math: { label: 'Mathematical', order: 4 },
    em: { label: 'Electromagnetism', order: 5 },
    waves: { label: 'Waves & Optics', order: 6 },
    thermo: { label: 'Thermodynamics', order: 7 },
    modern: { label: 'Modern Physics', order: 8 },
    type: { label: 'Problem Type', order: 9 },
    exam: { label: 'Exam Focus', order: 10 },
};

/**
 * Helper function to get tag styling
 * @param {string} tagId - Tag identifier
 * @param {boolean} isDarkMode - Theme mode
 * @returns {string} Tailwind classes for tag styling
 */
export const getTagClasses = (tagId, isDarkMode) => {
    const tag = PHYSICS_TAGS[tagId];
    if (!tag) return isDarkMode ? TAG_COLORS.slate.dark : TAG_COLORS.slate.light;

    const colorScheme = TAG_COLORS[tag.color] || TAG_COLORS.slate;
    return isDarkMode ? colorScheme.dark : colorScheme.light;
};

/**
 * Get all tags for a category
 * @param {string} categoryId - Category identifier
 * @returns {Array} Array of tag objects
 */
export const getTagsByCategory = (categoryId) => {
    return Object.entries(PHYSICS_TAGS)
        .filter(([_, tag]) => tag.category === categoryId)
        .map(([id, tag]) => ({ id, ...tag }));
};

export default PHYSICS_TAGS;
