// StudyHub Quick Capture - Content Script (Area Selection)

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
    // Store notes for filtering
    let allNotes = [];

    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.id = 'studyhub-preview-modal';
    previewModal.innerHTML = `
        <div class="studyhub-preview-container">
            <div class="studyhub-preview-header">
                <h3>📸 Screenshot Captured</h3>
                <button class="studyhub-close-btn" id="studyhub-close">✕</button>
            </div>
            <div class="studyhub-preview-image-container">
                <img src="${imageDataUrl}" alt="Captured Screenshot" id="studyhub-preview-img"/>
            </div>
            <div class="studyhub-preview-form">
                <!-- Image Name Input - Always visible -->
                <div class="studyhub-form-group studyhub-image-name-group">
                    <label class="studyhub-label">🏷️ IMAGE NAME</label>
                    <input type="text" id="studyhub-image-name" placeholder="e.g. Diagram, Formula, Proof..." class="studyhub-image-name-input"/>
                </div>
                
                <!-- Destination Toggle -->
                <div class="studyhub-destination-toggle">
                    <button class="studyhub-toggle-btn active" id="studyhub-toggle-existing">📎 Attach to Note</button>
                    <button class="studyhub-toggle-btn" id="studyhub-toggle-new">✨ Create New Note</button>
                </div>
                
                <!-- Existing Note Selection -->
                <div id="studyhub-existing-section" class="studyhub-section">
                    <input type="text" id="studyhub-search" placeholder="🔍 Search notes..." class="studyhub-search"/>
                    <select id="studyhub-note-select" size="5">
                        <option value="" disabled>Loading notes...</option>
                    </select>
                </div>
                
                <!-- New Note Form - Matches Webapp -->
                <div id="studyhub-new-section" class="studyhub-section" style="display:none;">
                    <!-- Note Type Pills -->
                    <div class="studyhub-type-pills">
                        <button type="button" class="studyhub-type-pill active" data-type="concept" data-color="emerald">📚 Concept</button>
                        <button type="button" class="studyhub-type-pill" data-type="formula" data-color="blue">📐 Formula</button>
                        <button type="button" class="studyhub-type-pill" data-type="trick" data-color="amber">💡 Trick</button>
                        <button type="button" class="studyhub-type-pill" data-type="mistake" data-color="red">⚠️ Mistake</button>
                        <button type="button" class="studyhub-type-pill" data-type="doubt" data-color="purple">❓ Doubt</button>
                        <button type="button" class="studyhub-type-pill" data-type="resource" data-color="cyan">🔗 Resource</button>
                    </div>
                    
                    <!-- Title & Subject Row -->
                    <div class="studyhub-form-row">
                        <div class="studyhub-form-group">
                            <label class="studyhub-label">TITLE / CONCEPT NAME</label>
                            <input type="text" id="studyhub-new-title" placeholder="e.g. Lenz's Law" required />
                        </div>
                        <div class="studyhub-form-group">
                            <label class="studyhub-label">SUBJECT</label>
                            <select id="studyhub-subject">
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Mathematics">Mathematics</option>
                            </select>
                        </div>
                    </div>
                
                    <!-- Reference Links -->
                    <div class="studyhub-form-group">
                        <label class="studyhub-label">REFERENCE LINKS</label>
                        <div class="studyhub-links-container" id="studyhub-links-container">
                            <div class="studyhub-link-row">
                                <input type="text" class="studyhub-link-input" value="${window.location.href}" placeholder="Paste web link..." />
                                <button class="studyhub-remove-link">✕</button>
                            </div>
                        </div>
                        <button id="studyhub-add-link" class="studyhub-add-btn">+ Add Link</button>
                    </div>
                    
                    <!-- Description -->
                    <div class="studyhub-form-group">
                        <label class="studyhub-label">DETAILED NOTES</label>
                        <textarea id="studyhub-description" placeholder="Explain what you learned..." rows="4"></textarea>
                    </div>
                </div>
                
                <div class="studyhub-preview-actions">
                    <button class="studyhub-btn studyhub-btn-secondary" id="studyhub-retake">↻ Retake</button>
                    <button class="studyhub-btn studyhub-btn-primary" id="studyhub-save">💾 Save</button>
                </div>
            </div>
            <div class="studyhub-status" id="studyhub-status"></div>
        </div>
    `;
    document.body.appendChild(previewModal);

    // Store image data for later
    window.__studyhubCapturedImage = imageDataUrl;

    const existingSection = document.getElementById('studyhub-existing-section');
    const newSection = document.getElementById('studyhub-new-section');
    const toggleExisting = document.getElementById('studyhub-toggle-existing');
    const toggleNew = document.getElementById('studyhub-toggle-new');
    const searchInput = document.getElementById('studyhub-search');
    const noteSelect = document.getElementById('studyhub-note-select');

    // Toggle handlers
    toggleExisting.addEventListener('click', () => {
        toggleExisting.classList.add('active');
        toggleNew.classList.remove('active');
        existingSection.style.display = 'block';
        newSection.style.display = 'none';
    });

    toggleNew.addEventListener('click', () => {
        toggleNew.classList.add('active');
        toggleExisting.classList.remove('active');
        newSection.style.display = 'block';
        existingSection.style.display = 'none';
    });

    // Load notes into dropdown
    chrome.runtime.sendMessage({ action: 'fetchNotes' }, (response) => {
        noteSelect.innerHTML = '';
        if (response.notes && response.notes.length > 0) {
            allNotes = response.notes;
            renderNotes(allNotes);
        } else {
            noteSelect.innerHTML = '<option value="" disabled>No notes found</option>';
        }
    });

    // Render notes helper
    function renderNotes(notes) {
        noteSelect.innerHTML = '';
        notes.forEach(note => {
            const option = document.createElement('option');
            option.value = note.id;
            option.textContent = `${note.title} (${note.subject || 'General'})`;
            noteSelect.appendChild(option);
        });
        if (notes.length > 0) {
            noteSelect.options[0].selected = true;
        }
    }

    // Search filter
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            renderNotes(allNotes);
            return;
        }
        const filtered = allNotes.filter(n =>
            n.title.toLowerCase().includes(query) ||
            (n.subject && n.subject.toLowerCase().includes(query)) ||
            (n.topic && n.topic.toLowerCase().includes(query))
        );
        renderNotes(filtered);
    });

    // Type pill selection
    let selectedType = 'concept';
    document.querySelectorAll('.studyhub-type-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.studyhub-type-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedType = pill.dataset.type;
        });
    });

    // Link management
    const linksContainer = document.getElementById('studyhub-links-container');
    const addLinkBtn = document.getElementById('studyhub-add-link');

    // Add link
    addLinkBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'studyhub-link-row';
        row.innerHTML = `
            <input type="text" class="studyhub-link-input" placeholder="Paste web link..." />
            <button class="studyhub-remove-link">✕</button>
        `;
        linksContainer.appendChild(row);

        // Focus the new input
        row.querySelector('input').focus();

        // Add remove handler
        row.querySelector('.studyhub-remove-link').addEventListener('click', () => {
            row.remove();
        });
    });

    // Remove handler for initial link
    document.querySelector('.studyhub-remove-link').addEventListener('click', (e) => {
        e.target.closest('.studyhub-link-row').remove();
    });

    // Event handlers
    document.getElementById('studyhub-close').addEventListener('click', () => {
        previewModal.remove();
    });

    document.getElementById('studyhub-retake').addEventListener('click', () => {
        previewModal.remove();
        initSelection();
    });

    document.getElementById('studyhub-save').addEventListener('click', async () => {
        const statusEl = document.getElementById('studyhub-status');
        const isNewNote = newSection.style.display !== 'none';

        if (isNewNote) {
            // Creating new note - collect all fields
            const type = selectedType;
            const subject = document.getElementById('studyhub-subject').value;
            const title = document.getElementById('studyhub-new-title').value.trim();
            const description = document.getElementById('studyhub-description').value.trim();

            // Collect links
            const linkInputs = document.querySelectorAll('.studyhub-link-input');
            const links = Array.from(linkInputs)
                .map(input => input.value.trim())
                .filter(url => url.length > 0);

            if (!title) {
                statusEl.textContent = '⚠️ Please enter a title';
                statusEl.className = 'studyhub-status studyhub-status-error';
                return;
            }

            statusEl.textContent = '⏳ Creating note & uploading...';
            statusEl.className = 'studyhub-status studyhub-status-loading';

            const imageName = document.getElementById('studyhub-image-name').value.trim();
            chrome.runtime.sendMessage({
                action: 'saveScreenshot',
                imageData: window.__studyhubCapturedImage,
                noteId: null,
                type,
                title,
                subject,
                description,
                links, // Send links array
                imageName, // Custom image name
                createNew: true
            }, handleResult);
        } else {
            // Attaching to existing note
            const noteId = noteSelect.value;

            if (!noteId) {
                statusEl.textContent = '⚠️ Please select a note';
                statusEl.className = 'studyhub-status studyhub-status-error';
                return;
            }

            statusEl.textContent = '⏳ Uploading to MEGA...';
            statusEl.className = 'studyhub-status studyhub-status-loading';

            const imageName = document.getElementById('studyhub-image-name').value.trim();
            chrome.runtime.sendMessage({
                action: 'saveScreenshot',
                imageData: window.__studyhubCapturedImage,
                noteId,
                title: 'Screenshot',
                imageName, // Custom image name
                createNew: false
            }, handleResult);
        }

        function handleResult(result) {
            if (result.success) {
                statusEl.textContent = '✅ Saved to Notes!';
                statusEl.className = 'studyhub-status studyhub-status-success';
                setTimeout(() => previewModal.remove(), 1500);
            } else {
                statusEl.textContent = '❌ ' + (result.error || 'Failed to save');
                statusEl.className = 'studyhub-status studyhub-status-error';
            }
        }
    });
}

