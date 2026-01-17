---
name: debug
description: Comprehensive debugging workflow with advanced techniques for React/Node applications, performance analysis, and production debugging
---

# Debug Skill

## Overview
Comprehensive debugging workflow for frontend, backend, state, performance, and deployment issues with advanced debugging techniques and tools.

## Problem Types

| Type | Examples |
|------|----------|
| Frontend | UI not rendering, component not updating, styling issues, memory leaks |
| Backend | API errors, auth failures, CORS issues, database issues |
| State | Not persisting, incorrect data flow, stale state, race conditions |
| Performance | Slow renders, bundle size, network latency, memory bloat |
| Build/Deploy | Build failures, Vercel errors, env variable problems, CI/CD issues |
| Production | Runtime errors, monitoring, logging, error tracking |

## Frontend Debugging

### Debug Logging Best Practices
```javascript
// Structured logging with context
console.log('[ComponentName] Props:', props);
console.log('[ComponentName] State:', state);
console.log('[ComponentName] Context:', { userId, route, timestamp });

// Conditional debug logging
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('[ComponentName] Debug info:', { props, state });
}

// Performance tracking
const startTime = performance.now();
// ... code to measure ...
console.log('[ComponentName] Execution time:', performance.now() - startTime, 'ms');

// Render tracking with component mounting
useEffect(() => {
  console.log('[ComponentName] Mounted');
  return () => console.log('[ComponentName] Unmounted');
}, []);

useEffect(() => {
  console.log('[ComponentName] Rendered with:', { props, state });
});
```

### React DevTools Usage
```javascript
// Use React DevTools Profiler to identify performance bottlenecks
// 1. Enable Profiler in DevTools
// 2. Record interactions
// 3. Analyze component render times
// 4. Identify unnecessary re-renders

// Use why-did-you-render for development
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
  });
}
```

### Common React Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Component not updating | Missing dependency in useEffect | Add dependency to array |
| Infinite re-renders | State update in render | Move to useEffect |
| Stale closure | Outdated ref in callback | Use useCallback with deps |
| Memory leak warning | Async op after unmount | Add cleanup function |
| Props not updating | Object reference equality | Use useMemo/useCallback |
| Child re-renders unnecessarily | Parent state changes | Memoize children or use React.memo |
| Event listeners not working | Wrong binding or missing cleanup | Use useCallback and proper cleanup |

## Backend/API Debugging

### Request Testing
```bash
# Basic endpoint test
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# POST request with body
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{ "title": "Test todo", "completed": false }'

# Verbose request for debugging
curl -v -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{ "title": "Test todo" }'

# Using httpie for better formatting
http POST http://localhost:3000/api/todos \
  title="Test todo" \
  completed:=false
```

### Backend Logging
```javascript
// Structured logging
const logger = {
  info: (message, data = {}) => console.log(`[INFO] ${message}`, data),
  error: (message, error = {}) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data = {}) => process.env.DEBUG && console.log(`[DEBUG] ${message}`, data),
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('API Error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
```

### CORS Fix Template
```javascript
// Production-ready CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Manual CORS handling (if needed)
const setCorsHeaders = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsOptions.origin.join(','));
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};
```

### Database Debugging
```javascript
// MongoDB connection debugging
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Query debugging
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Slow query logging
mongoose.plugin((schema) => {
  schema.pre('find', function() {
    this.start = Date.now();
  });

  schema.post('find', function() {
    if (this.start && Date.now() - this.start > 100) {
      console.warn('Slow query detected:', this.getQuery(), `${Date.now() - this.start}ms`);
    }
  });
});
```

### Common API Errors

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| 401 Unauthorized | Invalid/expired token | Check auth, refresh token |
| 403 Forbidden | Insufficient permissions | Check user roles/permissions |
| 404 Not Found | Wrong endpoint or ID | Check URL and resource |
| 409 Conflict | Duplicate resource | Check unique constraints |
| 422 Unprocessable Entity | Invalid request data | Validate input schema |
| 429 Too Many Requests | Rate limit exceeded | Implement backoff strategy |
| 500 Server Error | Unhandled exception | Check logs, add try/catch |
| 502 Bad Gateway | Upstream service down | Check external services |
| 503 Service Unavailable | Server overloaded | Implement scaling/queuing |
| 504 Gateway Timeout | Request took too long | Optimize slow queries |

## State Debugging

### Zustand Inspection
```javascript
console.log('Store state:', useStore.getState());

// Check localStorage
console.log('Persisted:', JSON.parse(localStorage.getItem('dashboard-storage')));

// Clear and retry
localStorage.removeItem('dashboard-storage');
location.reload();
```

