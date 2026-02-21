// StudyHub Quick Capture - Background Service Worker

// ─── Configurable API Base ───
let API_BASE = 'https://personal-dashboard-alpha-gilt.vercel.app';

// Load API base from storage (allows user to configure)
async function initApiBase() {
    try {
        const result = await chrome.storage.sync.get('studyhub-api-base');
        if (result['studyhub-api-base']) {
            API_BASE = result['studyhub-api-base'];
        }
    } catch (e) {
        console.log('[Background] Using default API_BASE');
    }
}
initApiBase();

// Listen for API base changes
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes['studyhub-api-base']) {
        API_BASE = changes['studyhub-api-base'].newValue || 'https://personal-dashboard-alpha-gilt.vercel.app';
        console.log('[Background] API_BASE updated to:', API_BASE);
    }
});

// Shared secret for API authentication (loaded from storage)
let EXTENSION_KEY = '';

async function initExtensionKey() {
    try {
        const result = await chrome.storage.sync.get('studyhub-extension-key');
        if (result['studyhub-extension-key']) {
            EXTENSION_KEY = result['studyhub-extension-key'];
        }
    } catch (e) {
        console.log('[Background] No extension key found');
    }
}
initExtensionKey();

// Listen for key changes
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes['studyhub-extension-key']) {
        EXTENSION_KEY = changes['studyhub-extension-key'].newValue || '';
    }
});

// Get API headers — marks request as coming from extension with shared secret
function getApiHeaders(includeContentType = true) {
    const headers = {
        'X-Source': 'extension',
        'X-Extension-Key': EXTENSION_KEY
    };
    if (includeContentType) headers['Content-Type'] = 'application/json';
    return headers;
}

// Retry wrapper for API calls — handles 429 with exponential backoff
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && attempt < maxRetries) {
                const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
                console.log(`[Background] 429 rate-limited, retrying in ${Math.round(waitMs)}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            return response;
        } catch (err) {
            if (attempt < maxRetries) {
                const waitMs = Math.pow(2, attempt) * 1000;
                console.log(`[Background] Network error, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            throw err;
        }
    }
}

const TIMER_ALARM_NAME = 'studyhub-timer-complete';
const BADGE_ALARM_NAME = 'studyhub-badge-update';

// ─── CSS Injection Guard ───
const cssInjectedTabs = new Set();

chrome.tabs.onRemoved.addListener((tabId) => {
    cssInjectedTabs.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        cssInjectedTabs.delete(tabId);
    }
});

// ─── Badge Timer Display ───
async function updateBadge() {
    try {
        const data = await chrome.storage.local.get('activeTimerData');
        const timer = data.activeTimerData;
        if (timer && timer.startTime && timer.durationSeconds) {
            const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
            const remaining = timer.durationSeconds - elapsed;
            if (remaining > 0) {
                const mins = Math.ceil(remaining / 60);
                chrome.action.setBadgeText({ text: `${mins}m` });
                chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
                return;
            }
        }
        // No active timer — clear badge
        chrome.action.setBadgeText({ text: '' });
    } catch (err) {
        chrome.action.setBadgeText({ text: '' });
    }
}

function startBadgeUpdates() {
    updateBadge();
    chrome.alarms.create(BADGE_ALARM_NAME, { periodInMinutes: 1 }); // every minute
}

function stopBadgeUpdates() {
    chrome.alarms.clear(BADGE_ALARM_NAME);
    chrome.action.setBadgeText({ text: '' });
}

// ─── Pre-load Data on Browser Start ───
async function preloadData() {
    console.log('[Background] Pre-loading data...');
    try {
        const [timer, todos] = await Promise.allSettled([
            fetchActiveTimer(),
            fetchTodos()
        ]);
        const cache = {};
        if (timer.status === 'fulfilled') {
            cache.cachedTimer = timer.value;
            // Start badge if timer is active
            if (timer.value && timer.value.status === 'active') {
                startBadgeUpdates();
            }
        }
        if (todos.status === 'fulfilled') {
            cache.cachedTodos = todos.value;
        }
        await chrome.storage.local.set(cache);
        console.log('[Background] Data pre-loaded');
    } catch (err) {
        console.error('[Background] Pre-load failed:', err);
    }
}

