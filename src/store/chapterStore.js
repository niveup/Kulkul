import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Chapter-wise JEE Question & Concept Tracker Store
 * 
 * Structure:
 * subjects: {
 *   physics: [{ id, name, entries: [{ id, text, type, images: [], urls: [], createdAt }] }],
 *   chemistry: [...],
 *   math: [...]
 * }
 */

export const useChapterStore = create(
    persist(
        (set, get) => ({
            subjects: {
                physics: [],
                chemistry: [],
                math: [],
            },
            isLoading: false,
            error: null,
            processedTransactionIds: new Set(),

            // Sync with Database
            syncWithDb: async () => {
                set({ isLoading: true });
                try {
                    const response = await fetch('/api/chapter-tracker');
                    if (!response.ok) throw new Error('Failed to fetch notes');

                    const { chapters, entries } = await response.json();

                    // Reconstruct state from DB data
                    const newSubjects = {
                        physics: [],
                        chemistry: [],
                        math: [],
                    };

                    // 1. Map entries by chapterId for O(1) lookup
                    const entriesByChapter = {};
                    entries.forEach(e => {
                        if (!entriesByChapter[e.chapter_id]) entriesByChapter[e.chapter_id] = [];

                        let parsedImages = [];
                        try {
                            parsedImages = typeof e.images === 'string' ? JSON.parse(e.images) : (e.images || []);
                        } catch (err) { console.warn('Failed to parse images', e.images); }

                        let parsedUrls = [];
                        try {
                            parsedUrls = typeof e.urls === 'string' ? JSON.parse(e.urls) : (e.urls || []);
                        } catch (err) { console.warn('Failed to parse urls', e.urls); }

                        entriesByChapter[e.chapter_id].push({
                            id: e.id,
                            text: e.text,
                            type: e.type,
                            images: parsedImages,
                            urls: parsedUrls,
                            description: e.description || '',
                            tags: e.tags || '',
                            priority: e.priority || 'medium',
                            createdAt: e.created_at,
                            updatedAt: e.updated_at
                        });
                    });

                    // 2. Build subjects structure
                    chapters.forEach(ch => {
                        if (newSubjects[ch.subject]) {
                            newSubjects[ch.subject].push({
                                id: ch.id,
                                name: ch.name,
                                entries: entriesByChapter[ch.id] || [],
                                createdAt: ch.created_at
                            });
                        }
                    });

                    set({ subjects: newSubjects, isLoading: false, error: null });
                } catch (error) {
                    console.error('Sync failed:', error);
                    set({ isLoading: false, error: error.message });
                }
            },

            // Add a new chapter to a subject
            addChapter: (subject, chapterName) => {
                const trimmed = chapterName.trim();
                if (!trimmed) return;

                const newId = crypto.randomUUID();

                // Optimistic update
                set((state) => ({
                    subjects: {
                        ...state.subjects,
                        [subject]: [
                            ...(state.subjects[subject] || []),
                            {
                                id: newId,
                                name: trimmed,
                                entries: [],
                                createdAt: new Date().toISOString(),
                            },
                        ],
                    },
                }));

                // API Call
                fetch('/api/chapter-tracker', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'add_chapter',
                        data: { id: newId, subject, name: trimmed }
                    })
                }).catch(console.error);
            },

            // Remove a chapter from a subject
            removeChapter: (subject, chapterId) => {
                // Optimistic update
                set((state) => ({
                    subjects: {
                        ...state.subjects,
                        [subject]: state.subjects[subject].filter(
                            (ch) => ch.id !== chapterId
                        ),
                    },
                }));

                // API Call
                fetch('/api/chapter-tracker', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete_chapter',
                        id: chapterId
                    })
                }).catch(console.error);
            },

            // Add an entry (question or concept) to a chapter
            addEntry: (subject, chapterId, text, type = 'question', extraFields = {}) => {
                const trimmed = text.trim();
                if (!trimmed) return;

                // 1. Transaction Idempotency Check (Strongest Guard)
                const transactionId = extraFields.transactionId;
                if (transactionId) {
                    const processedIds = get().processedTransactionIds || new Set();
                    if (processedIds.has(transactionId)) {
                        console.warn(`[ChapterStore] Duplicate transaction prevented: ${transactionId}`);
                        return;
                    }
                    // Add to processed set
                    const newSet = new Set(processedIds);
                    newSet.add(transactionId);
                    set({ processedTransactionIds: newSet });
                }

                // 2. De-bouncing (Secondary Guard)
                const now = Date.now();
                if (get().lastAddEntryTime && (now - get().lastAddEntryTime < 500)) {
                    console.warn('Duplicate addEntry prevention triggered');
                    return;
                }
                set({ lastAddEntryTime: now });

                const newId = crypto.randomUUID();
                const newEntry = {
                    id: newId,
                    text: trimmed,
                    type, // 'question' | 'concept'
                    images: extraFields.images || [],
                    urls: extraFields.urls || [],
                    description: extraFields.description || '',
                    tags: extraFields.tags || '',
                    priority: extraFields.priority || 'medium',
                    createdAt: new Date().toISOString(),
                    ...extraFields,
                };

                // Optimistic update
                set((state) => ({
                    subjects: {
                        ...state.subjects,
                        [subject]: state.subjects[subject].map((ch) =>
                            ch.id === chapterId
                                ? { ...ch, entries: [...ch.entries, newEntry] }
                                : ch
                        ),
                    },
                }));

                // API Call
                fetch('/api/chapter-tracker', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'add_entry',
                        data: { ...newEntry, chapterId }
                    })
                }).catch(console.error);
            },

            // Remove an entry from a chapter
            removeEntry: (subject, chapterId, entryId) => {
                // Optimistic update
                set((state) => ({
                    subjects: {
                        ...state.subjects,
                        [subject]: state.subjects[subject].map((ch) =>
                            ch.id === chapterId
                                ? {
                                    ...ch,
                                    entries: ch.entries.filter((e) => e.id !== entryId),
                                }
                                : ch
                        ),
                    },
                }));

                // API Call
                fetch('/api/chapter-tracker', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete_entry',
                        id: entryId
                    })
                }).catch(console.error);
            },

            // Update an entry with generic fields
            updateEntry: (subject, chapterId, entryId, updates) => {
                // Optimistic update
                set((state) => ({
                    subjects: {
                        ...state.subjects,
                        [subject]: state.subjects[subject].map((ch) =>
                            ch.id === chapterId
                                ? {
                                    ...ch,
                                    entries: ch.entries.map((e) =>
                                        e.id === entryId
                                            ? { ...e, ...updates }
                                            : e
                                    ),
                                }
                                : ch
                        ),
                    },
                }));

                // API Call
                // We need to fetch the current entry to update it fully, or just send updates?
                // The API expects full data for safely, or we can send partials if API supported it.
                // For now, let's just send the updates assuming the API handles it or we send enough.
                // Actually my proposed API update logic was: 
                // UPDATE entries SET text=?, ... WHERE id=?
                // So I should send the fields I want to update.
                fetch('/api/chapter-tracker', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'update_entry',
                        data: { id: entryId, ...updates }
                    })
                }).catch(console.error);
            },

            // Legacy alias - keep for compatibility if needed elsewhere temporarily
            updateEntryText: (subject, chapterId, entryId, newText, newType) => {
                get().updateEntry(subject, chapterId, entryId, {
                    text: newText,
                    ...(newType ? { type: newType } : {})
                });
            },

            // Add an image to an existing entry
            addImageToEntry: (subject, chapterId, entryId, imageUrl) => {
                if (!imageUrl?.trim()) return;

                // Get current entry to sync correctly
                const subjectData = get().subjects[subject];
                const chapter = subjectData?.find(c => c.id === chapterId);
                const entry = chapter?.entries.find(e => e.id === entryId);
                const newImages = [...(entry?.images || []), imageUrl.trim()];

                get().updateEntry(subject, chapterId, entryId, { images: newImages });
            },

            // Remove an image from an entry
            removeImageFromEntry: (subject, chapterId, entryId, imageIndex) => {
                const subjectData = get().subjects[subject];
                const chapter = subjectData?.find(c => c.id === chapterId);
                const entry = chapter?.entries.find(e => e.id === entryId);
                const newImages = (entry?.images || []).filter((_, i) => i !== imageIndex);

                get().updateEntry(subject, chapterId, entryId, { images: newImages });
            },

            // Add a URL to an existing entry
            addUrlToEntry: (subject, chapterId, entryId, url) => {
                if (!url?.trim()) return;
                const subjectData = get().subjects[subject];
                const chapter = subjectData?.find(c => c.id === chapterId);
                const entry = chapter?.entries.find(e => e.id === entryId);
                const newUrls = [...(entry?.urls || []), url.trim()];

                get().updateEntry(subject, chapterId, entryId, { urls: newUrls });
            },

            // Remove a URL from an entry
            removeUrlFromEntry: (subject, chapterId, entryId, urlIndex) => {
                const subjectData = get().subjects[subject];
                const chapter = subjectData?.find(c => c.id === chapterId);
                const entry = chapter?.entries.find(e => e.id === entryId);
                const newUrls = (entry?.urls || []).filter((_, i) => i !== urlIndex);

                get().updateEntry(subject, chapterId, entryId, { urls: newUrls });
            },
        }),
        {
            name: 'jee-chapter-tracker',
            onRehydrateStorage: () => (state) => {
                // Optional: Sync on load
                if (state && state.syncWithDb) {
                    state.syncWithDb();
                }
            }
        }
    )
);
