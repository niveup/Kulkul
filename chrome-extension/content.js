// StudyHub Quick Capture - Content Script (Area Selection)
if (!window.studyhubInjected) {
    (function () {
        window.studyhubInjected = true;

        let isSelecting = false;
        let startX, startY;
        let selectionOverlay, selectionBox;

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'startSelection') {
                initSelection();
                sendResponse({ success: true });
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

                chrome.runtime.sendMessage({ action: 'captureFullPage' }, (response) => {
                    if (response.dataUrl) {
                        showPreview(response.dataUrl);
                    }
                });
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
                if (response.dataUrl) {
                    // Crop the image to selection
                    const croppedImage = await cropImage(response.dataUrl, rect);
                    removeSelection();
                    showPreview(croppedImage);
                }
            });
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
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
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
                };
                img.src = dataUrl;
            });
        }

        function showPreview(imageDataUrl) {
            let allNotes = [];
            let allChapters = [];
            let allEntries = [];
            let selectedType = 'concept';

            // Create Modal Overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'studyhub-modal-overlay';
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
                    </div>

                    <div class="studyhub-footer-actions">
                        <button class="studyhub-action-btn studyhub-action-btn-secondary" id="studyhub-retake">↻ Retake</button>
                        <button class="studyhub-action-btn studyhub-action-btn-primary" id="studyhub-save">💾 Save to Vault</button>
                    </div>
                </div>

                <!-- Right Panel -->
                <div class="studyhub-right-panel">
                    <div class="studyhub-destination-tabs">
                        <button class="studyhub-tab active" id="studyhub-toggle-chapters">📚 Chapters</button>
                        <button class="studyhub-tab" id="studyhub-toggle-notes">📎 Notes</button>
                    </div>

                    <div class="studyhub-panel-scroll-content">
                        <!-- Chapters Section -->
                        <div id="studyhub-chapters-section" class="section-animate">
                            <div class="studyhub-sub-pill-container">
                                <button class="studyhub-sub-pill active" id="pill-new-entry">✨ New Note</button>
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
                                    <label class="studyhub-label">Search & Select Entry</label>
                                    <input type="text" id="studyhub-entry-search" placeholder="🔍 Filter entries..." class="studyhub-input-glass" style="margin-bottom: 12px;"/>
                                    <div id="studyhub-entry-list" class="studyhub-list-glass">
                                        <div class="studyhub-list-item">Loading entries...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Learning Notes Section -->
                        <div id="studyhub-notes-section" style="display:none;" class="section-animate">
                            <div class="studyhub-sub-pill-container">
                                <button class="studyhub-sub-pill active" id="pill-new-note">✨ New Note</button>
                                <button class="studyhub-sub-pill" id="pill-existing-note">🔍 Existing Note</button>
                            </div>
                            <div id="studyhub-new-note-fields">
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Note Title</label>
                                    <input type="text" id="studyhub-new-note-title" placeholder="e.g. Organic Chemistry Review" class="studyhub-input-glass"/>
                                </div>
                            </div>
                            <div id="studyhub-search-note-fields" style="display:none;">
                                <div class="studyhub-form-group">
                                    <label class="studyhub-label">Search Note</label>
                                    <input type="text" id="studyhub-note-search" placeholder="🔍 Search notes..." class="studyhub-input-glass" style="margin-bottom: 12px;"/>
                                    <div id="studyhub-note-list" class="studyhub-list-glass">
                                        <div class="studyhub-list-item">Loading notes...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Common Fields -->
                        <div class="studyhub-form-group" style="margin-top: 24px;">
                            <label class="studyhub-label">Links & References</label>
                            <div id="studyhub-links-container">
                                <div class="studyhub-link-item">
                                    <input type="text" value="${window.location.href}" readonly disabled/>
                                    <span class="studyhub-remove-link-btn">✕</span>
                                </div>
                            </div>
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
            document.body.appendChild(modalOverlay);

            // Store image data for save operation
            window.__studyhubCapturedImage = imageDataUrl;

            // --- State & Elements ---
            let targetEntryId = null;
            let targetNoteId = null;

            const els = {
                saveBtn: document.getElementById('studyhub-save'),
                retakeBtn: document.getElementById('studyhub-retake'),
                closeBtn: document.getElementById('studyhub-close'),
                subjectSelect: document.getElementById('studyhub-subject-select'),
                chapterSelect: document.getElementById('studyhub-chapter-select'),
                newChapterInput: document.getElementById('studyhub-new-chapter-name'),
                entrySearch: document.getElementById('studyhub-entry-search'),
                entryList: document.getElementById('studyhub-entry-list'),
                status: document.getElementById('studyhub-floating-status')
            };

            // --- Logic Functions ---

            function showStatus(msg, type = 'loading', duration = 2000) {
                els.status.textContent = msg;
                els.status.className = `studyhub-floating-status status-${type}`;
                els.status.style.display = 'flex';
                if (duration > 0) {
                    setTimeout(() => { els.status.style.display = 'none'; }, duration);
                }
            }

            async function fetchChaptersAndEntries() {
                chrome.runtime.sendMessage({ action: 'fetchChapters' }, (response) => {
                    if (response && response.chapters && !response.error) {
                        allChapters = response.chapters;
                        allEntries = response.entries || [];
                        console.log(`[StudyHub] Fetched ${allChapters.length} chapters and ${allEntries.length} entries.`);
                        updateChapterDropdown();
                        updateEntryList();
                    } else {
                        console.error('[StudyHub] Fetch failed:', response?.error);
                        renderEntryList([]); // Clear loading state
                        const errorMsg = response?.error?.includes('401') || response?.error?.includes('Unauthorized')
                            ? '⚠️ Please login to Dashboard'
                            : '⚠️ Failed to sync with Dashboard';
                        showStatus(errorMsg, 'error', 5000);
                    }
                });
            }

            function fetchNotes() {
                chrome.runtime.sendMessage({ action: 'fetchNotes' }, (response) => {
                    if (response && response.notes && !response.error) {
                        allNotes = response.notes;
                        renderNoteList(allNotes);
                    } else {
                        renderNoteList([]); // Clear loading state
                        if (response?.error) showStatus('⚠️ Failed to load notes', 'error');
                    }
                });
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
                const subject = els.subjectSelect.value;
                const chapterId = els.chapterSelect.value;
                const term = els.entrySearch.value.toLowerCase();
                const isExistingMode = document.getElementById('pill-existing-entry').classList.contains('active');

                const filtered = allEntries.filter(e => {
                    const ch = allChapters.find(c => c.id === e.chapter_id);
                    if (!ch) {
                        console.warn('[StudyHub] Entry has no matching chapter:', e.id, e.chapter_id);
                        return false;
                    }

                    const chapterSubject = (ch.subject || '').toLowerCase();
                    const matchesSubject = chapterSubject === subject || (subject === 'math' && chapterSubject === 'mathematics');

                    // If in existing mode, show all entries for the subject regardless of chapter selection
                    const matchesChapter = isExistingMode || (chapterId === 'NEW_CHAPTER' || e.chapter_id === chapterId);
                    const matchesSearch = !term || (e.text && e.text.toLowerCase().includes(term));

                    return matchesSubject && matchesChapter && matchesSearch;
                });

                console.log(`[StudyHub] Filtering entries for ${subject}. Found ${filtered.length} matches.`);
                renderEntryList(filtered);
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

            function renderNoteList(notes) {
                const listEl = document.getElementById('studyhub-note-list');
                listEl.innerHTML = '';
                const term = document.getElementById('studyhub-note-search').value.toLowerCase();

                const filtered = notes.filter(n => !term || n.title.toLowerCase().includes(term));

                if (filtered.length === 0) {
                    listEl.innerHTML = '<div class="studyhub-list-item">No notes found</div>';
                    return;
                }

                filtered.forEach(n => {
                    const item = document.createElement('div');
                    item.className = 'studyhub-list-item';
                    if (targetNoteId === n.id) item.classList.add('selected');
                    item.textContent = `${n.title} [${n.subject || 'General'}]`;
                    item.onclick = () => {
                        targetNoteId = n.id;
                        document.querySelectorAll('#studyhub-note-list .studyhub-list-item').forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                    };
                    listEl.appendChild(item);
                });
            }

            // --- Initialization ---
            fetchChaptersAndEntries();

            // --- Events ---
            els.subjectSelect.onchange = () => {
                updateChapterDropdown();
                updateEntryList();
            };
            els.chapterSelect.onchange = () => {
                handleChapterChange();
                updateEntryList();
            };
            els.entrySearch.oninput = updateEntryList;
            document.getElementById('studyhub-note-search').oninput = () => renderNoteList(allNotes);

            // Destination Toggles
            const chaptersSection = document.getElementById('studyhub-chapters-section');
            const notesSection = document.getElementById('studyhub-notes-section');

            document.getElementById('studyhub-toggle-chapters').onclick = (e) => {
                e.target.classList.add('active');
                document.getElementById('studyhub-toggle-notes').classList.remove('active');
                chaptersSection.style.display = 'block';
                notesSection.style.display = 'none';
            };
            document.getElementById('studyhub-toggle-notes').onclick = (e) => {
                e.target.classList.add('active');
                document.getElementById('studyhub-toggle-chapters').classList.remove('active');
                notesSection.style.display = 'block';
                chaptersSection.style.display = 'none';
                if (allNotes.length === 0) fetchNotes();
            };

            // Sub-pills
            document.getElementById('pill-new-entry').onclick = (e) => {
                e.target.classList.add('active');
                document.getElementById('pill-existing-entry').classList.remove('active');
                document.getElementById('studyhub-new-entry-fields').style.display = 'block';
                document.getElementById('studyhub-search-entry-fields').style.display = 'none';
            };
            document.getElementById('pill-existing-entry').onclick = (e) => {
                e.target.classList.add('active');
                document.getElementById('pill-new-entry').classList.remove('active');
                document.getElementById('studyhub-new-entry-fields').style.display = 'none';
                document.getElementById('studyhub-search-entry-fields').style.display = 'block';
                updateEntryList();
            };

            document.getElementById('pill-new-note').onclick = (e) => {
                e.target.classList.add('active');
                document.getElementById('pill-existing-note').classList.remove('active');
                document.getElementById('studyhub-new-note-fields').style.display = 'block';
                document.getElementById('studyhub-search-note-fields').style.display = 'none';
            };
            document.getElementById('pill-existing-note').onclick = (e) => {
                e.target.classList.add('active');
                document.getElementById('pill-new-note').classList.remove('active');
                document.getElementById('studyhub-new-note-fields').style.display = 'none';
                document.getElementById('studyhub-search-note-fields').style.display = 'block';
            };

            // Type tags
            document.querySelectorAll('.studyhub-type-tag').forEach(tag => {
                tag.onclick = () => {
                    document.querySelectorAll('.studyhub-type-tag').forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                    selectedType = tag.dataset.type;
                };
            });

            // Link management
            const linksContainer = document.getElementById('studyhub-links-container');
            document.querySelector('.studyhub-add-link-btn').onclick = () => {
                const row = document.createElement('div');
                row.className = 'studyhub-link-item';
                row.innerHTML = `
            <input type="text" placeholder="Paste Reference URL..." class="studyhub-input-glass" style="border:none; background:transparent;"/>
            <span class="studyhub-remove-link-btn">✕</span>
        `;
                linksContainer.appendChild(row);
                row.querySelector('.studyhub-remove-link-btn').onclick = () => row.remove();
            };

            document.querySelectorAll('.studyhub-remove-link-btn').forEach(btn => {
                btn.onclick = (e) => e.target.closest('.studyhub-link-item').remove();
            });

            // Close/Retake/Refresh
            els.closeBtn.onclick = () => modalOverlay.remove();
            els.retakeBtn.onclick = () => {
                modalOverlay.remove();
                initSelection();
            };
            document.getElementById('studyhub-refresh').onclick = () => {
                showStatus('⏳ Refreshing data...', 'loading', 1000);
                fetchChaptersAndEntries();
                if (notesSection.style.display !== 'none') fetchNotes();
            };

            // Save
            els.saveBtn.onclick = async () => {
                const isChapters = chaptersSection.style.display !== 'none';
                const description = document.getElementById('studyhub-description').value.trim();
                const imageName = document.getElementById('studyhub-image-name').value.trim();

                const linkInputs = document.querySelectorAll('#studyhub-links-container input');
                const urls = Array.from(linkInputs).map(i => i.value.trim()).filter(Boolean);

                if (isChapters) {
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
                            imageData: window.__studyhubCapturedImage,
                            chapterId: chapterId === 'NEW_CHAPTER' ? null : chapterId,
                            subject: els.subjectSelect.value,
                            chapterName: newChapterName,
                            text,
                            description,
                            urls,
                            imageName,
                            type: selectedType,
                            createNewChapter: chapterId === 'NEW_CHAPTER',
                            createNewEntry: true
                        }, handleResult);
                    } else {
                        if (!targetEntryId) return showStatus('⚠️ Select an entry first', 'error');
                        showStatus('⏳ Attaching to entry...', 'loading', 0);
                        chrome.runtime.sendMessage({
                            action: 'saveScreenshot',
                            system: 'chapter-tracker',
                            imageData: window.__studyhubCapturedImage,
                            entryId: targetEntryId,
                            description,
                            urls,
                            imageName
                        }, handleResult);
                    }
                } else {
                    // Learning Notes
                    const isNew = document.getElementById('pill-new-note').classList.contains('active');
                    if (isNew) {
                        const title = document.getElementById('studyhub-new-note-title').value.trim();
                        if (!title) return showStatus('⚠️ Missing note title', 'error');

                        const linkInputs = document.querySelectorAll('#studyhub-links-container input');
                        const urls = Array.from(linkInputs).map(i => i.value.trim()).filter(Boolean);

                        showStatus('⏳ Creating note...', 'loading', 0);
                        chrome.runtime.sendMessage({
                            action: 'saveScreenshot',
                            system: 'learning-notes',
                            imageData: window.__studyhubCapturedImage,
                            title,
                            subject: els.subjectSelect.value,
                            description,
                            links: urls,
                            imageName,
                            createNew: true
                        }, handleResult);
                    } else {
                        if (!targetNoteId) return showStatus('⚠️ Select a note first', 'error');
                        const linkInputs = document.querySelectorAll('#studyhub-links-container input');
                        const urls = Array.from(linkInputs).map(i => i.value.trim()).filter(Boolean);

                        showStatus('⏳ Updating note...', 'loading', 0);
                        chrome.runtime.sendMessage({
                            action: 'saveScreenshot',
                            system: 'learning-notes',
                            imageData: window.__studyhubCapturedImage,
                            noteId: targetNoteId,
                            description,
                            links: urls,
                            imageName,
                            createNew: false
                        }, handleResult);
                    }
                }
            };

            function handleResult(result) {
                if (result && result.success) {
                    showStatus('✅ Saved successfully!', 'success');
                    setTimeout(() => modalOverlay.remove(), 1500);
                } else {
                    showStatus('❌ ' + (result?.error || 'Failed to save'), 'error');
                }
            }
        }
    })();
}
