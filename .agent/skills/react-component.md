---
name: react-component
description: Create standardized React components following project patterns with proper optimization
---

# React Component Creation Skill

## Overview
Create React components following the Personal Dashboard's established patterns.

## File Locations
- **UI Components**: `src/components/ui/`
- **Feature Components**: `src/components/`
- **Page Sections**: `src/components/sections/`

## Template
```jsx
import React, { memo, useState, useCallback } from 'react';

/**
 * @component ComponentName
 * @description Brief description of what this component does
 * @param {Object} props
 * @param {string} props.className - Optional additional classes
 */
const ComponentName = memo(function ComponentName({ 
  className = '',
  ...props 
}) {
  // State declarations
  const [state, setState] = useState(initialValue);

  // Memoized callbacks
  const handleAction = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  return (
    <div className={`component-base ${className}`}>
      {/* Component content */}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';

export default ComponentName;
```

## Performance Guidelines

### 1. Always Use `React.memo`
```jsx
const Component = memo(function Component(props) {
  // ...
});
```

### 2. Memoize Callbacks
```jsx
const handleClick = useCallback((e) => {
  // logic
}, [dependencies]);
```

### 3. Memoize Expensive Computations
```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 4. Optimize Re-renders with Selectors
```jsx
// ❌ Bad - causes re-render on any store change
const { todos, sessions } = useStore();

// ✅ Good - only re-renders when todos change
const todos = useStore((state) => state.todos);
```

## Glass Morphism Style (Project Standard)
```jsx
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
```

## Checklist
- [ ] Component has a single, clear responsibility
- [ ] Uses `memo()` wrapper for optimization
- [ ] Callbacks memoized with `useCallback`
- [ ] Expensive computations use `useMemo`
- [ ] Zustand store access uses selectors
- [ ] Glass morphism styling applied where appropriate

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
