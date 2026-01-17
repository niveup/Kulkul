/**
 * Components Index
 * 
 * Master barrel file for all component exports.
 * Enables clean imports: import { Sidebar, Spinner } from './components';
 */

// =============================================================================
// Core Layout Components
// =============================================================================
export { default as Sidebar } from './Sidebar';
export { default as AddAppModal } from './AddAppModal';
export { default as AppCard } from './AppCard';
export { default as PasswordModal } from './PasswordModal';

// =============================================================================
// Sub-component Barrel Exports
// =============================================================================

// UI Components
export * from './ui';

// Widgets
export * from './widgets';

// Navigation
export * from './navigation';

// Tools (lazy load recommended due to size)
// Note: For heavy components like CityBuilder, prefer direct lazy imports
// import { PomodoroTimer, TodoList } from './tools';
