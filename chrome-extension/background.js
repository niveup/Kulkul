// StudyHub Quick Capture - Background Service Worker

const API_BASE = 'https://personal-dashboard-alpha-gilt.vercel.app';

// Get API headers — marks request as coming from extension
function getApiHeaders(includeContentType = true) {
    const headers = { 'X-Source': 'extension' };
    if (includeContentType) headers['Content-Type'] = 'application/json';
    return headers;
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
        // Pass the full request to saveScreenshot
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
});

// Start capture mode - inject content script
async function startCapture(explicitTabId = null) {
    console.log('[Background] Starting capture...');

    try {
        let tab;

        if (explicitTabId) {
            tab = await chrome.tabs.get(explicitTabId).catch(() => null);
        }

        if (!tab) {
            // Try current window first
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            tab = tabs[0];

            // Fallback: try last focused window (useful if devtools or popup had focus)
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

        // Check if we can inject into this tab
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('brave://') ||
            tab.url.startsWith('edge://') || tab.url.startsWith('about:') ||
            tab.url.startsWith('view-source:') || !tab.url) {
            console.error('[Background] Cannot inject into restricted browser pages');
            // Show notification
            try {
                await chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id });
                await chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId: tab.id });
                setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 3000);
            } catch (e) {
                // Ignore badge errors
            }
            return;
        }

        // Inject the CSS first
        console.log('[Background] Injecting CSS...');
        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content.css']
        });

        // Inject the content script
        console.log('[Background] Injecting content script...');
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        // Small delay to ensure script is ready
        await new Promise(r => setTimeout(r, 100));

        // Tell content script to start selection
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

// Fetch notes from the dashboard API
async function fetchNotes() {
    try {
        console.log('[Background] Fetching notes...');
        const headers = getApiHeaders(false);
        const response = await fetch(`${API_BASE}/api/notes`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : (data.notes || []);
    } catch (err) {
        console.error('[Background] Failed to fetch notes:', err);
        return [];
    }
}

// Fetch chapters from the dashboard API
async function fetchChapters() {
    try {
        console.log('[Background] Fetching chapters...');
        const headers = getApiHeaders(false);
        const response = await fetch(`${API_BASE}/api/chapter-tracker`, { headers });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('[Background] Failed to fetch chapters:', err);
        return { chapters: [], entries: [] };
    }
}

// Save screenshot to either Note system or Chapter Tracker
async function saveScreenshot(request) {
    const { system, imageData, imageName } = request;

    try {
        const headers = getApiHeaders();

        if (system === 'chapter-tracker') {
            const { chapterId, entryId, subject, chapterName, text, description, urls, createNewChapter, createNewEntry, type, tags, priority } = request;
            console.log('[Background] Saving to Chapter Tracker:', text || entryId);

            const response = await fetch(`${API_BASE}/api/chapter-tracker?action=attach-screenshot`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    imageData,
                    chapterId,
                    entryId,
                    subject,
                    chapterName,
                    text,
                    description,
                    urls,
                    imageName,
                    type,
                    tags,
                    priority: priority || 'medium',
                    createNewChapter,
                    createNewEntry
                })
            });
            return await response.json();

        } else {
            // Default to Learning Notes
            const { noteId, title, description, links, createNew } = request;
            console.log('[Background] Saving to Learning Notes:', title);

            const response = await fetch(`${API_BASE}/api/notes?action=attach-screenshot`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    imageData,
                    noteId,
                    title,
                    subject: request.subject, // Fallback if present
                    description,
                    links,
                    imageName,
                    createNew
                })
            });
            return await response.json();
        }
    } catch (err) {
        console.error('[Background] Failed to save screenshot:', err);
        return { success: false, error: err.message };
    }
}
