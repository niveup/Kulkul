/**
 * Motion Library - Enterprise Animation System
 * 
 * Standardized motion primitives for the "Billion Dollar" feel.
 * Uses Framer Motion's spring physics for natural, responsive animations.
 */

// =============================================================================
// SPRING CONFIGURATIONS (Physics Presets)
// =============================================================================

export const springs = {
    // Snappy - For micro-interactions (hover, click, toggle)
    snappy: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.5,
    },

    // Smooth - For layout transitions, list reordering
    smooth: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 0.8,
    },

    // Gentle - For page transitions, large modals
    gentle: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        mass: 1,
    },

    // Bouncy - For celebratory effects (completion, success)
    bouncy: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
        mass: 0.5,
    },

    // Weighted - For heavy elements (modals, overlays)
    weighted: {
        type: 'spring',
        stiffness: 150,
        damping: 25,
        mass: 1.2,
    },

    // Instant - Near-instant but still physics-based
    instant: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.3,
    },
};

// =============================================================================
// DURATION PRESETS (For tween animations)
// =============================================================================

export const durations = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    glacial: 0.8,
};

// =============================================================================
// STAGGER PRESETS (For list orchestration)
// =============================================================================

export const stagger = {
    fast: 0.03,
    normal: 0.05,
    slow: 0.08,
    cascade: 0.1,
};

// =============================================================================
// ANIMATION VARIANTS (Reusable motion patterns)
// =============================================================================

/**
 * Fade In/Out
 */
export const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

/**
 * Slide Up (for list items, cards)
 */
export const slideUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

/**
 * Slide Down (for dropdowns, menus)
 */
export const slideDownVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

/**
 * Scale In (for modals, popups)
 */
export const scaleVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

/**
 * Page Transition (blur + scale + fade)
 */
export const pageVariants = {
    initial: {
        opacity: 0,
        scale: 0.98,
        filter: 'blur(8px)',
        y: 20,
    },
    animate: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        y: 0,
    },
    exit: {
        opacity: 0,
        scale: 1.02,
        filter: 'blur(8px)',
        y: -10,
    },
};

/**
 * Stagger Container (parent for list items)
 */
export const staggerContainerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: stagger.normal,
            delayChildren: 0.1,
        },
    },
    exit: {
        transition: {
            staggerChildren: stagger.fast,
            staggerDirection: -1,
        },
    },
};

/**
 * Stagger Item (child for list items)
 */
export const staggerItemVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springs.smooth,
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: springs.snappy,
    },
};

/**
 * Card Hover Effect
 */
export const cardHoverVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: springs.snappy,
    },
    tap: {
        scale: 0.98,
        transition: springs.instant,
    },
};

/**
 * Button Press Effect
 */
export const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: springs.snappy },
    tap: { scale: 0.96, transition: springs.instant },
};

/**
 * Icon Bounce (for active states)
 */
export const iconBounceVariants = {
    initial: { scale: 1, rotate: 0 },
    active: {
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0],
        transition: {
            duration: 0.4,
            ease: 'easeInOut',
        },
    },
};

/**
 * Sidebar Item Variants
 */
export const sidebarItemVariants = {
    initial: { x: -10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
    hover: { x: 4, transition: springs.snappy },
};

/**
 * Tooltip Variants
 */
export const tooltipVariants = {
    initial: { opacity: 0, scale: 0.9, y: 5 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: springs.snappy,
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 5,
        transition: { duration: 0.1 },
    },
};

/**
 * Notification/Toast Variants
 */
export const toastVariants = {
    initial: { opacity: 0, x: 100, scale: 0.9 },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: springs.bouncy,
    },
    exit: {
        opacity: 0,
        x: 100,
        scale: 0.9,
        transition: springs.snappy,
    },
};

/**
 * Modal Overlay
 */
export const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Modal Content
 */
export const modalVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: springs.weighted,
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: springs.snappy,
    },
};

/**
 * Skeleton Shimmer (for loading states)
 */
export const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
        backgroundPosition: '200% 0',
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
        },
    },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a stagger container with custom timing
 */
export const createStaggerContainer = (staggerDelay = stagger.normal, delayChildren = 0) => ({
    initial: {},
    animate: {
        transition: {
            staggerChildren: staggerDelay,
            delayChildren,
        },
    },
});

/**
 * Create slide variants with custom direction
 */
export const createSlideVariants = (direction = 'up', distance = 20) => {
    const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const sign = direction === 'up' || direction === 'left' ? 1 : -1;

    return {
        initial: { opacity: 0, [axis]: distance * sign },
        animate: { opacity: 1, [axis]: 0 },
        exit: { opacity: 0, [axis]: distance * -sign * 0.5 },
    };
};

/**
 * Combine multiple variants
 */
export const combineVariants = (...variants) => {
    return variants.reduce((acc, variant) => ({
        initial: { ...acc.initial, ...variant.initial },
        animate: { ...acc.animate, ...variant.animate },
        exit: { ...acc.exit, ...variant.exit },
        hover: { ...acc.hover, ...variant.hover },
        tap: { ...acc.tap, ...variant.tap },
    }), {});
};

export default {
    springs,
    durations,
    stagger,
    variants: {
        fade: fadeVariants,
        slideUp: slideUpVariants,
        slideDown: slideDownVariants,
        scale: scaleVariants,
        page: pageVariants,
        staggerContainer: staggerContainerVariants,
        staggerItem: staggerItemVariants,
        cardHover: cardHoverVariants,
        button: buttonVariants,
        iconBounce: iconBounceVariants,
        sidebarItem: sidebarItemVariants,
        tooltip: tooltipVariants,
        toast: toastVariants,
        overlay: overlayVariants,
        modal: modalVariants,
        shimmer: shimmerVariants,
    },
};