chrome.runtime.onStartup.addListener(preloadData);
chrome.runtime.onInstalled.addListener(preloadData);

// ─── Timer Completion via chrome.alarms ───
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === BADGE_ALARM_NAME) {
        updateBadge();
        return;
    }
    if (alarm.name !== TIMER_ALARM_NAME) return;
    console.log('[Background] Timer alarm fired — completing session');

    try {
        // Read stored timer data
        const data = await chrome.storage.local.get('activeTimerData');
        const timerData = data.activeTimerData;
        if (!timerData) {
            console.log('[Background] No timer data found, skipping');
            return;
        }

        const minutes = Math.floor(timerData.durationSeconds / 60);

        // Deterministic ID based on start time (Idempotency Key)
        // Matches App.jsx logic
        const sessionId = timerData.startTime
            ? `session-${timerData.startTime}-${timerData.durationSeconds}`
            : `session-${Date.now()}-${timerData.durationSeconds}`;

        // Save completed session
        const session = {
            id: sessionId,
            type: 'focus',
            minutes: minutes,
            elapsedSeconds: timerData.durationSeconds,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        const headers = getApiHeaders();
        try {
            await fetchWithRetry(`${API_BASE}/api/sessions`, {
                method: 'POST',
                headers,
                body: JSON.stringify(session)
            });
            console.log('[Background] Completed session saved to DB');
        } catch (dbErr) {
            console.warn('[Background] Failed to save session to DB, but completing locally:', dbErr);
        }

        // Delete active timer in DB
        try {
            await fetchWithRetry(`${API_BASE}/api/active-timer`, {
                method: 'DELETE',
                headers
            });
        } catch (dbErr) {
            console.warn('[Background] Failed to delete active timer in DB:', dbErr);
        }

        // Clear stored timer data
        await chrome.storage.local.remove('activeTimerData');

        // Show notification
        chrome.notifications.create('timer-complete', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '🎉 Study Session Complete!',
            message: `${minutes}-minute focus session completed. Great work!`,
            priority: 2
        });

    } catch (err) {
        console.error('[Background] Timer completion error:', err);
        stopBadgeUpdates();
    }
});

// Helper: schedule alarm for timer end
async function scheduleTimerAlarm(durationSeconds, startTime) {
    const endTimeMs = startTime + (durationSeconds * 1000);
    const delayMs = endTimeMs - Date.now();

    if (delayMs <= 0) {
        // Timer already expired
        chrome.alarms.create(TIMER_ALARM_NAME, { when: Date.now() + 100 });
    } else {
        chrome.alarms.create(TIMER_ALARM_NAME, { when: endTimeMs });
    }

    // Store timer data for completion handler
    await chrome.storage.local.set({
        activeTimerData: { durationSeconds, startTime }
    });
    console.log(`[Background] Timer alarm set for ${Math.round(delayMs / 1000)}s from now`);
}

async function clearTimerAlarm() {
    await chrome.alarms.clear(TIMER_ALARM_NAME);
    await chrome.storage.local.remove('activeTimerData');
    console.log('[Background] Timer alarm cleared');
}

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
    console.log('[Background] Command received:', command);
    if (command === 'capture-screenshot') {
        await startCapture();
    }
});

