import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_PATH = '/api/notes';

export const useNotesStore = create(
    persist(
        (set, get) => ({
            notes: [],
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
                    console.error('Notes fetch error:', err);
                }
            },

            // Add new note (with Optimistic UI)
            addNote: async (note) => {
                console.log('[NotesStore] addNote called with:', {
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

                console.log('[NotesStore] newNote object:', {
                    id: newNote.id,
                    images: newNote.images,
                    links: newNote.links
                });

                // Optimistic update
                const previousNotes = get().notes;
                set({ notes: [newNote, ...previousNotes] });

                try {
                    const body = JSON.stringify(newNote);
                    console.log('[NotesStore] Sending to API:', body.substring(0, 500));

                    const response = await fetch(API_PATH, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: body
                    });
                    if (!response.ok) throw new Error('Failed to save note');
                    console.log('[NotesStore] API Response OK');

                    // Update state with actual DB response if needed (API returns 201)
                } catch (err) {
                    // Rollback
                    set({ notes: previousNotes, error: `Save failed: ${err.message}` });
                    console.error('Note add error:', err);
                }
            },

            // Update note
            updateNote: async (id, updates) => {
                const previousNotes = get().notes;
                const existingNote = previousNotes.find(n => n.id === id);

                if (!existingNote) {
                    console.error('[NotesStore] updateNote: Note not found:', id);
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

                console.log('[NotesStore] updateNote mergedNote:', {
                    id: mergedNote.id,
                    images: mergedNote.images,
                    links: mergedNote.links
                });

                set({
                    notes: previousNotes.map(n => n.id === id ? mergedNote : n)
                });

                try {
                    const body = JSON.stringify(mergedNote);
                    console.log('[NotesStore] PUT to API:', body.substring(0, 500));

                    const response = await fetch(`${API_PATH}?id=${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: body
                    });
                    if (!response.ok) throw new Error('Failed to update note');
                    console.log('[NotesStore] PUT Response OK');
                } catch (err) {
                    set({ notes: previousNotes, error: `Update failed: ${err.message}` });
                    console.error('Note update error:', err);
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
                    console.error('Note delete error:', err);
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

                console.log('[NotesStore] removeMediaLink: Cleaning up broken link:', brokenUrl);
                await get().updateNote(id, updates);
            },

            // UI Actions
            toggleModal: (isOpen, note = null) => {
                set({
                    isModalOpen: isOpen,
                    editingNote: note
                });
            }
        }),
        {
            name: 'learning-notes-storage',
            partialize: (state) => ({ notes: state.notes }) // Only persist the list locally for fast boot
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

    return {
        fetchNotes,
        addNote,
        updateNote,
        deleteNote,
        markAsRevised,
        removeMediaLink,
        toggleModal,
        setViewContext
    };
};
