/**
 * Utils Index - Application utilities
 * 
 * Central export for utility modules.
 * Import from './utils' for clean imports.
 */

// =============================================================================
// Pomodoro Configuration
// =============================================================================
export { getBuildingConfig } from './pomodoroConfig';

// =============================================================================
// Sound Management
// =============================================================================
export { default as soundManager, useSoundManager } from './soundManager';

// =============================================================================
// Notification Service
// =============================================================================
export { default as notificationService, useNotifications } from './notificationService';

// =============================================================================
// AI Analysis
// =============================================================================
export { analyzeExamWithAI } from './aiAnalyzer';

// =============================================================================
// Math Sanitization (for KaTeX rendering)
// =============================================================================
export { default as sanitizeMath, sanitizeOptions } from './mathSanitizer';

// =============================================================================
// Database Configuration (server-side only)
// =============================================================================
// Note: tidbConfig is for server-side use only, imported directly where needed
