---
name: performance-audit
description: Run performance audits, bundle analysis, and apply optimizations
---

# Performance Audit Skill

## Overview
Bundle analysis and performance optimization workflow.

## Step 1: Bundle Analysis
```bash
npm run build && npx vite-bundle-visualizer
```

**Targets:**
- Total bundle size: < 200KB gzipped
- Check largest chunks
- Find duplicate dependencies

## Step 2: Dependency Optimization

```javascript
// ❌ Bad
import _ from 'lodash';
import * as Icons from 'lucide-react';

// ✅ Good
import debounce from 'lodash/debounce';
import { Home, Settings } from 'lucide-react';
```

## Step 3: React Performance Checklist
- [ ] Heavy components wrapped with `React.memo`
- [ ] Callbacks memoized with `useCallback`
- [ ] Expensive computations use `useMemo`
- [ ] Lists have stable `key` props
- [ ] Zustand selectors properly scoped

## Step 4: Code Splitting
```jsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

## Step 5: Vite Manual Chunks
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
        }
      }
    }
  }
}
```

## Step 6: Runtime Optimization

### Debounce Expensive Operations
```javascript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value) => {
  performSearch(value);
}, 300);
```

### Virtualize Long Lists
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList height={400} itemCount={items.length} itemSize={50}>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>
```

## Quick Commands
```bash
npm run build && npx vite-bundle-visualizer  # Analyze
npx lighthouse http://localhost:5173 --output html  # Lighthouse
```

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
