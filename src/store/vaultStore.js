import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useVaultStore = create(
    devtools(
        persist(
            (set, get) => ({
                // State
                files: [],
                folders: [],
                tags: [],
                annotations: [], // Cache for current session
                currentFolderId: null, // null = root
                viewMode: 'grid', // 'grid' | 'list'
                sortBy: 'name', // 'name' | 'date' | 'size' | 'type'
                sortOrder: 'asc', // 'asc' | 'desc'
                selectedFileIds: [],
                searchQuery: '',
                isLoading: false,
                isUploading: false,
                error: null,

                // Actions
                setCurrentFolderId: (folderId) => set({ currentFolderId: folderId, selectedFileIds: [] }),
                setViewMode: (mode) => set({ viewMode: mode }),
                setSortBy: (sortBy) => set({ sortBy }),
                setSortOrder: (order) => set({ sortOrder: order }),
                setSearchQuery: (query) => set({ searchQuery: query }),

                // Selection
                toggleFileSelection: (fileId) => set(state => {
                    const isSelected = state.selectedFileIds.includes(fileId);
                    return {
                        selectedFileIds: isSelected
                            ? state.selectedFileIds.filter(id => id !== fileId)
                            : [...state.selectedFileIds, fileId]
                    };
                }),
                selectAllFiles: () => set(state => ({
                    selectedFileIds: state.files
                        .filter(f => f.folderId === state.currentFolderId)
                        .map(f => f.id)
                })),
                clearSelection: () => set({ selectedFileIds: [] }),

                // Optimistic Updates
                addFile: (file) => set(state => ({ files: [file, ...state.files] })),
                removeFile: (fileId) => set(state => ({
                    files: state.files.filter(f => f.id !== fileId),
                    selectedFileIds: state.selectedFileIds.filter(id => id !== fileId)
                })),
                updateFile: (fileId, updates) => set(state => ({
                    files: state.files.map(f => f.id === fileId ? { ...f, ...updates } : f)
                })),

                addFolder: (folder) => set(state => ({ folders: [...state.folders, folder] })),
                updateFolder: (folderId, updates) => set(state => ({
                    folders: state.folders.map(f => f.id === folderId ? { ...f, ...updates } : f)
                })),
                removeFolder: (folderId) => set(state => ({
                    folders: state.folders.filter(f => f.id !== folderId)
                })),

                addTag: (tag) => set(state => ({ tags: [...state.tags, tag] })),
                removeTag: (tagId) => set(state => ({ tags: state.tags.filter(t => t.id !== tagId) })),

                // Bulk Operations
                moveFiles: (fileIds, targetFolderId) => set(state => ({
                    files: state.files.map(f =>
                        fileIds.includes(f.id) ? { ...f, folderId: targetFolderId } : f
                    ),
                    selectedFileIds: []
                })),

                // Initial Data Load
                setInitialData: (data) => set({
                    files: data.files || [],
                    folders: data.folders || [],
                    tags: data.tags || [],
                    isLoading: false
                }),

                setLoading: (isLoading) => set({ isLoading }),
                setError: (error) => set({ error })
            }),
            {
                name: 'vault-storage',
                partialize: (state) => ({
                    viewMode: state.viewMode,
                    sortBy: state.sortBy,
                    sortOrder: state.sortOrder,
                    // Don't persist large data arrays to localStorage to avoid quota limits
                    // They will be refetched on load
                })
            }
        )
    )
);