// Listen via message (e.g. from popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Background] Message received:', request.action);

    if (request.action === 'startCapture') {
        startCapture(request.tabId)
            .then(() => sendResponse({ success: true }))
            .catch(err => {
                console.error('[Background] Capture error:', err);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (request.action === 'captureFullPage') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' })
            .then(dataUrl => sendResponse({ dataUrl }))
            .catch(err => {
                console.error('[Background] Capture error:', err);
                sendResponse({ dataUrl: null, error: err.message });
            });
        return true;
    }

    if (request.action === 'saveScreenshot') {
        saveScreenshot(request)
            .then(result => sendResponse(result))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'fetchNotes') {
        fetchNotes()
            .then(notes => sendResponse({ notes }))
            .catch(err => sendResponse({ notes: [], error: err.message }));
        return true;
    }

    if (request.action === 'fetchChapters') {
        fetchChapters()
            .then(data => sendResponse(data))
            .catch(err => sendResponse({ chapters: [], error: err.message }));
        return true;
    }

    // ─── Todo handlers ───
    if (request.action === 'fetchTodos') {
        fetchTodos()
            .then(todos => sendResponse({ todos }))
            .catch(err => sendResponse({ todos: [], error: err.message }));
        return true;
    }

    if (request.action === 'addTodo') {
        addTodo(request.text)
            .then(todo => sendResponse({ success: true, todo }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'toggleTodo') {
        toggleTodo(request.id, request.completed)
            .then(() => sendResponse({ success: true }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'deleteTodo') {
        deleteTodo(request.id)
            .then(() => sendResponse({ success: true }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    // ─── Sessions handler ───
    if (request.action === 'fetchSessions') {
        fetchSessions()
            .then(sessions => sendResponse({ sessions }))
            .catch(err => sendResponse({ sessions: [], error: err.message }));
        return true;
    }

    // ─── Timer handlers ───
    if (request.action === 'fetchTimer') {
        fetchActiveTimer()
            .then(async timer => {
                // If timer is active, ensure alarm is set for auto-completion
                if (timer && timer.status === 'active' && timer.startTime && timer.durationSeconds) {
                    await scheduleTimerAlarm(Number(timer.durationSeconds), Number(timer.startTime));
                }
                sendResponse({ timer });
            })
            .catch(err => sendResponse({ timer: { status: 'idle' }, error: err.message }));
        return true;
    }

    if (request.action === 'startTimer') {
        startTimer(request.durationSeconds)
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'pauseTimer') {
        pauseTimer(request.pausedRemaining, request.durationSeconds)
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'resumeTimer') {
        resumeTimer(request.durationSeconds)
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'stopTimer') {
        stopTimer(request.sessionData)
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    // ─── Stats aggregate handler (combines 3 calls) ───
    if (request.action === 'fetchAllStats') {
        Promise.all([
            fetchSessions().catch(() => []),
            fetchNotes().catch(() => []),
            fetchTodos().catch(() => [])
        ]).then(([sessions, notes, todos]) => {
            sendResponse({ sessions, notes, todos });
        }).catch(err => {
            sendResponse({ sessions: [], notes: [], todos: [], error: err.message });
        });
        return true;
    }
});

// ─── Existing functions (updated with fetchWithRetry) ───

async function startCapture(explicitTabId = null) {
    console.log('[Background] Starting capture...');

    try {
        let tab;

        if (explicitTabId) {
            tab = await chrome.tabs.get(explicitTabId).catch(() => null);
        }

        if (!tab) {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            tab = tabs[0];

            if (!tab) {
                console.log('[Background] No tab in current window, trying last focused...');
                const lastFocusedTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
                tab = lastFocusedTabs[0];
            }
        }

        if (!tab) {
            console.error('[Background] No active tab found');
            return;
        }

        console.log('[Background] Active tab:', tab.url, 'ID:', tab.id);

        if (tab.url.startsWith('chrome://') || tab.url.startsWith('brave://') ||
            tab.url.startsWith('edge://') || tab.url.startsWith('about:') ||
            tab.url.startsWith('view-source:') || !tab.url) {
            console.error('[Background] Cannot inject into restricted browser pages');
            try {
                await chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id });
                await chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId: tab.id });
                setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 3000);
            } catch (e) { }
            return;
        }

        // CSS injection guard — only inject if not already done for this tab
        if (!cssInjectedTabs.has(tab.id)) {
            console.log('[Background] Injecting CSS (first time for tab)...');
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['content.css']
            });
            cssInjectedTabs.add(tab.id);
        } else {
            console.log('[Background] CSS already injected for tab, skipping...');
        }

        console.log('[Background] Injecting content script...');
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        await new Promise(r => setTimeout(r, 100));

        console.log('[Background] Sending startSelection message...');
        chrome.tabs.sendMessage(tab.id, { action: 'startSelection' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Background] Message error:', chrome.runtime.lastError.message);
            } else {
                console.log('[Background] Selection started:', response);
            }
        });

    } catch (err) {
        console.error('[Background] Error in startCapture:', err);
    }
}

