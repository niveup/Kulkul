---
name: api-endpoint
description: Industry-grade Vercel serverless API endpoints with comprehensive auth, error handling, validation, caching, and database patterns
---

# API Endpoint Creation Skill

## Overview
Create production-ready Vercel serverless functions with comprehensive error handling, validation, caching, rate limiting, and monitoring for industry-level robustness.

## File Location
- **Standard endpoints**: `api/[name].js` or `api/[name]/route.js`
- **Dynamic routes**: `api/[resource]/[id].js` or `api/[resource]/[id]/route.js`
- **Nested routes**: `api/[resource]/[[...slug]].js`

## Template Structure

### Production-Ready Handler
```javascript
import { withAuth } from './middleware/auth.js';
import { withRateLimit } from './middleware/rateLimit.js';
import { withValidation } from './middleware/validation.js';
import { withCache } from './middleware/cache.js';
import { getDb } from './lib/db.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './lib/errorHandler.js';
import { ObjectId } from 'mongodb';

// Validation schemas
const schema = {
  get: {
    query: {
      page: { type: 'number', min: 1, default: 1 },
      limit: { type: 'number', min: 1, max: 100, default: 10 },
    },
  },
  post: {
    body: {
      name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
      description: { type: 'string', maxLength: 500 },
    },
  },
  put: {
    params: {
      id: { type: 'string', required: true },
    },
    body: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', maxLength: 500 },
    },
  },
  delete: {
    params: {
      id: { type: 'string', required: true },
    },
  },
};

// Route handlers
const handlers = {
  GET: async (req, res, { db, userId, cache }) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `todos:${userId}:${page}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Fetch from database
    const collection = db.collection('todos');
    const [items, total] = await Promise.all([
      collection.find({ userId }).skip(skip).limit(limit).toArray(),
      collection.countDocuments({ userId }),
    ]);

    const response = {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the response
    await cache.set(cacheKey, response, 60); // Cache for 60 seconds

    return res.status(200).json(response);
  },

  POST: async (req, res, { db, userId }) => {
    const { name, description } = req.body;
    const collection = db.collection('todos');

    const result = await collection.insertOne({
      name,
      description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Invalidate related cache
    await cache.invalidatePattern(`todos:${userId}:*`);

    return res.status(201).json({
      _id: result.insertedId,
      name,
      description,
      userId,
    });
  },

  PUT: async (req, res, { db, userId }) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const collection = db.collection('todos');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Invalidate related cache
    await cache.invalidatePattern(`todos:${userId}:*`);

    return res.status(200).json(result.value);
  },

  DELETE: async (req, res, { db, userId }) => {
    const { id } = req.params;
    const collection = db.collection('todos');

    const result = await collection.findOneAndDelete({
      _id: new ObjectId(id),
      userId,
    });

    if (!result.value) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Invalidate related cache
    await cache.invalidatePattern(`todos:${userId}:*`);

    return res.status(200).json({ message: 'Resource deleted' });
  },
};

// Main handler
async function handler(req, res) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || Date.now().toString();

  try {
    // Add request ID to response headers
    res.setHeader('x-request-id', requestId);

    // Get database connection
    const db = await getDb();
    const userId = req.user?.id;

    // Get handler for method
    const methodHandler = handlers[req.method];
    if (!methodHandler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({
        error: `Method ${req.method} not allowed`,
        allowedMethods: Object.keys(handlers),
      });
    }

    // Execute handler with context
    const context = {
      db,
      userId,
      cache: req.cache,
      requestId,
    };

    await methodHandler(req, res, context);

    // Log request completion
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.url,
      status: res.statusCode,
      duration,
      userId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Request failed', {
      requestId,
      method: req.method,
      path: req.url,
      error: error.message,
      stack: error.stack,
      duration,
      userId: req.user?.id,
    });

    return errorHandler(error, req, res);
  }
}

// Apply middleware chain
export default withAuth(
  withRateLimit(
    withValidation(schema)(
      withCache(handler)
    )
  )
);
```

## Auth Patterns

### Authentication Middleware
```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRES_IN = '7d';

export const withAuth = (handler) => {
  return async (req, res) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'];

    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        logger.warn('Missing or invalid authorization header', { requestId });
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_MISSING',
        });
      }

      const token = authHeader.substring(7);

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: [JWT_ALGORITHM],
      });

      // Attach user to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      // Continue to handler
      return await handler(req, res);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Authentication failed', {
        requestId,
        error: error.message,
        duration,
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'TOKEN_INVALID',
        });
      }

      return res.status(500).json({
        error: 'Authentication error',
        code: 'AUTH_ERROR',
      });
    }
  };
};

export const withOptionalAuth = (handler) => {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: [JWT_ALGORITHM],
        });
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      }
      return await handler(req, res);
    } catch (error) {
      // Continue without auth if token is invalid
      return await handler(req, res);
    }
  };
};

export const withRoleAuth = (allowedRoles) => {
  return (handler) => {
    return async (req, res) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_MISSING',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
        });
      }

      return await handler(req, res);
    };
  };
};
```

### Usage Examples
```javascript
// Protected endpoint
import { withAuth } from './middleware/auth.js';
export default withAuth(handler);

