// StudyHub Quick Capture - Content Script (Area Selection)
if (!window.studyhubInjected) {
    (function () {
        window.studyhubInjected = true;

        let isSelecting = false;
        let startX, startY;
        let selectionOverlay, selectionBox;

        // ─── Closure-scoped image data (no global namespace pollution) ───
        let _capturedImageData = null;

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'startSelection') {
                try {
                    initSelection();
                    sendResponse({ success: true });
                } catch (err) {
                    console.error('[StudyHub] Failed to init selection:', err);
                    sendResponse({ success: false, error: err.message });
                }
            }
        });

        function initSelection() {
            // Remove any existing overlay
            removeSelection();

            // Create overlay
            selectionOverlay = document.createElement('div');
            selectionOverlay.id = 'studyhub-capture-overlay';
            selectionOverlay.innerHTML = `
        <div class="studyhub-capture-instructions">
            <span>📷 Draw a rectangle to capture, or press ESC to cancel</span>
            <button id="studyhub-fullpage-btn">Capture Full Page</button>
        </div>
    `;
            document.body.appendChild(selectionOverlay);

            // Create selection box
            selectionBox = document.createElement('div');
            selectionBox.id = 'studyhub-selection-box';
            document.body.appendChild(selectionBox);

            // Event listeners
            selectionOverlay.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('keydown', onKeyDown);

            // Full page button
            document.getElementById('studyhub-fullpage-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                removeSelection();

                // Small delay to let overlay disappear
                await new Promise(r => setTimeout(r, 100));

                try {
                    chrome.runtime.sendMessage({ action: 'captureFullPage' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('[StudyHub] Capture error:', chrome.runtime.lastError.message);
                            return;
                        }
                        if (response && response.dataUrl) {
                            showPreview(response.dataUrl);
                        }
                    });
                } catch (err) {
                    console.error('[StudyHub] Full page capture failed:', err);
                }
            });
        }

        function onMouseDown(e) {
            if (e.target.id === 'studyhub-fullpage-btn') return;

            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;

            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';
            selectionBox.style.width = '0';
            selectionBox.style.height = '0';
            selectionBox.style.display = 'block';
        }

        function onMouseMove(e) {
            if (!isSelecting) return;

            const currentX = e.clientX;
            const currentY = e.clientY;

            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
        }

        async function onMouseUp(e) {
            if (!isSelecting) return;
            isSelecting = false;

            try {
                const rect = selectionBox.getBoundingClientRect();

                // Minimum size check
                if (rect.width < 10 || rect.height < 10) {
                    return;
                }

                // Hide selection UI before capture
                selectionOverlay.style.display = 'none';
                selectionBox.style.display = 'none';

                // Small delay to ensure UI is hidden
                await new Promise(r => setTimeout(r, 50));

                // Capture the visible tab
                chrome.runtime.sendMessage({ action: 'captureFullPage' }, async (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[StudyHub] Capture error:', chrome.runtime.lastError.message);
                        removeSelection();
                        return;
                    }
                    if (response && response.dataUrl) {
                        try {
                            // Crop the image to selection
                            const croppedImage = await cropImage(response.dataUrl, rect);
                            removeSelection();
                            showPreview(croppedImage);
                        } catch (cropErr) {
                            console.error('[StudyHub] Crop failed:', cropErr);
                            removeSelection();
                        }
                    } else {
                        removeSelection();
                    }
                });
            } catch (err) {
                console.error('[StudyHub] onMouseUp error:', err);
                removeSelection();
            }
        }

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                removeSelection();
            }
        }

        function removeSelection() {
            isSelecting = false;
            if (selectionOverlay) {
                selectionOverlay.remove();
                selectionOverlay = null;
            }
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('keydown', onKeyDown);
        }

        async function cropImage(dataUrl, rect) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Account for device pixel ratio
                        const dpr = window.devicePixelRatio || 1;

                        canvas.width = rect.width * dpr;
                        canvas.height = rect.height * dpr;

                        ctx.drawImage(
                            img,
                            rect.left * dpr,
                            rect.top * dpr,
                            rect.width * dpr,
                            rect.height * dpr,
                            0,
                            0,
                            rect.width * dpr,
                            rect.height * dpr
                        );

                        resolve(canvas.toDataURL('image/png'));
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image for cropping'));
                img.src = dataUrl;
            });
        }

        // ─── Helper: collect all link URLs from the links container ───
        function collectLinks() {
            const linkInputs = document.querySelectorAll('#studyhub-links-container input');
            return Array.from(linkInputs).map(i => i.value.trim()).filter(Boolean);
        }

        // ─── Helper: add a removable link input row ───
        function createLinkRow(container, value = '', readonly = false) {
            const row = document.createElement('div');
            row.className = 'studyhub-link-item';
            row.innerHTML = `
                <input type="text" value="${value}" ${readonly ? 'readonly disabled' : 'placeholder="Paste Reference URL..."'} class="studyhub-input-glass" style="border:none; background:transparent;"/>
                <span class="studyhub-remove-link-btn">✕</span>
            `;
            container.appendChild(row);
            row.querySelector('.studyhub-remove-link-btn').addEventListener('click', () => row.remove());
            return row;
        }

        function showPreview(imageDataUrl) {
            let allChapters = [];
            let allEntries = [];
            let selectedType = 'concept';

            // Store image data in closure variable (not on window)
            _capturedImageData = imageDataUrl;

            // ─── Track all event listeners for cleanup ───
            const cleanupFns = [];
            function trackEvent(el, event, handler) {
                if (!el) return;
                el.addEventListener(event, handler);
                cleanupFns.push(() => el.removeEventListener(event, handler));
            }

            // Create Modal Overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'studyhub-modal-overlay';
            // Force inline styles to escape any parent transform/stacking context
            Object.assign(modalOverlay.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '2147483647',
                transform: 'none',
                contain: 'layout style'
            });
            modalOverlay.innerHTML = `
        <div id="studyhub-preview-modal">
            <div class="studyhub-preview-container">
                <!-- Left Panel -->
                <div class="studyhub-left-panel">
                    <div class="studyhub-preview-header">
                        <h3>📸 Quick Capture <button id="studyhub-refresh" title="Refresh Sync" style="background:none; border:none; cursor:pointer; font-size:14px; margin-left:8px; opacity:0.6;">↻</button></h3>
                        <button class="studyhub-close-btn" id="studyhub-close">✕</button>
                    </div>
                    
                    <div class="studyhub-panel-scroll-content">
                        <div class="studyhub-preview-image-container">
                            <img src="${imageDataUrl}" alt="Preview" id="studyhub-preview-img"/>
                        </div>
                        
                        <div class="studyhub-form-group" style="margin-top: 20px;">
                            <label class="studyhub-label">🏷️ Image Reference Name</label>
                            <input type="text" id="studyhub-image-name" placeholder="e.g. Main Diagram, Figure 1..." class="studyhub-input-glass"/>
                        </div>

                        <div class="studyhub-form-group" style="margin-top: 12px;">
                            <label class="studyhub-label">🔖 Tags (comma separated)</label>
                            <input type="text" id="studyhub-tags" placeholder="e.g. physics, formula, important..." class="studyhub-input-glass"/>
                        </div>
                    </div>

                    <div class="studyhub-footer-actions">
                        <button class="studyhub-action-btn studyhub-action-btn-secondary" id="studyhub-retake">↻ Retake</button>
                        <button class="studyhub-action-btn studyhub-action-btn-primary" id="studyhub-save">💾 Save to Vault</button>
                    </div>
                </div>

                <!-- Right Panel -->
                <div class="studyhub-right-panel">
                    <!-- Tab Switcher (Chapter Tracker vs Notes Library) -->
                    <div class="studyhub-sys-tabs">
                        <button class="studyhub-sys-tab active" data-sys="chapter-tracker">📚 Chapter Tracker</button>
                        <button class="studyhub-sys-tab" data-sys="learning-notes">📝 Notes Library</button>
                    </div>

                    <div class="studyhub-panel-scroll-content" style="margin: 0;">
                        <!-- ================================ -->
                        <!-- SYSTEM: CHAPTER TRACKER          -->
                        <!-- ================================ -->
                        <div id="sys-chapter-tracker" class="sys-section active">
                            <div class="studyhub-sub-pill-container">
                                <button class="studyhub-sub-pill active" id="pill-new-entry">✨ New Entry</button>
                                <button class="studyhub-sub-pill" id="pill-existing-entry">🔍 Attach to Existing</button>
                            </div>

                            <div class="studyhub-form-group">
                                <label class="studyhub-label">Select Subject</label>
                                <select id="studyhub-subject-select" class="studyhub-input-glass">
                                <option value="physics">Physics</option>
                                <option value="chemistry">Chemistry</option>
                                <option value="math">Mathematics</option>
                            </select>
                            </div>

                            <div id="studyhub-new-entry-fields">
                                <div class="studyhub-type-row">
                                    <button class="studyhub-type-tag active" data-type="concept">Concept</button>
                                    <button class="studyhub-type-tag" data-type="formula">Formula</button>
                                    <button class="studyhub-type-tag" data-type="problem">Problem</button>
                                </div>
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Chapter</label>
                                    <div class="studyhub-grid-row">
                                        <select id="studyhub-chapter-select" class="studyhub-input-glass">
                                            <option value="NEW_CHAPTER">+ Create New Chapter</option>
                                        </select>
                                        <input type="text" id="studyhub-new-chapter-name" placeholder="New Chapter Name..." class="studyhub-input-glass"/>
                                    </div>
                                </div>
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Entry Heading</label>
                                    <input type="text" id="studyhub-entry-text" placeholder="e.g. Newton's Law, Section 2.1..." class="studyhub-input-glass"/>
                                </div>
                            </div>

                            <div id="studyhub-search-entry-fields" style="display:none;">
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Select Chapter</label>
                                    <input type="text" id="studyhub-entry-search" placeholder="🔍 Filter chapters..." class="studyhub-input-glass" style="margin-bottom: 12px;"/>
                                    <div id="studyhub-entry-list" class="studyhub-list-glass">
                                        <div class="studyhub-list-item">Loading chapters...</div>
                                    </div>
                                </div>
                                <div class="studyhub-form-group" style="margin-top: 12px;">
                                    <label class="studyhub-label">Entry Heading</label>
                                    <input type="text" id="studyhub-attach-entry-text" placeholder="e.g. Newton's Law, Section 2.1..." class="studyhub-input-glass"/>
                            </div>
                        </div>

                        <!-- ================================ -->
                        <!-- SYSTEM: LEARNING NOTES           -->
                        <!-- ================================ -->
                        <div id="sys-learning-notes" class="sys-section">
                            <div class="studyhub-sub-pill-container">
                                <button class="studyhub-sub-pill active" id="pill-new-note">✨ New Note</button>
                                <button class="studyhub-sub-pill" id="pill-existing-note">🔍 Attach to Existing</button>
                            </div>

                            <div class="studyhub-form-group">
                                <label class="studyhub-label">Select Subject</label>
                                <select id="notes-subject-select" class="studyhub-input-glass">
                                    <option value="physics">Physics</option>
                                    <option value="chemistry">Chemistry</option>
                                    <option value="math">Mathematics</option>
                                </select>
                            </div>

                            <div id="notes-new-fields">
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Note Title</label>
                                    <input type="text" id="notes-title" placeholder="e.g. Thermodynamics summary..." class="studyhub-input-glass"/>
                                </div>
                            </div>

                            <div id="notes-existing-fields" style="display:none;">
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Select Existing Note</label>
                                    <input type="text" id="notes-search" placeholder="🔍 Filter notes..." class="studyhub-input-glass" style="margin-bottom: 12px;"/>
                                    <div id="notes-list" class="studyhub-list-glass">
                                        <div class="studyhub-list-item">Loading notes...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Common Fields (Applies to both) -->
                        <div class="studyhub-form-group" style="margin-top: 24px;">
                            <label class="studyhub-label">Links & References</label>
                            <div id="studyhub-links-container"></div>
                            <button class="studyhub-add-link-btn">+ Add Reference URL</button>
                        </div>
                        <div class="studyhub-form-group">
                            <label class="studyhub-label">Detailed Description</label>
                            <textarea id="studyhub-description" placeholder="Write down your thoughts or key findings..." class="studyhub-input-glass" rows="4"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div id="studyhub-floating-status" style="display:none;"></div>
        </div>
    `;
            document.documentElement.appendChild(modalOverlay);

            // --- State & Elements ---
            let targetEntryId = null;
            let targetChapterId = null;

            // Notes Data
            let allNotes = [];
            let targetNoteId = null;

            const els = {
                saveBtn: document.getElementById('studyhub-save'),
                retakeBtn: document.getElementById('studyhub-retake'),
                closeBtn: document.getElementById('studyhub-close'),

                // Chapter Tracker
                subjectSelect: document.getElementById('studyhub-subject-select'),
                chapterSelect: document.getElementById('studyhub-chapter-select'),
                newChapterInput: document.getElementById('studyhub-new-chapter-name'),
                entrySearch: document.getElementById('studyhub-entry-search'),
                entryList: document.getElementById('studyhub-entry-list'),

                // Notes Library
                notesSubjectSelect: document.getElementById('notes-subject-select'),
                notesSearch: document.getElementById('notes-search'),
                notesList: document.getElementById('notes-list'),

                status: document.getElementById('studyhub-floating-status')
            };

            // Global System State
            let activeSystem = 'chapter-tracker'; // 'chapter-tracker' or 'learning-notes'

            // --- Cleanup function to prevent memory leaks ---
            function cleanupModal() {
                // Remove all tracked event listeners
                cleanupFns.forEach(fn => { try { fn(); } catch (e) { } });
                cleanupFns.length = 0;

                // Clear closure references
                _capturedImageData = null;
                allChapters = [];
                allEntries = [];

                // Remove the modal
                if (modalOverlay.parentNode) {
                    modalOverlay.remove();
                }
            }

            // --- Logic Functions ---

            function showStatus(msg, type = 'loading', duration = 2000) {
                els.status.textContent = msg;
                els.status.className = `studyhub-floating-status status-${type}`;
                els.status.style.display = 'flex';
                if (duration > 0) {
                    setTimeout(() => { els.status.style.display = 'none'; }, duration);
                }
            }

            function fetchNotesLibrary() {
                try {
                    // Re-use background.js fetch relay to fetch Notes Library
                    chrome.runtime.sendMessage({ action: 'fetchNotes' }, (response) => {
                        if (response && response.notes) {
                            allNotes = response.notes;
                            console.log(`[StudyHub] Fetched ${allNotes.length} notes.`);
                            updateNotesList();
                        } else {
                            renderNotesList([]);
                        }
                    });
                } catch (err) {
                    console.error('[StudyHub] fetchNotes error:', err);
                }
            }

            async function fetchChaptersAndEntries() {
                try {
                    chrome.runtime.sendMessage({ action: 'fetchChapters' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('[StudyHub] Chrome runtime error:', chrome.runtime.lastError.message);
                            showStatus('⚠️ Extension error — try again', 'error', 5000);
                            return;
                        }
                        if (response && response.chapters && !response.error) {
                            allChapters = response.chapters;
                            allEntries = response.entries || [];
                            console.log(`[StudyHub] Fetched ${allChapters.length} chapters and ${allEntries.length} entries.`);
                            updateChapterDropdown();
                            updateEntryList();
                        } else {
                            console.error('[StudyHub] Fetch chapters failed:', response?.error);
                            renderEntryList([]); // Clear loading state
                            const errorMsg = response?.error?.includes('401') || response?.error?.includes('Unauthorized')
                                ? '⚠️ Please login to Dashboard'
                                : '⚠️ Failed to sync with Dashboard';
                            showStatus(errorMsg, 'error', 5000);
                        }
                    });
                } catch (err) {
                    console.error('[StudyHub] fetchChaptersAndEntries error:', err);
                    showStatus('⚠️ Connection error', 'error', 5000);
                }
            }

            function updateChapterDropdown() {
                const subject = els.subjectSelect.value.toLowerCase();
                const filtered = allChapters.filter(c => {
                    const chapterSubject = (c.subject || '').toLowerCase();
                    // Handle math vs mathematics mapping
                    if (subject === 'math') return chapterSubject === 'math' || chapterSubject === 'mathematics';
                    return chapterSubject === subject;
                });

                els.chapterSelect.innerHTML = '<option value="NEW_CHAPTER">+ Create New Chapter</option>';
                filtered.forEach(ch => {
                    const opt = document.createElement('option');
                    opt.value = ch.id;
                    opt.textContent = ch.name;
                    els.chapterSelect.appendChild(opt);
                });

                handleChapterChange();
            }

            function handleChapterChange() {
                if (els.chapterSelect.value === 'NEW_CHAPTER') {
                    els.newChapterInput.style.display = 'block';
                } else {
                    els.newChapterInput.style.display = 'none';
                }
            }

            function updateEntryList() {
                const subject = els.subjectSelect.value.toLowerCase();
                const term = els.entrySearch.value.toLowerCase();
                const isExistingMode = document.getElementById('pill-existing-entry').classList.contains('active');

                if (isExistingMode) {
                    // Show chapters (not entries) filtered by subject
                    const filtered = allChapters.filter(c => {
                        const chapterSubject = (c.subject || '').toLowerCase();
                        const matchesSubject = chapterSubject === subject || (subject === 'math' && chapterSubject === 'mathematics');
                        const matchesSearch = !term || (c.name && c.name.toLowerCase().includes(term));
                        return matchesSubject && matchesSearch;
                    });
                    console.log(`[StudyHub] Filtering chapters for ${subject}. Found ${filtered.length} matches.`);
                    renderChapterList(filtered);
                } else {
                    // New entry mode — no list needed
                }
            }

            function renderChapterList(chapters) {
                els.entryList.innerHTML = '';
                if (chapters.length === 0) {
                    els.entryList.innerHTML = '<div class="studyhub-list-item">No chapters found for this subject</div>';
                    return;
                }

                chapters.forEach(ch => {
                    const item = document.createElement('div');
                    item.className = 'studyhub-list-item';
                    if (targetChapterId === ch.id) item.classList.add('selected');
                    const entryCount = allEntries.filter(e => e.chapter_id === ch.id).length;
                    item.textContent = `${ch.name} (${entryCount} entries)`;
                    item.onclick = () => {
                        targetChapterId = ch.id;
                        document.querySelectorAll('#studyhub-entry-list .studyhub-list-item').forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                    };
                    els.entryList.appendChild(item);
                });
            }

            function renderEntryList(entries) {
                els.entryList.innerHTML = '';
                if (entries.length === 0) {
                    els.entryList.innerHTML = '<div class="studyhub-list-item">No entries found</div>';
                    return;
                }

                entries.forEach(e => {
                    const item = document.createElement('div');
                    item.className = 'studyhub-list-item';
                    if (targetEntryId === e.id) item.classList.add('selected');
                    item.textContent = e.text || 'Untitled Entry';
                    item.onclick = () => {
                        targetEntryId = e.id;
                        document.querySelectorAll('#studyhub-entry-list .studyhub-list-item').forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                    };
                    els.entryList.appendChild(item);
                });
            }

            // --- Notes Library Render Functions ---
            function updateNotesList() {
                const subject = els.notesSubjectSelect.value.toLowerCase();
                const term = els.notesSearch.value.toLowerCase();

                const filtered = allNotes.filter(n => {
                    const noteSubject = (n.subject || '').toLowerCase();
                    const matchesSubject = noteSubject === subject || (subject === 'math' && noteSubject === 'mathematics');
                    const matchesSearch = !term || (n.title && n.title.toLowerCase().includes(term));
                    return matchesSubject && matchesSearch;
                });
                renderNotesList(filtered);
            }

            function renderNotesList(notes) {
                els.notesList.innerHTML = '';
                if (notes.length === 0) {
                    els.notesList.innerHTML = '<div class="studyhub-list-item">No notes found</div>';
                    return;
                }

                notes.forEach(n => {
                    const item = document.createElement('div');
                    item.className = 'studyhub-list-item';
                    if (targetNoteId === n.id) item.classList.add('selected');
                    item.textContent = n.title || 'Untitled Note';
                    item.onclick = () => {
                        targetNoteId = n.id;
                        document.querySelectorAll('#notes-list .studyhub-list-item').forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                    };
                    els.notesList.appendChild(item);
                });
            }

            // --- Initialization ---
            fetchChaptersAndEntries();
            fetchNotesLibrary();

            // --- Add initial link (current page URL) using the helper ---
            const linksContainer = document.getElementById('studyhub-links-container');
            createLinkRow(linksContainer, window.location.href, true);

            // System Tabs
            document.querySelectorAll('.studyhub-sys-tab').forEach(tab => {
                trackEvent(tab, 'click', (e) => {
                    document.querySelectorAll('.studyhub-sys-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.sys-section').forEach(s => s.classList.remove('active'));

                    e.currentTarget.classList.add('active');
                    activeSystem = e.currentTarget.dataset.sys;
                    document.getElementById(`sys-${activeSystem}`).classList.add('active');
                });
            });

            // Events (all tracked for cleanup)
            trackEvent(els.subjectSelect, 'change', () => {
                updateChapterDropdown();
                updateEntryList();
            });
            trackEvent(els.chapterSelect, 'change', () => {
                handleChapterChange();
                updateEntryList();
            });
            trackEvent(els.entrySearch, 'input', updateEntryList);

            trackEvent(document.getElementById('pill-new-entry'), 'click', (e) => {
                e.target.classList.add('active');
                document.getElementById('pill-existing-entry').classList.remove('active');
                document.getElementById('studyhub-new-entry-fields').style.display = 'block';
                document.getElementById('studyhub-search-entry-fields').style.display = 'none';
            });
            trackEvent(document.getElementById('pill-existing-entry'), 'click', (e) => {
                e.target.classList.add('active');
                document.getElementById('pill-new-entry').classList.remove('active');
                document.getElementById('studyhub-new-entry-fields').style.display = 'none';
                document.getElementById('studyhub-search-entry-fields').style.display = 'block';
                updateEntryList();
            });

            // Type tags
            document.querySelectorAll('.studyhub-type-tag').forEach(tag => {
                trackEvent(tag, 'click', () => {
                    document.querySelectorAll('.studyhub-type-tag').forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                    selectedType = tag.dataset.type;
                });
            });

            // Add link button (uses helper — no duplication)
            trackEvent(document.querySelector('.studyhub-add-link-btn'), 'click', () => {
                createLinkRow(linksContainer);
            });

            // Close/Retake/Refresh
            trackEvent(els.closeBtn, 'click', cleanupModal);
            trackEvent(els.retakeBtn, 'click', () => {
                cleanupModal();
                initSelection();
            });
            trackEvent(document.getElementById('studyhub-refresh'), 'click', () => {
                showStatus('⏳ Refreshing data...', 'loading', 1000);
                fetchChaptersAndEntries();
            });

            // Save
            trackEvent(els.saveBtn, 'click', async () => {
                try {
                    const description = document.getElementById('studyhub-description').value.trim();
                    const imageName = document.getElementById('studyhub-image-name').value.trim();
                    const tagsRaw = document.getElementById('studyhub-tags').value.trim();
                    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

                    // Use the deduplicated collectLinks() helper
                    const urls = collectLinks();

                    if (activeSystem === 'chapter-tracker') {
                        const isNew = document.getElementById('pill-new-entry').classList.contains('active');
                        if (isNew) {
                            const chapterId = els.chapterSelect.value;
                            const newChapterName = els.newChapterInput.value.trim();
                            const text = document.getElementById('studyhub-entry-text').value.trim();

                            if (chapterId === 'NEW_CHAPTER' && !newChapterName) return showStatus('⚠️ Missing chapter name', 'error');
                            if (!text) return showStatus('⚠️ Missing entry heading', 'error');

                            showStatus('⏳ Saving new entry...', 'loading', 0);
                            chrome.runtime.sendMessage({
                                action: 'saveScreenshot',
                                system: 'chapter-tracker',
                                imageData: _capturedImageData,
                                chapterId: chapterId === 'NEW_CHAPTER' ? null : chapterId,
                                subject: els.subjectSelect.value,
                                chapterName: newChapterName,
                                text,
                                description,
                                urls,
                                imageName,
                                type: selectedType,
                                tags,
                                createNewChapter: chapterId === 'NEW_CHAPTER',
                                createNewEntry: true
                            }, handleResult);
                        } else {
                            // Attach to existing chapter — create new entry inside selected chapter
                            if (!targetChapterId) return showStatus('⚠️ Select a chapter first', 'error');
                            const attachText = (document.getElementById('studyhub-attach-entry-text')?.value || '').trim();
                            if (!attachText) return showStatus('⚠️ Enter an entry heading', 'error');
                            showStatus('⏳ Saving to chapter...', 'loading', 0);
                            chrome.runtime.sendMessage({
                                action: 'saveScreenshot',
                                system: 'chapter-tracker',
                                imageData: _capturedImageData,
                                chapterId: targetChapterId,
                                subject: els.subjectSelect.value,
                                text: attachText,
                                description,
                                urls,
                                imageName,
                                type: 'concept',
                                tags,
                                createNewEntry: true
                            }, handleResult);
                        }
                    } else if (activeSystem === 'learning-notes') {
                        // LEARNING NOTES SAVING
                        const isNew = document.getElementById('pill-new-note').classList.contains('active');

                        if (isNew) {
                            const title = document.getElementById('notes-title').value.trim();
                            if (!title) return showStatus('⚠️ Entry title is required', 'error');

                            showStatus('⏳ Saving new note...', 'loading', 0);
                            chrome.runtime.sendMessage({
                                action: 'saveScreenshot',
                                system: 'learning-notes',
                                imageData: _capturedImageData,
                                subject: els.notesSubjectSelect.value,
                                title,
                                description,
                                links: urls, // The /api/notes expects "links" in its schema, not "urls"
                                imageName,
                                createNew: true // Flags API to create a new note record
                            }, handleResult);
                        } else {
                            if (!targetNoteId) return showStatus('⚠️ Select an existing note', 'error');

                            showStatus('⏳ Attaching to note...', 'loading', 0);
                            chrome.runtime.sendMessage({
                                action: 'saveScreenshot',
                                system: 'learning-notes',
                                imageData: _capturedImageData,
                                noteId: targetNoteId,
                                // Provide default title logic. Existing takes precedence.
                                title: allNotes.find(n => n.id === targetNoteId)?.title || "Attached Screenshot",
                                description,
                                links: urls,
                                imageName,
                                createNew: false
                            }, handleResult);
                        }
                    }
                } catch (err) {
                    console.error('[StudyHub] Save error:', err);
                    showStatus('❌ Unexpected error: ' + err.message, 'error');
                }
            });

            function handleResult(result) {
                try {
                    if (chrome.runtime.lastError) {
                        showStatus('❌ Extension error: ' + chrome.runtime.lastError.message, 'error');
                        return;
                    }
                    if (result && result.success) {
                        showStatus('✅ Saved successfully!', 'success');
                        setTimeout(() => cleanupModal(), 1500);
                    } else {
                        showStatus('❌ ' + (result?.error || 'Failed to save'), 'error');
                    }
                } catch (err) {
                    console.error('[StudyHub] handleResult error:', err);
                    showStatus('❌ Unexpected error', 'error');
                }
            }
        }
    })();
}
