import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '../lib/logger';

const API_PATH = '/api/notes';

export const useNotesStore = create(
    persist(
        (set, get) => ({
            notes: [],
            chapters: {
                'Physics': [
                    'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Rotational Motion',
                    'Gravitation', 'Thermodynamics', 'Electrostastics', 'Current Electricity',
                    'Magnetic Effects of Current and Magnetism', 'Electromagnetic Induction and Alternating Currents', 'Optics'
                ],
                'Chemistry': [
                    'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties',
                    'Chemical Bonding and Molecular Structure', 'Chemical Thermodynamics', 'Equilibrium',
                    'Redox Reactions', 'Organic Chemistry - Some Basic Principles and Techniques', 'Hydrocarbons'
                ],
                'Mathematics': [
                    'Sets, Relations and Functions', 'Complex Numbers and Quadratic Equations', 'Matrices and Determinants',
                    'Permutations and Combinations', 'Binomial Theorem', 'Sequence and Series',
                    'Limit, Continuity and Differentiability', 'Integral Calculus', 'Differential Equations', 'Coordinate Geometry', 'Three Dimensional Geometry', 'Vector Algebra'
                ]
            },
            chapterAccessTimes: {},
            isLoading: false,
            error: null,
            lastSynced: null,
            currentViewContext: 'all',

            // UI Actions
            setViewContext: (type) => set({ currentViewContext: type }),
            fetchNotes: async () => {
                set({ isLoading: true });
                try {
                    const response = await fetch(API_PATH);
                    if (!response.ok) throw new Error('Failed to fetch notes');
                    const data = await response.json();
                    set({ notes: Array.isArray(data) ? data : [], isLoading: false, lastSynced: Date.now(), error: null });
                } catch (err) {
                    set({ error: err.message, isLoading: false });
                    logger.error('Notes fetch error:', err);
                }
            },

            // Add new note (with Optimistic UI)
            addNote: async (note) => {
                logger.debug('[NotesStore] addNote called with:', {
                    title: note.title,
                    images: note.images,
                    links: note.links
                });

                const newNote = {
                    ...note,
                    id: crypto.randomUUID(),
                    created_at: new Date().toISOString(),
                    is_revised: false,
                    revision_count: 0
                };

                logger.debug('[NotesStore] newNote object:', {
                    id: newNote.id,
                    images: newNote.images,
                    links: newNote.links
                });

                // Optimistic update
                const previousNotes = get().notes;
                set({ notes: [newNote, ...previousNotes] });

                try {
                    const body = JSON.stringify(newNote);
                    logger.debug('[NotesStore] Sending to API:', body.substring(0, 500));

                    const response = await fetch(API_PATH, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: body
                    });
                    if (!response.ok) throw new Error('Failed to save note');
                    logger.debug('[NotesStore] API Response OK');

                    // Update state with actual DB response if needed (API returns 201)
                } catch (err) {
                    // Rollback
                    set({ notes: previousNotes, error: `Save failed: ${err.message}` });
                    logger.error('Note add error:', err);
                }
            },

            // Update note
            updateNote: async (id, updates) => {
                const previousNotes = get().notes;
                const existingNote = previousNotes.find(n => n.id === id);

                if (!existingNote) {
                    logger.error('[NotesStore] updateNote: Note not found:', id);
                    return;
                }

                // Merge existing note with updates to ensure all fields are present
                const mergedNote = {
                    ...existingNote,
                    ...updates,
                    // Preserve system fields
                    id: existingNote.id,
                    created_at: existingNote.created_at,
                    is_revised: existingNote.is_revised ?? false,
                    revision_count: existingNote.revision_count ?? 0
                };

                logger.debug('[NotesStore] updateNote mergedNote:', {
                    id: mergedNote.id,
                    images: mergedNote.images,
                    links: mergedNote.links
                });

                set({
                    notes: previousNotes.map(n => n.id === id ? mergedNote : n)
                });

                try {
                    const body = JSON.stringify(mergedNote);
                    logger.debug('[NotesStore] PUT to API:', body.substring(0, 500));

                    const response = await fetch(`${API_PATH}?id=${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: body
                    });
                    if (!response.ok) throw new Error('Failed to update note');
                    logger.debug('[NotesStore] PUT Response OK');
                } catch (err) {
                    set({ notes: previousNotes, error: `Update failed: ${err.message}` });
                    logger.error('Note update error:', err);
                }
            },

            // Delete note
            deleteNote: async (id) => {
                const previousNotes = get().notes;
                set({ notes: previousNotes.filter(n => n.id !== id) });

                try {
                    const response = await fetch(`${API_PATH}?id=${id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error('Failed to delete note');
                } catch (err) {
                    set({ notes: previousNotes, error: `Delete failed: ${err.message}` });
                    logger.error('Note delete error:', err);
                }
            },

            // Mark as revised
            markAsRevised: async (id) => {
                const note = get().notes.find(n => n.id === id);
                if (!note) return;

                const updates = {
                    ...note,
                    is_revised: true,
                    revision_count: (note.revision_count || 0) + 1,
                    updated_at: new Date().toISOString()
                };

                await get().updateNote(id, updates);
            },

            // Remove a specific media link from a note (auto-cleanup for broken links)
            removeMediaLink: async (id, brokenUrl) => {
                const note = get().notes.find(n => n.id === id);
                if (!note) return;

                const updates = {
                    images: (note.images || []).filter(img => {
                        const url = typeof img === 'string' ? img : img?.url;
                        return url !== brokenUrl;
                    }),
                    links: (note.links || []).filter(l => l !== brokenUrl)
                };

                logger.debug('[NotesStore] removeMediaLink: Cleaning up broken link:', brokenUrl);
                await get().updateNote(id, updates);
            },

            // Update a specific image (used by the annotator)
            updateNoteImage: async (noteId, oldImgObj, newImageDataUrl) => {
                const note = get().notes.find(n => n.id === noteId);
                if (!note || !note.images) {
                    logger.error('[NotesStore] updateNoteImage: Note or note.images is missing', { noteId });
                    return;
                }

                const actualOldUrl = typeof oldImgObj === 'string' ? oldImgObj : oldImgObj?.url;

                const updatedImages = note.images.map(img => {
                    const imgUrl = typeof img === 'string' ? img : img?.url;
                    if (imgUrl === actualOldUrl) {
                        return {
                            name: typeof img === 'object' ? img.name : 'annotated-image.webp',
                            url: newImageDataUrl,
                            annotated_at: new Date().toISOString()
                        };
                    }
                    return img;
                });

                logger.debug('[NotesStore] updateNoteImage: Saving new annotated image data');
                await get().updateNote(noteId, { images: updatedImages });
            },

            // UI Actions
            toggleModal: (isOpen, note = null) => {
                set({
                    isModalOpen: isOpen,
                    editingNote: note
                });
            },

            // Chapter Actions
            addCustomChapter: (subject, chapterName) => set(state => {
                const subKey = Object.keys(state.chapters).find(k => k.toLowerCase() === subject.toLowerCase()) || subject;
                const updated = { ...state.chapters };
                if (!updated[subKey]) updated[subKey] = [];
                if (!updated[subKey].includes(chapterName)) {
                    updated[subKey] = [...updated[subKey], chapterName];
                }
                return { chapters: updated };
            }),

            deleteCustomChapter: (subject, chapterName) => set(state => {
                const subKey = Object.keys(state.chapters).find(k => k.toLowerCase() === subject.toLowerCase()) || subject;
                const updated = { ...state.chapters };
                if (updated[subKey]) {
                    updated[subKey] = updated[subKey].filter(c => c !== chapterName);
                }
                return { chapters: updated };
            }),

            recordChapterAccess: (chapterName) => set((state) => ({ chapterAccessTimes: { ...state.chapterAccessTimes, [chapterName]: Date.now() } })),

            editCustomChapter: (subject, oldName, newName) => {
                // Update chapter name
                set(state => {
                    const subKey = Object.keys(state.chapters).find(k => k.toLowerCase() === subject.toLowerCase()) || subject;
                    const updated = { ...state.chapters };
                    if (updated[subKey]) {
                        updated[subKey] = updated[subKey].map(c => c === oldName ? newName : c);
                    }
                    return { chapters: updated };
                });

                // Also update all notes referencing the old chapter name
                const store = get();
                const notesToUpdate = store.notes.filter(n => n.topic === oldName && (n.subject?.toLowerCase() === subject.toLowerCase() || subject === 'Other'));
                notesToUpdate.forEach(n => {
                    store.updateNote(n.id, { topic: newName });
                });
            }
        }),
        {
            name: 'learning-notes-storage',
            partialize: (state) => ({
                notes: state.notes,
                chapters: state.chapters // Persist chapters
            })
        }
    )
);

// Helper for selecting actions
export const useNoteActions = () => {
    const fetchNotes = useNotesStore(s => s.fetchNotes);
    const addNote = useNotesStore(s => s.addNote);
    const updateNote = useNotesStore(s => s.updateNote);
    const deleteNote = useNotesStore(s => s.deleteNote);
    const markAsRevised = useNotesStore(s => s.markAsRevised);
    const removeMediaLink = useNotesStore(s => s.removeMediaLink);
    const toggleModal = useNotesStore(s => s.toggleModal);
    const setViewContext = useNotesStore(s => s.setViewContext);

    const addCustomChapter = useNotesStore(s => s.addCustomChapter);
    const deleteCustomChapter = useNotesStore(s => s.deleteCustomChapter);
    const editCustomChapter = useNotesStore(s => s.editCustomChapter);

    return {
        fetchNotes,
        addNote,
        updateNote,
        deleteNote,
        markAsRevised,
        removeMediaLink,
        toggleModal,
        setViewContext,
        addCustomChapter,
        deleteCustomChapter,
        editCustomChapter
    };
};