### State Debugging Tools
```javascript
// Redux DevTools integration
const useStore = create(devtools(store, { name: 'DashboardStore' }));

// State change tracking
useStore.subscribe(
  (state) => console.log('State changed:', state),
  (state) => state
);

// Action logging
const logActions = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Action:', args);
      set(...args);
    },
    get,
    api
  );

// Use with Zustand
const useStore = create(logActions(devtools(store)));
```

### Common State Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| State not persisting | Missing persist config | Add persist middleware |
| Stale state | Old closure reference | Use selector function |
| Race condition | Multiple async updates | Implement optimistic updates |
| Memory leak | Unsubscribed listeners | Clean up on unmount |
| State not updating | Immutability violation | Use immutable updates |
| Duplicate state | Multiple stores | Consolidate state |

## Performance Debugging

### Frontend Performance
```javascript
// Component render performance
import { Profiler } from 'react';

<Profiler id="Component" onRender={(id, phase, actualTime) => {
  console.log(`${id} ${phase} took ${actualTime}ms`);
}}>
  <YourComponent />
</Profiler>

// Performance API for timing
const startMark = 'component-render-start';
performance.mark(startMark);

// ... component code ...

const endMark = 'component-render-end';
performance.mark(endMark);
performance.measure('component-render', startMark, endMark);

const measure = performance.getEntriesByName('component-render')[0];
console.log(`Render took ${measure.duration}ms`);
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check for large dependencies
npx vite-plugin-inspect

# Find unused exports
npx unimported
```

### Network Performance
```javascript
// API request timing
const fetchWithTiming = async (url, options = {}) => {
  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - start;
    console.log(`Request to ${url} took ${duration.toFixed(2)}ms`);
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Request to ${url} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

// Resource timing
window.addEventListener('load', () => {
  const resources = performance.getEntriesByType('resource');
  resources.forEach(resource => {
    console.log(`${resource.name}: ${resource.duration.toFixed(2)}ms`);
  });
});
```

### Memory Profiling
```javascript
// Memory usage tracking
const logMemoryUsage = () => {
  if (performance.memory) {
    console.log({
      used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};

// Track memory over time
setInterval(logMemoryUsage, 10000);
```

### Performance Optimization Checklist

| Area | Check | Action |
|------|-------|--------|
| Images | Large file sizes | Compress and use WebP |
| Code | Unused imports | Remove with tree-shaking |
| Bundle | Large vendor chunks | Code splitting |
| Network | Many requests | Combine and cache |
| Rendering | Slow components | Memoize and virtualize |
| State | Frequent updates | Debounce and batch |
| Animations | Janky frames | Use transform/opacity |

## Build/Deploy Debugging

### Environment Variable Checklist
```bash
# Required in Vercel:
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
VITE_API_URL=...

# Optional but recommended:
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Build Debugging
```bash
# TypeScript type checking
npx tsc --noEmit

# Linting
npm run lint
npm run lint:fix

# Build analysis
npm run build
npx vite-bundle-visualizer

# Check for vulnerabilities
npm audit
npm audit fix
```

### Deployment Debugging
```bash
# Vercel logs
vercel logs [url] --follow
vercel logs [url] --limit 50

# Check deployment status
vercel ls
vercel inspect [url]

# Environment variables
vercel env pull .env.local
vercel env ls
```

### Common Build Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails | Type errors | Fix TypeScript errors |
| Bundle too large | Unused dependencies | Remove or code split |
| Env variables missing | Not set in Vercel | Add in project settings |
| CORS errors | Wrong origin | Update CORS config |
| 404 on deploy | Wrong build output | Check vercel.json config |
| Slow build | Large dependencies | Optimize imports |

## Production Debugging

### Error Tracking
```javascript
// Error boundary for React
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
    // trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // trackError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // trackError(event.reason);
});
```

### Monitoring & Logging
```javascript
// Production logging
const logger = {
  info: (message, data = {}) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      // logToService({ level: 'info', message, data });
    } else {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message, error = {}) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      // logToService({ level: 'error', message, error });
    } else {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};
