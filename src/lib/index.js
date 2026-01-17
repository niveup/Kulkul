/**
 * Lib Index - Core library utilities
 * 
 * Central export for utility functions and animation helpers.
 * Import from './lib' for clean imports.
 */

// =============================================================================
// General Utilities
// =============================================================================
export {
    cn,
    formatNumber,
    truncate,
    getInitials,
    debounce,
    throttle,
    generateId,
    isBrowser,
    prefersReducedMotion,
    sleep,
    safeJsonParse,
    copyToClipboard,
    getGreeting,
    formatRelativeTime,
    Keys,
    isKey,
} from './utils';

// =============================================================================
// Motion/Animation System
// =============================================================================
export {
    // Physics presets
    springs,
    durations,
    stagger,
    // Animation variants
    fadeVariants,
    slideUpVariants,
    slideDownVariants,
    scaleVariants,
    pageVariants,
    staggerContainerVariants,
    staggerItemVariants,
    cardHoverVariants,
    buttonVariants,
    iconBounceVariants,
    sidebarItemVariants,
    tooltipVariants,
    toastVariants,
    overlayVariants,
    modalVariants,
    shimmerVariants,
    // Utility functions
    createStaggerContainer,
    createSlideVariants,
    combineVariants,
} from './motion';

// Default motion export (for backward compatibility)
export { default as motion } from './motion';

// =============================================================================
// Motion Hooks
// =============================================================================
export {
    useMagneticElement,
    use3DTilt,
    useSpotlight,
    useAnimatedCounter,
    useScrollVelocity,
    useParallax,
} from './motionHooks';

// =============================================================================
// Sound Management
// =============================================================================
export { default as SoundManager } from './SoundManager';