async function fetchNotes() {
    try {
        const headers = getApiHeaders(false);
        const response = await fetchWithRetry(`${API_BASE}/api/notes`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : (data.notes || []);
    } catch (err) {
        console.error('[Background] Failed to fetch notes:', err);
        return [];
    }
}

async function fetchChapters() {
    try {
        const headers = getApiHeaders(false);
        const response = await fetchWithRetry(`${API_BASE}/api/chapter-tracker`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Background] Failed to fetch chapters:', err);
        return { chapters: [], entries: [] };
    }
}

// ─── Todo API functions ───

async function fetchTodos() {
    try {
        const headers = getApiHeaders(false);
        const response = await fetchWithRetry(`${API_BASE}/api/daily-todos`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Background] Failed to fetch todos:', err);
        return [];
    }
}

async function addTodo(text) {
    const headers = getApiHeaders();
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const createdAt = new Date().toISOString();
    const response = await fetchWithRetry(`${API_BASE}/api/daily-todos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id, text, createdAt })
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
}

async function toggleTodo(id, completed) {
    const headers = getApiHeaders();
    const response = await fetchWithRetry(`${API_BASE}/api/daily-todos/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ completed })
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
}

async function deleteTodo(id) {
    const headers = getApiHeaders();
    const response = await fetchWithRetry(`${API_BASE}/api/daily-todos/${id}`, {
        method: 'DELETE',
        headers
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
}

// ─── Sessions API function ───

async function fetchSessions() {
    try {
        const headers = getApiHeaders(false);
        const response = await fetchWithRetry(`${API_BASE}/api/sessions`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Background] Failed to fetch sessions:', err);
        return [];
    }
}

// ─── Image Compression Helper ───
async function compressImageData(base64DataUrl, quality = 0.85) {
    try {
        // Create an OffscreenCanvas to compress the image
        const response = await fetch(base64DataUrl);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();

        const compressedBlob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: quality
        });

        // Convert blob back to base64
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onloadend = () => {
                const compressedSize = (reader.result.length * 3) / 4; // approximate bytes
                const originalSize = (base64DataUrl.length * 3) / 4;
                const savedPercent = Math.round((1 - compressedSize / originalSize) * 100);
                console.log(`[Background] Image compressed: saved ~${savedPercent}% (${Math.round(originalSize / 1024)}KB → ${Math.round(compressedSize / 1024)}KB)`);
                resolve(reader.result);
            };
            reader.readAsDataURL(compressedBlob);
        });
    } catch (err) {
        console.warn('[Background] Image compression failed, using original:', err.message);
        return base64DataUrl; // Fallback to original
    }
}

// Save screenshot to either Note system or Chapter Tracker
async function saveScreenshot(request) {
    const { system, imageName } = request;
    let { imageData } = request;

    try {
        // Compress image before uploading
        if (imageData) {
            imageData = await compressImageData(imageData);
        }

        const headers = getApiHeaders();

        if (system === 'chapter-tracker') {
            const { chapterId, entryId, subject, chapterName, text, description, urls, createNewChapter, createNewEntry, type, tags, priority } = request;
            console.log('[Background] Saving to Chapter Tracker:', text || entryId);

            const response = await fetchWithRetry(`${API_BASE}/api/chapter-tracker?action=attach-screenshot`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    imageData, chapterId, entryId, subject, chapterName, text, description,
                    urls, imageName, type, tags: tags || [], priority: priority || 'medium',
                    createNewChapter, createNewEntry
                })
            });
            // Save to screenshot history
            await saveToScreenshotHistory(imageData, imageName, 'chapter-tracker', text || chapterName);
            return await response.json();

        } else {
            const { noteId, title, description, links, createNew } = request;
            console.log('[Background] Saving to Learning Notes:', title);

            const response = await fetchWithRetry(`${API_BASE}/api/notes?action=attach-screenshot`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    imageData, noteId, title, subject: request.subject,
                    description, links, imageName, createNew
                })
            });
            // Save to screenshot history
            await saveToScreenshotHistory(imageData, imageName, 'learning-notes', title || noteId);
            return await response.json();
        }
    } catch (err) {
        console.error('[Background] Failed to save screenshot:', err);
        return { success: false, error: err.message };
    }
}

