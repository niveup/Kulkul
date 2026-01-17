---
name: zustand-store
description: Create and manage Zustand store slices with proper selectors and optimization
---

# Zustand Store Management Skill

## Overview
Create and manage Zustand store slices following the Personal Dashboard's patterns.

## Store Locations
- **Main store**: `src/store/index.js`
- **Selectors**: `src/store/selectors.js`
- **Slices**: `src/store/slices/`

## Creating a Store Slice
```javascript
// src/store/slices/todosSlice.js
export const createTodosSlice = (set, get) => ({
  // State
  todos: [],
  todosLoading: false,
  todosError: null,

  // Actions
  setTodos: (todos) => set({ todos }),
  
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, { 
      ...todo, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }]
  })),

  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map((t) => 
      t.id === id ? { ...t, ...updates } : t
    )
  })),

  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter((t) => t.id !== id)
  })),

  // Async action
  fetchTodos: async () => {
    set({ todosLoading: true, todosError: null });
    try {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      set({ todos, todosLoading: false });
    } catch (error) {
      set({ todosError: error.message, todosLoading: false });
    }
  },
});
```

## Combining Slices
```javascript
// src/store/index.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      ...createTodosSlice(set, get),
      ...createSessionsSlice(set, get),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        todos: state.todos,
        sessions: state.sessions,
      }),
    }
  )
);
```

## Creating Optimized Selectors
```javascript
// src/store/selectors.js
import { useStore } from './index';
import { shallow } from 'zustand/shallow';

// ✅ Atomic selectors - minimal re-renders
export const useTodos = () => useStore((s) => s.todos);
export const useTodosLoading = () => useStore((s) => s.todosLoading);

// Derived selectors
export const useCompletedTodos = () => 
  useStore((s) => s.todos.filter(t => t.completed));

// Multiple values with shallow compare
export const useTodoStats = () => useStore(
  (s) => ({
    total: s.todos.length,
    completed: s.todos.filter(t => t.completed).length,
  }),
  shallow
);
```

## Checklist
- [ ] Slice follows naming convention: `create[Name]Slice`
- [ ] Async actions handle loading/error states
- [ ] Selectors created for all accessed state
- [ ] `shallow` used for multi-value selectors
- [ ] Persistence configured if needed

---

## 🔄 Self-Improvement Instructions

> **IMPORTANT**: When using this skill and encountering an error or finding a better solution:
> 1. **DO NOT** delete or overwrite existing content
> 2. **APPEND** the new learning to the "Known Issues & Solutions" section below
> 3. Include: Date, Problem, Root Cause, Solution
> 4. If a pattern in the template above needs updating, update it AND document why in the log

---

## 📚 Known Issues & Solutions

<!-- Add new entries at the TOP of this section, newest first -->

*No issues logged yet. This section will grow as problems are encountered and solved.*