```

### Performance Monitoring
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (metric) => {
  console.log(metric);
  // Send to analytics service
  // analytics.track('Web Vitals', metric);
};

getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

### Production Debugging Checklist

| Area | Check | Action |
|------|-------|--------|
| Errors | Unhandled exceptions | Add error boundaries |
| Performance | Slow load times | Monitor Web Vitals |
| Logging | Missing context | Add structured logging |
| Monitoring | No alerts | Set up error tracking |
| Analytics | User behavior | Track key events |
| Security | Exposed secrets | Audit env variables |

## Debugging Workflow

### Systematic Approach
1. **Reproduce consistently**
   - Document exact steps to reproduce
   - Note environment, browser, and data state
   - Identify if issue is intermittent

2. **Isolate the problem**
   - Narrow down to specific component/module
   - Use binary search (comment out code)
   - Test in isolation (minimal reproduction)

3. **Form hypothesis**
   - List possible causes
   - Prioritize by likelihood
   - Document expected vs actual behavior

4. **Test and fix**
   - Add logging to verify hypothesis
   - Implement minimal fix
   - Verify fix resolves issue

5. **Prevent regression**
   - Add test case
   - Document in code comments
   - Update related documentation

### Debugging Strategies

| Strategy | When to Use | How |
|----------|-------------|-----|
| Binary Search | Large codebase | Comment out half, test, repeat |
| Rubber Ducking | Stuck on problem | Explain to someone/thing |
| Minimal Repro | Complex issue | Create simple test case |
| Divide and Conquer | Systemic issue | Test components in isolation |
| Log Analysis | Production issues | Review logs for patterns |
| Time Travel | State issues | Use Redux DevTools history |

### Quick Reference

```javascript
// Debug mode toggle
const DEBUG = {
  enabled: process.env.NODE_ENV === 'development',
  log: (...args) => DEBUG.enabled && console.log('[DEBUG]', ...args),
  error: (...args) => DEBUG.enabled && console.error('[ERROR]', ...args),
  group: (label) => DEBUG.enabled && console.group(label),
  groupEnd: () => DEBUG.enabled && console.groupEnd(),
};

// Usage
DEBUG.group('Component Render');
DEBUG.log('Props:', props);
DEBUG.log('State:', state);
DEBUG.groupEnd();
```

## Advanced Debugging Techniques

### Source Maps
```javascript
// Enable source maps in production
// vite.config.js
export default {
  build: {
    sourcemap: true, // Enable for production debugging
  },
};
```

### Breakpoint Debugging
```javascript
// Conditional breakpoint
if (condition) {
  debugger; // Execution will pause here
}

// Logpoint (Chrome DevTools)
// Add breakpoint -> Right click -> Edit breakpoint -> Add log expression
```

### Network Debugging
```javascript
// Intercept fetch calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args[0], args[1]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status, response.statusText);
  return response;
};

// Monitor all XHR requests
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  console.log(`XHR: ${method} ${url}`);
  originalOpen.apply(this, arguments);
};
```

### Performance Profiling
```javascript
// Mark important operations
performance.mark('operation-start');
// ... operation ...
performance.mark('operation-end');
performance.measure('operation', 'operation-start', 'operation-end');

// Get all measurements
const measures = performance.getEntriesByType('measure');
measures.forEach(measure => {
  console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
});
```

### Memory Leak Detection
```javascript
// Track component instances
const instances = new Set();

const trackInstance = (component) => {
  instances.add(component);
  console.log(`Instance created. Total: ${instances.size}`);
  return () => {
    instances.delete(component);
    console.log(`Instance destroyed. Total: ${instances.size}`);
  };
};

// Usage in component
useEffect(() => {
  const cleanup = trackInstance('ComponentName');
  return cleanup;
}, []);
```

### Async Debugging
```javascript
// Track async operations
const trackAsync = async (operation, name) => {
  console.log(`[ASYNC] ${name} started`);
  const start = performance.now();
  try {
    const result = await operation;
    const duration = performance.now() - start;
    console.log(`[ASYNC] ${name} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[ASYNC] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

// Usage
const result = await trackAsync(fetchData(), 'fetchData');
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

### 2026-01-17: ESLint Errors Don't Block App Functionality
- **Problem**: 389 lint errors reported, user concerned app might be broken
- **Root Cause**: Most errors are `no-unused-vars`, `Math.random()` in render (react-hooks/purity), and `setState` in useEffect - these don't cause runtime failures
- **Solution**: 
  - Run `npm run lint -- --fix` to auto-fix ~17 issues (prefer-const, etc.)
  - Build still passes with lint errors
  - App runs correctly at runtime
  - Priority fixes: unused imports (easy), then purity issues (wrap in useMemo)
- **Lesson**: Lint errors ≠ runtime errors. Always test in browser before panicking.

### 2026-01-17: Chart Width/Height Warning in Console
- **Problem**: `The width(-1) and height(-1) of chart should be greater than 0`
- **Root Cause**: Recharts components rendering before parent container has calculated dimensions
- **Solution**: Minor issue, doesn't affect functionality. Can fix by wrapping in ResponsiveContainer or adding explicit dimensions.