// Optional auth endpoint
import { withOptionalAuth } from './middleware/auth.js';
export default withOptionalAuth(handler);

// Role-based auth
import { withAuth, withRoleAuth } from './middleware/auth.js';
export default withAuth(
  withRoleAuth(['admin', 'moderator'])(handler)
);

// Public endpoint
export default handler;
```

## Middleware Implementations

### Rate Limiting Middleware
```javascript
// middleware/rateLimit.js
import { logger } from '../lib/logger.js';

// In-memory rate limit store (for production, use Redis)
const rateLimitStore = new Map();

const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export const withRateLimit = (options = {}) => {
  const config = { ...defaultOptions, ...options };

  return (handler) => {
    return async (req, res) => {
      const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const key = `ratelimit:${identifier}`;
      const now = Date.now();

      // Get current rate limit data
      let data = rateLimitStore.get(key);
      if (!data || data.resetTime <= now) {
        data = {
          count: 0,
          resetTime: now + config.windowMs,
        };
        rateLimitStore.set(key, data);
      }

      // Check if rate limit exceeded
      if (data.count >= config.maxRequests) {
        const resetTime = Math.ceil((data.resetTime - now) / 1000);
        logger.warn('Rate limit exceeded', {
          identifier,
          key,
          resetTime,
        });

        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', resetTime);
        res.setHeader('Retry-After', resetTime);

        return res.status(429).json({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: resetTime,
        });
      }

      // Increment count
      data.count++;
      rateLimitStore.set(key, data);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config.maxRequests - data.count);
      res.setHeader('X-RateLimit-Reset', Math.ceil((data.resetTime - now) / 1000));

      // Execute handler
      const result = await handler(req, res);

      // Optionally decrement count on successful/failed requests
      if (config.skipSuccessfulRequests && res.statusCode < 400) {
        data.count--;
        rateLimitStore.set(key, data);
      } else if (config.skipFailedRequests && res.statusCode >= 400) {
        data.count--;
        rateLimitStore.set(key, data);
      }

      return result;
    };
  };
};

// Custom rate limit for specific routes
export const withStrictRateLimit = () => {
  return withRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // More restrictive
  });
};
```

### Validation Middleware
```javascript
// middleware/validation.js
import { logger } from '../lib/logger.js';

const validateType = (value, schema) => {
  if (schema.type === 'string') {
    if (typeof value !== 'string') return false;
    if (schema.minLength && value.length < schema.minLength) return false;
    if (schema.maxLength && value.length > schema.maxLength) return false;
    return true;
  }

  if (schema.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (schema.min !== undefined && num < schema.min) return false;
    if (schema.max !== undefined && num > schema.max) return false;
    return true;
  }

  if (schema.type === 'boolean') {
    return typeof value === 'boolean';
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) return false;
    if (schema.minLength && value.length < schema.minLength) return false;
    if (schema.maxLength && value.length > schema.maxLength) return false;
    return true;
  }

  if (schema.type === 'object') {
    return typeof value === 'object' && value !== null;
  }

  return false;
};

const validateSchema = (data, schema, location) => {
  const errors = [];

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (fieldSchema.required && value === undefined) {
      errors.push({
        field,
        location,
        message: `Field is required`,
        code: 'REQUIRED_FIELD_MISSING',
      });
      continue;
    }

    // Skip validation for optional undefined fields
    if (value === undefined) continue;

    // Validate type
    if (!validateType(value, fieldSchema)) {
      errors.push({
        field,
        location,
        message: `Invalid ${fieldSchema.type} type`,
        code: 'INVALID_TYPE',
        expected: fieldSchema.type,
        received: typeof value,
      });
    }
  }

  return errors;
};

export const withValidation = (schema) => {
  return (handler) => {
    return async (req, res) => {
      const requestId = req.headers['x-request-id'];
      const errors = [];

      // Validate query parameters
      if (schema[req.method.toLowerCase()]?.query) {
        const queryErrors = validateSchema(
          req.query,
          schema[req.method.toLowerCase()].query,
          'query'
        );
        errors.push(...queryErrors);
      }

      // Validate request body
      if (schema[req.method.toLowerCase()]?.body) {
        const bodyErrors = validateSchema(
          req.body,
          schema[req.method.toLowerCase()].body,
          'body'
        );
        errors.push(...bodyErrors);
      }

      // Validate URL parameters
      if (schema[req.method.toLowerCase()]?.params) {
        const paramsErrors = validateSchema(
          req.params,
          schema[req.method.toLowerCase()].params,
          'params'
        );
        errors.push(...paramsErrors);
      }

      // Return errors if any
      if (errors.length > 0) {
        logger.warn('Validation failed', {
          requestId,
          errors,
          method: req.method,
          path: req.url,
        });

        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors,
        });
      }

      // Apply defaults
      if (schema[req.method.toLowerCase()]?.query) {
        for (const [field, fieldSchema] of Object.entries(
          schema[req.method.toLowerCase()].query
        )) {
          if (fieldSchema.default !== undefined && req.query[field] === undefined) {
            req.query[field] = fieldSchema.default;
          }
        }
      }

      return await handler(req, res);
    };
  };
};
```

### Caching Middleware
```javascript
// middleware/cache.js
import { logger } from '../lib/logger.js';

