// StudyHub Quick Capture - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const captureBtn = document.getElementById('captureBtn');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const noteCountEl = document.getElementById('noteCount');
    const captureCountEl = document.getElementById('captureCount');

    // Load today's capture count from storage
    const result = await chrome.storage.local.get(['captureCount', 'captureDate']);
    const today = new Date().toDateString();

    if (result.captureDate === today) {
        captureCountEl.textContent = result.captureCount || 0;
    } else {
        captureCountEl.textContent = '0';
    }

    // Check connection to StudyHub
    try {
        chrome.runtime.sendMessage({ action: 'fetchNotes' }, (response) => {
            if (response && response.notes && response.notes.length > 0) {
                statusDot.classList.remove('disconnected');
                statusText.textContent = 'Connected to StudyHub';
                noteCountEl.textContent = response.notes.length;
            } else if (response && response.notes) {
                statusDot.classList.remove('disconnected');
                statusText.textContent = 'Connected (0 notes)';
                noteCountEl.textContent = '0';
            } else {
                statusDot.classList.add('disconnected');
                statusText.textContent = 'Connection failed';
                noteCountEl.textContent = '-';
            }
        });
    } catch (err) {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Connection error';
    }

    // Capture button click
    captureBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (tab) {
                if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') ||
                    tab.url.startsWith('brave://') || tab.url.startsWith('about:') ||
                    tab.url.startsWith('view-source:')) {
                    document.getElementById('errorOverlay').style.display = 'flex';
                    captureBtn.style.display = 'none';
                    return;
                }

                chrome.runtime.sendMessage({ action: 'startCapture', tabId: tab.id });
                window.close();
            } else {
                console.error('No active tab found from popup');
                chrome.runtime.sendMessage({ action: 'startCapture' });
                window.close();
            }
        } catch (e) {
            console.error('Popup error:', e);
            window.close();
        }
    });

    document.getElementById('closeError')?.addEventListener('click', () => {
        window.close();
    });
});

// Increment capture count when a screenshot is saved
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'screenshotSaved') {
        incrementCaptureCount();
    }
});

async function incrementCaptureCount() {
    const result = await chrome.storage.local.get(['captureCount', 'captureDate']);
    const today = new Date().toDateString();

    let count = 0;
    if (result.captureDate === today) {
        count = (result.captureCount || 0) + 1;
    } else {
        count = 1;
    }

    await chrome.storage.local.set({ captureCount: count, captureDate: today });
}