// ─── Screenshot History ───
async function saveToScreenshotHistory(imageData, imageName, system, label) {
    try {
        const MAX_HISTORY = 10;
        const result = await chrome.storage.local.get('screenshotHistory');
        const history = result.screenshotHistory || [];

        // Store a thumbnail (much smaller data URL) instead of full image
        const thumbnail = await compressImageData(imageData, 0.3);

        history.unshift({
            id: String(Date.now()),
            thumbnail,
            imageName: imageName || 'Untitled',
            system,
            label: label || 'Unknown',
            timestamp: new Date().toISOString()
        });

        // Keep only the last MAX_HISTORY items
        if (history.length > MAX_HISTORY) {
            history.length = MAX_HISTORY;
        }

        await chrome.storage.local.set({ screenshotHistory: history });
        console.log(`[Background] Screenshot history updated (${history.length} items)`);
    } catch (err) {
        console.warn('[Background] Failed to save screenshot history:', err.message);
    }
}

// ─── Timer API functions ───

async function fetchActiveTimer() {
    try {
        const headers = getApiHeaders(false);
        const response = await fetchWithRetry(`${API_BASE}/api/active-timer`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Background] Failed to fetch timer:', err);
        return { status: 'idle' };
    }
}

async function startTimer(durationSeconds) {
    const headers = getApiHeaders();
    const now = Date.now();
    let dbSuccess = false;

    try {
        const response = await fetchWithRetry(`${API_BASE}/api/active-timer`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                startTime: now,
                durationSeconds,
                status: 'active'
            })
        });
        if (response.ok) dbSuccess = true;
    } catch (err) {
        console.warn('[Background] DB sync failed, starting timer LOCALLY:', err);
    }

    // Schedule alarm for auto-completion
    await scheduleTimerAlarm(durationSeconds, now);
    startBadgeUpdates();

    // Cache timer state for instant popup (LOCAL STATE)
    await chrome.storage.local.set({ cachedTimer: { startTime: now, durationSeconds, status: 'active', synced: dbSuccess } });

    return { success: true, localOnly: !dbSuccess };
}

async function pauseTimer(pausedRemaining, durationSeconds) {
    const headers = getApiHeaders();
    let dbSuccess = false;

    try {
        const response = await fetchWithRetry(`${API_BASE}/api/active-timer`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                durationSeconds: durationSeconds || 0,
                pausedRemaining,
                status: 'paused'
            })
        });
        if (response.ok) dbSuccess = true;
    } catch (err) {
        console.warn('[Background] DB sync failed, pausing timer LOCALLY:', err);
    }

    // Clear alarm while paused
    await clearTimerAlarm();
    stopBadgeUpdates();

    // Cache paused state
    await chrome.storage.local.set({ cachedTimer: { durationSeconds, pausedRemaining, status: 'paused', synced: dbSuccess } });

    return { success: true, localOnly: !dbSuccess };
}

async function resumeTimer(durationSeconds) {
    const headers = getApiHeaders();
    const now = Date.now();
    let dbSuccess = false;

    try {
        const response = await fetchWithRetry(`${API_BASE}/api/active-timer`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                startTime: now,
                durationSeconds,
                pausedRemaining: null,
                status: 'active'
            })
        });
        if (response.ok) dbSuccess = true;
    } catch (err) {
        console.warn('[Background] DB sync failed, resuming timer LOCALLY:', err);
    }

    // Schedule alarm for remaining time
    await scheduleTimerAlarm(durationSeconds, now);
    startBadgeUpdates();

    // Cache resumed state
    await chrome.storage.local.set({ cachedTimer: { startTime: now, durationSeconds, status: 'active', synced: dbSuccess } });

    return { success: true, localOnly: !dbSuccess };
}

async function stopTimer(sessionData) {
    const headers = getApiHeaders();

    // Clear alarm — user manually ended
    await clearTimerAlarm();
    stopBadgeUpdates();
    await chrome.storage.local.set({ cachedTimer: { status: 'idle' } });

    // Save failed session (ruin) if session data provided
    if (sessionData) {
        try {
            await fetchWithRetry(`${API_BASE}/api/sessions`, {
                method: 'POST',
                headers,
                body: JSON.stringify(sessionData)
            });
        } catch (err) {
            console.warn('[Background] Failed to save DB session, but ended locally:', err);
        }
    }

    // Delete active timer
    try {
        await fetchWithRetry(`${API_BASE}/api/active-timer`, {
            method: 'DELETE',
            headers
        });
    } catch (err) {
        console.warn('[Background] Failed to delete active timer from DB:', err);
    }

    return { success: true };
}
