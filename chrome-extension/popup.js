// StudyHub Extension - Popup Script (Timer + Todos + Capture + Stats)

document.addEventListener('DOMContentLoaded', async () => {

    // ─── Offline Detection ───
    const offlineBanner = document.getElementById('offlineBanner');
    function updateOnlineStatus() {
        if (!navigator.onLine) {
            offlineBanner.classList.add('show');
            document.getElementById('statusDot').classList.add('disconnected');
            document.getElementById('statusText').textContent = 'Offline';
        } else {
            offlineBanner.classList.remove('show');
        }
    }
    updateOnlineStatus();
    window.addEventListener('online', () => {
        offlineBanner.classList.remove('show');
        document.getElementById('statusDot').classList.remove('disconnected');
        document.getElementById('statusText').textContent = 'Connected to StudyHub';
        // Re-fetch data when coming back online
        loadTimer();
    });
    window.addEventListener('offline', updateOnlineStatus);

    // ─── Header time ───
    function updateHeaderTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('headerTime').textContent = `${h}:${m}`;
    }
    updateHeaderTime();
    setInterval(updateHeaderTime, 30000);

    // ─── Tab Switching ───
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');

            if (tab === 'todos') loadTodos();
            if (tab === 'stats') loadStats();
            if (tab === 'timer') loadTimer();
            if (tab === 'capture') loadScreenshotHistory();
            if (tab === 'settings') loadSettings();
        });
    });

    // ────────────────────────────────────────────────────
    // SETTINGS TAB
    // ────────────────────────────────────────────────────
    const apiBaseInput = document.getElementById('apiBaseInput');
    const extensionKeyInput = document.getElementById('extensionKeyInput');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const settingsStatus = document.getElementById('settingsStatus');

    async function loadSettings() {
        const result = await chrome.storage.sync.get(['studyhub-api-base', 'studyhub-extension-key']);
        if (result['studyhub-api-base']) {
            apiBaseInput.value = result['studyhub-api-base'];
        } else {
            apiBaseInput.value = 'https://personal-dashboard-alpha-gilt.vercel.app';
        }
        if (result['studyhub-extension-key']) {
            extensionKeyInput.value = result['studyhub-extension-key'];
        }
    }

    saveSettingsBtn.addEventListener('click', async () => {
        const apiBase = apiBaseInput.value.trim();
        const extensionKey = extensionKeyInput.value.trim();

        if (!apiBase) {
            settingsStatus.textContent = '❌ API Base URL is required';
            settingsStatus.className = 'settings-status error';
            return;
        }

        try {
            await chrome.storage.sync.set({
                'studyhub-api-base': apiBase,
                'studyhub-extension-key': extensionKey
            });
            settingsStatus.textContent = '✅ Settings saved! Reloading...';
            settingsStatus.className = 'settings-status success';

            // Reload background to pick up new key/URL
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (err) {
            settingsStatus.textContent = '❌ Failed to save';
            settingsStatus.className = 'settings-status error';
        }
    });

    // ────────────────────────────────────────────────────
    // TIMER TAB (synced with webapp's Pomodoro)
    // ────────────────────────────────────────────────────
    const RING_CIRCUMFERENCE = 2 * Math.PI * 78;
    const ringEl = document.getElementById('ringProgress');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerSubLabel = document.getElementById('timerSubLabel');
    const timerPill = document.getElementById('timerPill');
    const timerPillText = document.getElementById('timerPillText');
    const durationRow = document.getElementById('durationRow');
    const presetRow = document.getElementById('presetRow');
    const controlsEl = document.getElementById('timerControls');

    let timerDuration = 60; // minutes
    let timerState = { status: 'loading' };
    let timerInterval = null;

    function formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateRing(progress) {
        const offset = RING_CIRCUMFERENCE - (progress * RING_CIRCUMFERENCE);
        ringEl.style.strokeDashoffset = offset;
    }

    // ─── Timer Presets ───
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            timerDuration = minutes;
            document.getElementById('durValue').textContent = `${timerDuration} min`;
            timerDisplay.textContent = formatTime(timerDuration * 60);
            // Update active preset
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    function updatePresetHighlight() {
        presetBtns.forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.minutes) === timerDuration);
        });
    }

    function renderTimerUI() {
        const { status, startTime, durationSeconds, pausedRemaining } = timerState;

        // Clear any local interval
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

        if (status === 'loading') {
            timerDisplay.textContent = '--:--';
            updateRing(0);
            timerPill.className = 'timer-status-pill';
            timerPillText.textContent = 'Loading...';
            timerSubLabel.textContent = '';
            durationRow.style.display = 'none';
            presetRow.style.display = 'none';
            controlsEl.innerHTML = '';
            return;
        }

        if (status === 'active') {
            const elapsed = (Date.now() - startTime) / 1000;
            let remaining = durationSeconds - elapsed;

            timerPill.className = 'timer-status-pill running';
            timerPillText.textContent = 'Focusing';
            timerSubLabel.textContent = 'FOCUSING';
            durationRow.style.display = 'none';
            presetRow.style.display = 'none';
            ringEl.classList.remove('completed', 'failed');

            controlsEl.innerHTML = `
                <button class="timer-btn secondary" id="btnPause">⏸ Pause</button>
                <button class="timer-btn destructive" id="btnEnd">⏹ End</button>
            `;
            document.getElementById('btnPause').addEventListener('click', handlePause);
            document.getElementById('btnEnd').addEventListener('click', handleStop);

            const tick = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                remaining = durationSeconds - elapsed;
                if (remaining <= 0) {
                    remaining = 0;
                    timerDisplay.textContent = '00:00';
                    updateRing(1);
                    timerSubLabel.textContent = 'SESSION DONE';
                    ringEl.classList.add('completed');
                    timerPill.className = 'timer-status-pill';
                    timerPillText.textContent = 'Completed';
                    clearInterval(timerInterval);
                    controlsEl.innerHTML = `<button class="timer-btn secondary" id="btnReset">↺ New Session</button>`;
                    document.getElementById('btnReset').addEventListener('click', handleStop);
                    return;
                }
                const progress = 1 - (remaining / durationSeconds);
                timerDisplay.textContent = formatTime(remaining);
                updateRing(progress);
            };
            tick();
            timerInterval = setInterval(tick, 1000);

        } else if (status === 'paused') {
            const remaining = pausedRemaining || 0;
            const totalDuration = durationSeconds || (timerDuration * 60);
            const progress = 1 - (remaining / totalDuration);

            timerDisplay.textContent = formatTime(remaining);
            updateRing(progress);
            timerPill.className = 'timer-status-pill paused';
            timerPillText.textContent = 'Paused';
            timerSubLabel.textContent = 'PAUSED';
            durationRow.style.display = 'none';
            presetRow.style.display = 'none';
            ringEl.classList.remove('completed', 'failed');

            controlsEl.innerHTML = `
                <button class="timer-btn primary" id="btnResume">▶ Resume</button>
                <button class="timer-btn destructive" id="btnEnd">⏹ End</button>
            `;
            document.getElementById('btnResume').addEventListener('click', () => handleResume(remaining));
            document.getElementById('btnEnd').addEventListener('click', handleStop);

        } else {
            // Show sync status icon if local
            const syncStatusHtml = timerState.synced === false ? `<span class="sync-warning" title="Running Locally (Not Synced)" style="position:absolute; top:8px; right:8px; font-size:12px; opacity:0.6;">☁️❌</span>` : '';

            // Idle
            timerDisplay.innerHTML = `${formatTime(timerDuration * 60)}${syncStatusHtml}`;
            updateRing(0);
            timerPill.className = 'timer-status-pill';
            timerPillText.textContent = 'Ready';
            timerSubLabel.textContent = 'READY';
            durationRow.style.display = 'flex';
            presetRow.style.display = 'flex';
            ringEl.classList.remove('completed', 'failed');
            updatePresetHighlight();

            document.getElementById('btnStart').addEventListener('click', handleStart);
        }
    }

    // Duration controls
    document.getElementById('durMinus').addEventListener('click', () => {
        timerDuration = Math.max(1, timerDuration - 5);
        document.getElementById('durValue').textContent = `${timerDuration} min`;
        timerDisplay.textContent = formatTime(timerDuration * 60);
        updatePresetHighlight();
    });
    document.getElementById('durPlus').addEventListener('click', () => {
        timerDuration = Math.min(180, timerDuration + 5);
        document.getElementById('durValue').textContent = `${timerDuration} min`;
        timerDisplay.textContent = formatTime(timerDuration * 60);
        updatePresetHighlight();
    });

    async function handleStart() {
        const durationSeconds = timerDuration * 60;
        // Optimistic: update UI immediately
        const prevState = { ...timerState };
        timerState = { status: 'active', startTime: Date.now(), durationSeconds };
        renderTimerUI();
        // Sync to API in background
        chrome.runtime.sendMessage({ action: 'startTimer', durationSeconds }, (resp) => {
            if (!resp || !resp.success) {
                // Revert on failure
                timerState = prevState;
                renderTimerUI();
            }
        });
    }

    async function handlePause() {
        const elapsed = (Date.now() - timerState.startTime) / 1000;
        const remaining = Math.max(0, timerState.durationSeconds - elapsed);
        const initialDuration = timerState.durationSeconds;
        // Optimistic: update UI immediately
        const prevState = { ...timerState };
        timerState = { ...timerState, status: 'paused', pausedRemaining: Math.round(remaining) };
        renderTimerUI();
        // Sync to API in background
        chrome.runtime.sendMessage({
            action: 'pauseTimer',
            pausedRemaining: Math.round(remaining),
            durationSeconds: initialDuration
        }, (resp) => {
            if (!resp || !resp.success) {
                timerState = prevState;
                renderTimerUI();
            }
        });
    }

    async function handleResume(remaining) {
        // Optimistic: update UI immediately
        const prevState = { ...timerState };
        timerState = { status: 'active', startTime: Date.now(), durationSeconds: Math.round(remaining) };
        renderTimerUI();
        // Sync to API in background
        chrome.runtime.sendMessage({ action: 'resumeTimer', durationSeconds: Math.round(remaining) }, (resp) => {
            if (!resp || !resp.success) {
                timerState = prevState;
                renderTimerUI();
            }
        });
    }

    async function handleStop() {
        let sessionData = null;
        if (timerState.status === 'active' && timerState.startTime && timerState.durationSeconds) {
            const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
            const minutes = Math.floor(timerState.durationSeconds / 60);
            sessionData = {
                id: String(Date.now()),
                type: 'focus',
                minutes: minutes,
                elapsedSeconds: Math.min(elapsed, timerState.durationSeconds),
                timestamp: new Date().toISOString(),
                status: 'failed'
            };
        } else if (timerState.status === 'paused' && timerState.durationSeconds) {
            const totalDuration = timerState.durationSeconds;
            const remaining = timerState.pausedRemaining || 0;
            const elapsed = totalDuration - remaining;
            const minutes = Math.floor(totalDuration / 60);
            sessionData = {
                id: String(Date.now()),
                type: 'focus',
                minutes: minutes,
                elapsedSeconds: Math.max(0, elapsed),
                timestamp: new Date().toISOString(),
                status: 'failed'
            };
        }

        // Optimistic: update UI immediately
        timerState = { status: 'idle' };
        renderTimerUI();
        // Sync to API in background
        chrome.runtime.sendMessage({ action: 'stopTimer', sessionData }, () => { });
    }

    // ─── Timer sync fix: cache-first, then refresh from API ───
    async function loadTimer() {
        // 1. Try cache first for instant display
        chrome.storage.local.get('cachedTimer', (cached) => {
            if (cached.cachedTimer && cached.cachedTimer.status && cached.cachedTimer.status !== 'idle') {
                const t = cached.cachedTimer;
                timerState = {
                    status: t.status,
                    startTime: t.startTime ? Number(t.startTime) : null,
                    durationSeconds: t.durationSeconds ? Number(t.durationSeconds) : null,
                    pausedRemaining: t.pausedRemaining ? Number(t.pausedRemaining) : null
                };
                renderTimerUI();
            }
        });

        // 2. Always refresh from API in background
        chrome.runtime.sendMessage({ action: 'fetchTimer' }, (resp) => {
            if (resp && resp.timer) {
                const t = resp.timer;
                timerState = {
                    status: t.status || 'idle',
                    startTime: t.startTime ? Number(t.startTime) : null,
                    durationSeconds: t.durationSeconds ? Number(t.durationSeconds) : null,
                    pausedRemaining: t.pausedRemaining ? Number(t.pausedRemaining) : null
                };
            } else {
                timerState = { status: 'idle' };
            }
            renderTimerUI();
        });
    }

    // Show idle state, then load from cache + API
    renderTimerUI();
    loadTimer();

    // ────────────────────────────────────────────────────
    // CAPTURE TAB
    // ────────────────────────────────────────────────────
    const captureBtn = document.getElementById('captureBtn');
    const noteCountEl = document.getElementById('noteCount');
    const captureCountEl = document.getElementById('captureCount');

    const capResult = await chrome.storage.local.get(['captureCount', 'captureDate']);
    const today = new Date().toDateString();
    if (capResult.captureDate === today) {
        captureCountEl.textContent = capResult.captureCount || 0;
    }

    // Check connection + note count
    try {
        chrome.runtime.sendMessage({ action: 'fetchNotes' }, (response) => {
            if (chrome.runtime.lastError) {
                document.getElementById('statusDot').classList.add('disconnected');
                document.getElementById('statusText').textContent = 'Extension error';
                return;
            }
            if (response && response.notes) {
                document.getElementById('statusDot').classList.remove('disconnected');
                document.getElementById('statusText').textContent = 'Connected to StudyHub';
                noteCountEl.textContent = response.notes.length;
            } else {
                document.getElementById('statusDot').classList.add('disconnected');
                document.getElementById('statusText').textContent = 'Connection failed';
            }
        });
    } catch (err) {
        document.getElementById('statusDot').classList.add('disconnected');
        document.getElementById('statusText').textContent = 'Connection error';
    }

    captureBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') ||
                    tab.url.startsWith('brave://') || tab.url.startsWith('about:')) {
                    document.getElementById('errorOverlay').style.display = 'flex';
                    return;
                }
                chrome.runtime.sendMessage({ action: 'startCapture', tabId: tab.id });
                window.close();
            } else {
                chrome.runtime.sendMessage({ action: 'startCapture' });
                window.close();
            }
        } catch (e) {
            console.error('Popup error:', e);
            window.close();
        }
    });
    document.getElementById('closeError')?.addEventListener('click', () => window.close());

    // ─── Screenshot History ───
    async function loadScreenshotHistory() {
        const historyContainer = document.getElementById('screenshotHistory');
        try {
            const result = await chrome.storage.local.get('screenshotHistory');
            const history = result.screenshotHistory || [];

            if (history.length === 0) {
                historyContainer.innerHTML = '<div class="history-empty">No captures yet</div>';
                return;
            }

            historyContainer.innerHTML = history.map(item => `
                <div class="history-item" title="${item.imageName || item.label}\n${new Date(item.timestamp).toLocaleString()}">
                    <img src="${item.thumbnail}" alt="${item.imageName || 'Screenshot'}" />
                    <div class="history-item-label">${item.imageName || item.label || 'Untitled'}</div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Failed to load screenshot history:', err);
            historyContainer.innerHTML = '<div class="history-empty">Failed to load</div>';
        }
    }
    // Load history on init
    loadScreenshotHistory();

    // ────────────────────────────────────────────────────
    // TODOS TAB (synced with webapp)
    // ────────────────────────────────────────────────────
    const todoInput = document.getElementById('todoInput');
    const todoAddBtn = document.getElementById('todoAddBtn');
    const todoList = document.getElementById('todoList');
    let todosData = [];

    // Undo state
    let undoTimeout = null;
    let pendingDeleteId = null;
    let pendingDeleteItem = null;

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function renderTodos(todos) {
        todosData = todos;

        // Filter to today's todos only
        const todayStr = new Date().toDateString();
        const todayTodos = (todos || []).filter(t => {
            if (!t.created_at) return true; // include if no date
            return new Date(t.created_at).toDateString() === todayStr;
        });

        if (todayTodos.length === 0) {
            todoList.innerHTML = `<div class="todo-empty"><div class="todo-empty-icon">📋</div>No tasks for today. Add one above!</div>`;
            return;
        }
        const sorted = [...todayTodos].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
        todoList.innerHTML = sorted.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-checkbox" data-action="toggle">${todo.completed ? '✓' : ''}</div>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="todo-delete" data-action="delete" title="Delete">✕</button>
            </div>
        `).join('');
    }

    function loadTodos() {
        // 1. Try cache first for instant display
        chrome.storage.local.get('cachedTodos', (cached) => {
            if (cached.cachedTodos && cached.cachedTodos.length > 0) {
                renderTodos(cached.cachedTodos);
            } else {
                todoList.innerHTML = '<div class="todo-loading">Loading todos...</div>';
            }
        });

        // 2. Always refresh from API
        chrome.runtime.sendMessage({ action: 'fetchTodos' }, (response) => {
            if (chrome.runtime.lastError) {
                todoList.innerHTML = '<div class="todo-loading">Extension error — reload</div>';
                return;
            }
            if (response && response.todos) {
                renderTodos(response.todos);
                // Update cache
                chrome.storage.local.set({ cachedTodos: response.todos });
            } else if (!todosData || todosData.length === 0) {
                todoList.innerHTML = '<div class="todo-loading">Failed to connect — check deployment</div>';
            }
        });
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;
        todoInput.value = '';
        todoAddBtn.disabled = true;
        chrome.runtime.sendMessage({ action: 'addTodo', text }, (response) => {
            todoAddBtn.disabled = false;
            loadTodos();
        });
    }

    // ─── Undo Toast ───
    const undoToast = document.getElementById('undoToast');
    const undoToastText = document.getElementById('undoToastText');
    const undoBtn = document.getElementById('undoBtn');

    function showUndoToast(text, id) {
        // Cancel any previous pending delete
        if (undoTimeout) clearTimeout(undoTimeout);

        pendingDeleteId = id;
        undoToastText.textContent = `"${text.slice(0, 25)}${text.length > 25 ? '...' : ''}" deleted`;
        undoToast.classList.add('show');

        // Actually delete after 4 seconds
        undoTimeout = setTimeout(() => {
            commitDelete(id);
            hideUndoToast();
        }, 4000);
    }

    function hideUndoToast() {
        undoToast.classList.remove('show');
        pendingDeleteId = null;
        pendingDeleteItem = null;
    }

    function commitDelete(id) {
        chrome.runtime.sendMessage({ action: 'deleteTodo', id }, () => {
            // Don't reload if undo was pressed (item already restored)
        });
    }

    undoBtn.addEventListener('click', () => {
        // Cancel the pending delete
        if (undoTimeout) clearTimeout(undoTimeout);
        hideUndoToast();
        // Reload to restore the item (it was never actually deleted)
        loadTodos();
    });

    todoAddBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });

    todoList.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;
        const item = e.target.closest('.todo-item');
        if (!item) return;
        const id = item.dataset.id;

        if (action === 'toggle') {
            const todo = todosData.find(t => String(t.id) === String(id));
            if (!todo) return;
            const newCompleted = !todo.completed;
            item.classList.toggle('completed', newCompleted);
            item.querySelector('.todo-checkbox').textContent = newCompleted ? '✓' : '';
            chrome.runtime.sendMessage({ action: 'toggleTodo', id, completed: newCompleted }, (resp) => {
                if (!resp || !resp.success) loadTodos();
            });
        }

        if (action === 'delete') {
            const todo = todosData.find(t => String(t.id) === String(id));
            const text = todo ? todo.text : 'Item';

            // Visually remove
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            item.style.transition = 'all 0.2s';
            setTimeout(() => {
                item.style.display = 'none';
            }, 200);

            // Show undo toast — delay actual deletion
            showUndoToast(text, id);
        }
    });

    // ────────────────────────────────────────────────────
    // STATS TAB (combined API call)
    // ────────────────────────────────────────────────────

    // Cache for export
    let lastStatsData = null;

    async function loadStats() {
        // Use combined stats endpoint (single API call instead of 3)
        chrome.runtime.sendMessage({ action: 'fetchAllStats' }, async (response) => {
            if (chrome.runtime.lastError || !response) {
                console.error('Stats fetch error:', chrome.runtime.lastError);
                return;
            }

            const { sessions = [], notes = [], todos = [] } = response;

            // Cache for export
            lastStatsData = { sessions, notes, todos };

            // Sessions stats
            const completed = sessions.filter(s => s.status === 'completed');
            const totalSec = completed.reduce((sum, s) => sum + (s.elapsedSeconds || 0), 0);
            document.getElementById('totalHours').textContent = (totalSec / 3600).toFixed(1);
            document.getElementById('totalSessions').textContent = `${completed.length} sessions`;

            const todayStr = new Date().toDateString();
            const todaySessions = completed.filter(s => new Date(s.timestamp).toDateString() === todayStr);
            const todaySec = todaySessions.reduce((sum, s) => sum + (s.elapsedSeconds || 0), 0);
            document.getElementById('todayHours').textContent = (todaySec / 3600).toFixed(1);

            // Notes stats
            document.getElementById('statsNoteCount').textContent = notes.length;

            // Todos stats
            const done = todos.filter(t => t.completed).length;
            document.getElementById('todoDoneCount').textContent = `${done}/${todos.length}`;

            // Capture stats
            const result = await chrome.storage.local.get(['captureCount', 'captureDate']);
            const today = new Date().toDateString();
            document.getElementById('statsCaptureCount').textContent =
                (result.captureDate === today) ? (result.captureCount || 0) : 0;
        });
    }

    // ─── Export Functionality ───
    document.getElementById('exportBtn').addEventListener('click', async () => {
        try {
            // If we haven't loaded stats yet, fetch them
            if (!lastStatsData) {
                await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ action: 'fetchAllStats' }, (response) => {
                        lastStatsData = response || { sessions: [], notes: [], todos: [] };
                        resolve();
                    });
                });
            }

            const exportData = {
                exportedAt: new Date().toISOString(),
                source: 'StudyHub Extension',
                sessions: lastStatsData.sessions || [],
                notes: lastStatsData.notes || [],
                todos: lastStatsData.todos || []
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `studyhub-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        }
    });
});