// In-memory cache (for production, use Redis or Vercel KV)
const cacheStore = new Map();

const defaultOptions = {
  ttl: 60, // Default TTL in seconds
  prefix: 'api',
};

export const withCache = (options = {}) => {
  const config = { ...defaultOptions, ...options };

  return (handler) => {
    return async (req, res) => {
      const requestId = req.headers['x-request-id'];
      const cacheKey = `${config.prefix}:${req.method}:${req.url}`;

      // Attach cache utilities to request
      req.cache = {
        get: async (key) => {
          const cached = cacheStore.get(key);
          if (cached && cached.expires > Date.now()) {
            logger.debug('Cache hit', { key, requestId });
            return cached.data;
          }
          if (cached) {
            cacheStore.delete(key);
          }
          logger.debug('Cache miss', { key, requestId });
          return null;
        },
        set: async (key, data, ttl = config.ttl) => {
          cacheStore.set(key, {
            data,
            expires: Date.now() + ttl * 1000,
          });
          logger.debug('Cache set', { key, ttl, requestId });
        },
        invalidate: async (key) => {
          cacheStore.delete(key);
          logger.debug('Cache invalidated', { key, requestId });
        },
        invalidatePattern: async (pattern) => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          for (const key of cacheStore.keys()) {
            if (regex.test(key)) {
              cacheStore.delete(key);
            }
          }
          logger.debug('Cache pattern invalidated', { pattern, requestId });
        },
      };

      return await handler(req, res);
    };
  };
};
```

### Error Handler
```javascript
// lib/errorHandler.js
import { logger } from './logger.js';

export const errorHandler = (error, req, res) => {
  const requestId = req.headers['x-request-id'];

  // Log error
  logger.error('API Error', {
    requestId,
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.url,
    userId: req.user?.id,
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: error.errors,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND',
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'FORBIDDEN',
    });
  }

  if (error.name === 'ConflictError') {
    return res.status(409).json({
      error: 'Resource conflict',
      code: 'CONFLICT',
    });
  }

  // Generic error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && {
      message: error.message,
      stack: error.stack,
    }),
  });
};
```

### Logger
```javascript
// lib/logger.js
export const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  warn: (message, data = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message, data = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        message,
        ...data,
        timestamp: new Date().toISOString(),
      }));
    }
  },
};
```

## Database Operations

### Connection Management
```javascript
// lib/db.js
import { MongoClient } from 'mongodb';
import { logger } from './logger.js';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'dashboard';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let client = null;
let db = null;

export const getDb = async () => {
  // Return existing connection if available
  if (db) {
    return db;
  }

  try {
    // Create new connection
    client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10, // Maximum pool size
      minPoolSize: 2,  // Minimum pool size
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    db = client.db(DB_NAME);
    logger.info('Connected to MongoDB', { DB_NAME });

    return db;
  } catch (error) {
    logger.error('MongoDB connection error', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const closeDb = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
};
```

### CRUD Operations
```javascript
import { getDb } from './lib/db.js';
import { ObjectId } from 'mongodb';

const db = await getDb();
const collection = db.collection('todos');

// Find all for user with pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const [items, total] = await Promise.all([
  collection.find({ userId }).skip(skip).limit(limit).toArray(),
  collection.countDocuments({ userId }),
]);

// Insert with timestamps
const result = await collection.insertOne({
  ...data,
  userId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Update with partial updates
const result = await collection.findOneAndUpdate(
  { _id: new ObjectId(id), userId },
  { $set: { ...updates, updatedAt: new Date() } },
  { returnDocument: 'after' }
);

// Delete
const result = await collection.findOneAndDelete({
  _id: new ObjectId(id),
  userId,
});

// Aggregation pipeline
const pipeline = [
  { $match: { userId } },
  { $sort: { createdAt: -1 } },
  { $limit: limit },
  { $skip: skip },
];

const items = await collection.aggregate(pipeline).toArray();

// Transaction (for multiple operations)
const session = await db.startSession();
try {
  await session.withTransaction(async () => {
    await collection.insertOne({ ...data1 }, { session });
    await collection.updateOne({ _id: id }, { $set: updates }, { session });
  });
} finally {
  await session.endSession();
}
```

## Error Responses
```javascript
res.status(400).json({ error: 'Missing required field: name' });
res.status(401).json({ error: 'Authentication required' });
res.status(403).json({ error: 'Access denied' });
res.status(404).json({ error: 'Resource not found' });
res.status(500).json({ error: 'Internal server error' });
```

## Checklist
- [ ] CORS headers configured
- [ ] OPTIONS preflight handled
- [ ] Auth middleware applied appropriately
- [ ] Database operations use `userId` for isolation
- [ ] Proper error responses with status codes

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
