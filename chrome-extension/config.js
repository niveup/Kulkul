// StudyHub Extension - Centralized Configuration
const CONFIG = {
    // Default API base URL (can be overridden via chrome.storage.sync)
    DEFAULT_API_BASE: 'https://personal-dashboard-alpha-gilt.vercel.app',

    // Timer presets in minutes
    TIMER_PRESETS: [25, 45, 60, 90],

    // Screenshot settings
    IMAGE_QUALITY: 0.85,          // JPEG quality (0-1)
    IMAGE_FORMAT: 'image/jpeg',   // Output format for compression
    MAX_SCREENSHOT_HISTORY: 10,   // Max screenshots to keep in local storage

    // Undo settings
    UNDO_TIMEOUT_MS: 4000,       // How long the undo toast stays

    // Retry settings
    MAX_RETRIES: 3,
    BASE_RETRY_DELAY_MS: 1000,

    // Alarm names
    TIMER_ALARM_NAME: 'studyhub-timer-complete',

    // Storage keys
    STORAGE_KEYS: {
        THEME: 'studyhub-theme',
        API_BASE: 'studyhub-api-base',
        TIMER_DATA: 'activeTimerData',
        CAPTURE_COUNT: 'captureCount',
        CAPTURE_DATE: 'captureDate',
        SCREENSHOT_HISTORY: 'screenshotHistory',
        CSS_INJECTED_TABS: 'cssInjectedTabs'
    }
};

// Get API base URL (checks for user override in chrome.storage.sync)
async function getApiBase() {
    try {
        const result = await chrome.storage.sync.get(CONFIG.STORAGE_KEYS.API_BASE);
        return result[CONFIG.STORAGE_KEYS.API_BASE] || CONFIG.DEFAULT_API_BASE;
    } catch {
        return CONFIG.DEFAULT_API_BASE;
    }
}
