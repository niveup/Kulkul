# Personal Dashboard - Billion Dollar Backend APIs

## Overview

This document describes the enterprise-grade backend APIs that power the Personal Dashboard application.

## Table of Contents

1. [Analytics API](#analytics-api)
2. [Session Manager API](#session-manager-api)
3. [Task Prioritizer API](#task-prioritizer-api)
4. [Performance API](#performance-api)
5. [Sync API](#sync-api)
6. [Security API](#security-api)

---

## Analytics API

### Endpoint
`GET /api/analytics`

### Description
Provides comprehensive analytics and insights about user productivity.

### Query Parameters
- `range` (optional): Time range for analytics. Options: `7d`, `30d` (default), `90d`, `all`

### Response
```json
{
  "productivityScore": 85,
  "currentStreak": 7,
  "weeklyTrend": 15,
  "completionRate": 90,
  "totalFocusMinutes": 450,
  "avgSessionLength": 30,
  "dailyFocusTime": {},
  "recommendations": [],
  "timeRange": "30d",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Session Manager API

### Endpoint
`GET /api/session-manager`

### Description
Provides intelligent session management with smart recommendations.

### Response
```json
{
  "patterns": {
    "bestTimeOfDay": 9,
    "bestDayOfWeek": 2,
    "avgSessionLength": 30,
    "completionRate": 85
  },
  "recommendations": {
    "sessionLength": 45,
    "breakTime": 9,
    "nextOptimalTime": "2024-01-02T09:00:00.000Z"
  },
  "insights": [],
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Task Prioritizer API

### Endpoint
`GET /api/task-prioritizer`

### Description
Intelligently prioritizes tasks based on multiple factors.

### Response
```json
{
  "categorized": {
    "urgent": [],
    "high": [],
    "medium": [],
    "low": []
  },
  "recommendations": [],
  "stats": {
    "total": 20,
    "completed": 12,
    "pending": 8,
    "completionRate": 60
  },
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Performance API

### Endpoint
`GET /api/performance`

### Description
Analyzes user performance metrics and provides optimization recommendations.

### Response
```json
{
  "metrics": {
    "responseTime": {},
    "completionRate": 85,
    "streak": {
      "current": 7,
      "longest": 14,
      "average": 5
    }
  },
  "bottlenecks": [],
  "recommendations": [],
  "performanceScore": 78,
  "thresholds": {},
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Sync API

### Endpoint
`GET /api/sync` or `POST /api/sync`

### Description
Handles cross-device data synchronization with conflict resolution.

### GET Request Parameters
- `lastSyncTime` (optional): Timestamp of last sync

### POST Request Body
```json
{
  "clientTime": 1704067200000,
  "lastSyncTime": 1703980800000,
  "operations": [],
  "fullSync": false
}
```

### Response
```json
{
  "version": "1.0",
  "serverTime": 1704067200000,
  "data": {
    "sessions": [],
    "todos": [],
    "activeTimer": null
  },
  "syncQueue": [],
  "requiresFullSync": false
}
```

---

## Security API

### Endpoint
`GET /api/security` or `POST /api/security`

### Description
Provides security monitoring, threat detection, and session management.

### GET Request Parameters
- `range` (optional): Time range for security events. Options: `1h`, `24h` (default), `7d`, `30d`

### POST Request Body
```json
{
  "action": "log_event",
  "details": {
    "eventType": "LOGIN_SUCCESS"
  }
}
```

### Response
```json
{
  "metrics": {
    "totalEvents": 50,
    "failedLogins": 3,
    "successfulLogins": 47,
    "uniqueIPs": 2,
    "activeSessions": 1,
    "threatLevel": 1
  },
  "threatLevel": {
    "level": 1,
    "label": "low",
    "color": "green"
  },
  "suspiciousActivity": [],
  "recommendations": [],
  "timeRange": "24h",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Integration Guide

### Example: Fetching Analytics

```javascript
const response = await fetch('/api/analytics?range=30d');
const data = await response.json();
console.log('Productivity Score:', data.productivityScore);
```

### Example: Getting Session Recommendations

```javascript
const response = await fetch('/api/session-manager');
const data = await response.json();
console.log('Recommended Session Length:', data.recommendations.sessionLength);
```

### Example: Syncing Data

```javascript
const response = await fetch('/api/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientTime: Date.now(),
    lastSyncTime: lastSyncTimestamp,
    operations: syncOperations,
    fullSync: false
  })
});
const data = await response.json();
```
