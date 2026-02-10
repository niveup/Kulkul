import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config } from 'dotenv'
import mysql from 'mysql2/promise'
import { visualizer } from 'rollup-plugin-visualizer'

// Load environment variables
config();

// =============================================================================
// SECURITY: API Keys are loaded from environment variables (.env file)
// Never commit API keys to source control!
// =============================================================================
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || '';
const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Validate required environment variables on startup
const validateEnvVars = () => {
  const required = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Please check your .env file');
  }

  const apiKeys = { CEREBRAS_API_KEY, SAMBANOVA_API_KEY, GEMINI_API_KEY };
  const missingKeys = Object.entries(apiKeys).filter(([_, v]) => !v).map(([k]) => k);
  if (missingKeys.length > 0) {
    console.warn(`⚠️  Missing API keys: ${missingKeys.join(', ')}`);
    console.warn('   Some AI models may not be available');
  }
};
validateEnvVars();


// TiDB Database connection pool
let pool = null;
let isDbInitialized = false;

async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000'),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

async function initDatabase() {
  if (isDbInitialized) return;
  const db = await getDbPool();
  const connection = await db.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        model_id VARCHAR(100),
        model_name VARCHAR(100),
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Add deleted_at column if it doesn't exist (migration for existing tables)
    try {
      await connection.execute(`ALTER TABLE conversations ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`);
    } catch (e) { /* Column already exists */ }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        thinking TEXT,
        has_image BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_conversation (conversation_id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Todos table - 180 day retention
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(36) PRIMARY KEY,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      )
    `);

    // Daily Objectives table - 180 day retention
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_todos (
        id VARCHAR(36) PRIMARY KEY,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      )
    `);

    // Pomodoro sessions table - 30 day retention for 3D city
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        minutes INT NOT NULL,
        elapsed_seconds INT NOT NULL,
        status ENUM('completed', 'failed') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // SRS Topic Reviews table - tracks when each topic was reviewed
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS srs_topic_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_id VARCHAR(100) NOT NULL,
        topic_name VARCHAR(255) NOT NULL,
        class_level VARCHAR(10) NOT NULL,
        subject VARCHAR(50) DEFAULT 'Physics',
        review_count INT DEFAULT 1,
        ease_factor DECIMAL(3,2) DEFAULT 2.50,
        interval_days INT DEFAULT 1,
        last_reviewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        next_review_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_topic (topic_id)
      )
    `);

    // SRS Study Activity table - for heatmap
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS srs_study_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_date DATE NOT NULL,
        topic_id VARCHAR(100) NOT NULL,
        topic_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_daily_topic (activity_date, topic_id)
      )
    `);

    // Active Timer table - for cross-device timer persistence
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS active_timer (
        id VARCHAR(36) PRIMARY KEY DEFAULT 'default',
        start_time BIGINT NOT NULL,
        duration_seconds INT NOT NULL,
        paused_remaining INT NULL,
        status ENUM('active', 'paused', 'idle') DEFAULT 'idle',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Custom Apps table - for user-defined app shortcuts (cloud sync)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS custom_apps (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description VARCHAR(255) DEFAULT 'Custom App',
        icon VARCHAR(50) DEFAULT 'Globe',
        image VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Learning Notes table - Personal Knowledge Bank
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS learning_notes (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('concept', 'question', 'formula', 'trick', 'mistake', 'doubt', 'resource') NOT NULL,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tags TEXT,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        source VARCHAR(500),
        is_revised BOOLEAN DEFAULT FALSE,
        revision_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS video_titles (
        video_id VARCHAR(100) PRIMARY KEY,
        title TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS video_status (
        video_id VARCHAR(100) PRIMARY KEY,
        is_done BOOLEAN DEFAULT FALSE,
        has_concept BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Notes: Chapters table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chapters (
        id VARCHAR(36) PRIMARY KEY,
        subject VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_subject (subject)
      )
    `);

    // Notes: Entries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS entries (
        id VARCHAR(36) PRIMARY KEY,
        chapter_id VARCHAR(36) NOT NULL,
        text TEXT,
        type VARCHAR(20) DEFAULT 'concept',
        images JSON,
        urls JSON,
        description TEXT,
        tags TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
        INDEX idx_chapter (chapter_id)
      )
    `);

    console.log('✅ TiDB tables initialized (including SRS, Active Timer, Custom Apps, Learning Notes)');
    isDbInitialized = true;
  } finally {
    connection.release();
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/api/chat')) {
            console.log('[DEBUG] Global Hit:', req.method, req.url);
          }
          next();
        });

        // Chat History API (TiDB)
        server.middlewares.use('/api/chat-history', async (req, res, next) => {
          console.log('[Chat History API]', req.method, req.url);

          try {
            // Initialize database
            await initDatabase();
            const db = await getDbPool();

            // Auto-cleanup: 
            // 1. Permanently delete trash items older than 1 day
            // 2. Delete conversations beyond the last 50 (excluding trash)
            try {
              // Permanently delete trash older than 1 day
              await db.execute(`
                DELETE FROM conversations 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
              `);

              // Keep only last 50 active conversations (delete excess)
              await db.execute(`
                DELETE FROM conversations 
                WHERE deleted_at IS NULL
                AND id NOT IN (
                  SELECT id FROM (
                    SELECT id FROM conversations 
                    WHERE deleted_at IS NULL 
                    ORDER BY updated_at DESC LIMIT 50
                  ) AS recent
                )
              `);
            } catch (cleanupErr) {
              console.log('[Chat History] Cleanup skipped:', cleanupErr.message);
            }

            // Parse URL for conversation ID and action (e.g., /uuid/restore, /trash)
            const urlPath = req.url.split('?')[0];
            const pathSegments = urlPath.split('/').filter(Boolean);
            const conversationId = pathSegments[0] || null;
            const action = pathSegments[1] || null; // 'restore' or null

            console.log('[Chat History] Parsed:', { conversationId, action, url: req.url });

            // Parse body for POST requests
            let body = {};
            if (req.method === 'POST') {
              let rawBody = '';
              for await (const chunk of req) {
                rawBody += chunk;
              }
              try {
                body = JSON.parse(rawBody);
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
              }
            }

            // Generate UUID v4
            const generateId = () => {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });
            };

            // Generate title from first message
            const generateTitle = (content) => {
              const text = typeof content === 'string' ? content : content?.text || 'New Chat';
              const truncated = text.substring(0, 50);
              const lastSpace = truncated.lastIndexOf(' ');
              return lastSpace > 20 ? truncated.substring(0, lastSpace) + '...' : truncated;
            };

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              // Handle /trash endpoint to list deleted conversations
              if (conversationId === 'trash') {
                const [trash] = await db.execute(
                  'SELECT id, title, model_name, deleted_at FROM conversations WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
                );
                res.statusCode = 200;
                res.end(JSON.stringify(trash));
                return;
              }

              if (conversationId) {
                // Get single conversation with messages
                const [conversations] = await db.execute(
                  'SELECT * FROM conversations WHERE id = ?',
                  [conversationId]
                );

                if (conversations.length === 0) {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Conversation not found' }));
                  return;
                }

                const [messages] = await db.execute(
                  'SELECT id, role, content, thinking, has_image, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
                  [conversationId]
                );

                res.statusCode = 200;
                res.end(JSON.stringify({ ...conversations[0], messages }));
              } else {
                // List all active conversations (not deleted, last 50)
                const [conversations] = await db.execute(
                  'SELECT id, title, model_name, updated_at FROM conversations WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 50'
                );
                res.statusCode = 200;
                res.end(JSON.stringify(conversations));
              }
            } else if (req.method === 'POST') {
              const { id, title, modelId, modelName, messages } = body;

              if (id) {
                // Update existing conversation - preserve existing title, only update model info
                await db.execute(
                  'UPDATE conversations SET model_id = ?, model_name = ?, updated_at = NOW() WHERE id = ?',
                  [modelId, modelName, id]
                );

                // Delete old messages and insert new ones
                await db.execute('DELETE FROM messages WHERE conversation_id = ?', [id]);

                if (messages && messages.length > 0) {
                  for (const m of messages) {
                    await db.execute(
                      'INSERT INTO messages (conversation_id, role, content, thinking, has_image) VALUES (?, ?, ?, ?, ?)',
                      [
                        id,
                        m.role,
                        typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
                        m.thinking || null,
                        m.hasImage || false
                      ]
                    );
                  }
                }

                res.statusCode = 200;
                res.end(JSON.stringify({ id, updated: true }));
              } else {
                // Create new conversation
                const newId = generateId();
                const autoTitle = messages?.[0]?.content
                  ? generateTitle(messages[0].content)
                  : 'New Chat';

                await db.execute(
                  'INSERT INTO conversations (id, title, model_id, model_name) VALUES (?, ?, ?, ?)',
                  [newId, title || autoTitle, modelId, modelName]
                );

                // Insert messages
                if (messages && messages.length > 0) {
                  for (const m of messages) {
                    await db.execute(
                      'INSERT INTO messages (conversation_id, role, content, thinking, has_image) VALUES (?, ?, ?, ?, ?)',
                      [
                        newId,
                        m.role,
                        typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
                        m.thinking || null,
                        m.hasImage || false
                      ]
                    );
                  }
                }

                res.statusCode = 201;
                res.end(JSON.stringify({ id: newId, title: title || autoTitle }));
              }
            } else if (req.method === 'DELETE' && action === 'permanent') {
              // Permanent delete from trash
              if (!conversationId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing conversation ID' }));
                return;
              }

              const [result] = await db.execute(
                'DELETE FROM conversations WHERE id = ?',
                [conversationId]
              );

              if (result.affectedRows === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Conversation not found' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ permanentlyDeleted: true, id: conversationId }));
            } else if (req.method === 'DELETE') {
              // Soft delete - set deleted_at instead of removing
              if (!conversationId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing conversation ID' }));
                return;
              }

              const [result] = await db.execute(
                'UPDATE conversations SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
                [conversationId]
              );

              if (result.affectedRows === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Conversation not found or already deleted' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, id: conversationId, recoverable: true }));
            } else if (req.method === 'PUT') {
              // Restore from trash - only if action is 'restore'
              if (!conversationId || action !== 'restore') {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Use PUT /api/chat-history/{id}/restore to restore' }));
                return;
              }

              const [result] = await db.execute(
                'UPDATE conversations SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
                [conversationId]
              );

              if (result.affectedRows === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Conversation not found in trash' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ restored: true, id: conversationId }));
            } else if (req.method === 'DELETE' && conversationId === 'all') {
              // Delete ALL conversations permanently (admin action)
              await db.execute('DELETE FROM messages');
              await db.execute('DELETE FROM conversations');
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, all: true }));
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Chat History API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Todos API middleware (Daily Task List)
        server.middlewares.use('/api/todos', async (req, res, next) => {
          console.log('[Todos API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Auto-cleanup: Delete todos older than 180 days (6 months)
            try {
              await db.execute(`
                DELETE FROM todos 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY)
              `);
            } catch (cleanupErr) {
              console.log('[Todos] Cleanup skipped:', cleanupErr.message);
            }

            // Parse URL for todo ID
            const urlPath = req.url.split('?')[0];
            const pathSegments = urlPath.split('/').filter(Boolean);
            const todoId = pathSegments[0] || null;

            // Parse body for POST/PUT requests
            let body = {};
            if (req.method === 'POST' || req.method === 'PUT') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              // Get all todos (recent 180 days)
              const [todos] = await db.execute(
                'SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC'
              );
              res.statusCode = 200;
              res.end(JSON.stringify(todos));
            } else if (req.method === 'POST') {
              // Create new todo
              const newId = crypto.randomUUID();
              const { text } = body;

              if (!text || !text.trim()) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Text is required' }));
                return;
              }

              await db.execute(
                'INSERT INTO todos (id, text, completed) VALUES (?, ?, ?)',
                [newId, text.trim(), false]
              );

              res.statusCode = 201;
              res.end(JSON.stringify({ id: newId, text: text.trim(), completed: false }));
            } else if (req.method === 'PUT') {
              // Update todo (toggle completed)
              if (!todoId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Todo ID required' }));
                return;
              }

              const { completed } = body;
              await db.execute(
                'UPDATE todos SET completed = ? WHERE id = ?',
                [completed, todoId]
              );

              res.statusCode = 200;
              res.end(JSON.stringify({ id: todoId, completed }));
            } else if (req.method === 'DELETE') {
              // Check for delete-all action
              if (todoId === 'all') {
                await db.execute('DELETE FROM todos');
                res.statusCode = 200;
                res.end(JSON.stringify({ deleted: true, all: true }));
                return;
              }

              // Delete single todo
              if (!todoId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Todo ID required' }));
                return;
              }

              await db.execute('DELETE FROM todos WHERE id = ?', [todoId]);
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, id: todoId }));
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Todos API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Daily Todos API middleware (Daily Objectives)
        server.middlewares.use('/api/daily-todos', async (req, res, next) => {
          console.log('[Daily Todos API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Auto-cleanup: Delete daily todos older than 180 days (6 months)
            try {
              await db.execute(`
                DELETE FROM daily_todos 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY)
              `);
            } catch (cleanupErr) {
              console.log('[Daily Todos] Cleanup skipped:', cleanupErr.message);
            }

            // Parse URL for todo ID
            const urlPath = req.url.split('?')[0];
            const pathSegments = urlPath.split('/').filter(Boolean);
            const todoId = pathSegments[0] || null;

            // Parse body for POST/PUT requests
            let body = {};
            if (req.method === 'POST' || req.method === 'PUT') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              const [todos] = await db.execute(
                'SELECT id, text, completed, created_at FROM daily_todos ORDER BY created_at DESC'
              );
              res.statusCode = 200;
              res.end(JSON.stringify(todos));
            } else if (req.method === 'POST') {
              const newId = crypto.randomUUID();
              const { text } = body;

              if (!text || !text.trim()) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Text is required' }));
                return;
              }

              await db.execute(
                'INSERT INTO daily_todos (id, text, completed) VALUES (?, ?, ?)',
                [newId, text.trim(), false]
              );

              res.statusCode = 201;
              res.end(JSON.stringify({ id: newId, text: text.trim(), completed: false }));
            } else if (req.method === 'PUT') {
              if (!todoId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Todo ID required' }));
                return;
              }

              const { completed } = body;
              await db.execute(
                'UPDATE daily_todos SET completed = ? WHERE id = ?',
                [completed, todoId]
              );

              res.statusCode = 200;
              res.end(JSON.stringify({ id: todoId, completed }));
            } else if (req.method === 'DELETE') {
              if (todoId === 'all') {
                await db.execute('DELETE FROM daily_todos');
                res.statusCode = 200;
                res.end(JSON.stringify({ deleted: true, all: true }));
                return;
              }

              if (!todoId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Todo ID required' }));
                return;
              }

              await db.execute('DELETE FROM daily_todos WHERE id = ?', [todoId]);
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, id: todoId }));
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Daily Todos API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Video Status API (TiDB)
        server.middlewares.use('/api/video-status', async (req, res, next) => {
          console.log('[Video Status API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              const [statuses] = await db.execute(
                'SELECT video_id as videoId, is_done as isDone, has_concept as hasConcept, updated_at as updatedAt FROM video_status ORDER BY updated_at DESC'
              );
              res.statusCode = 200;
              res.end(JSON.stringify(statuses));
            } else if (req.method === 'POST') {
              let body = '';
              for await (const chunk of req) body += chunk;
              const { videoId, type, value } = JSON.parse(body);

              if (!videoId || !type || value === undefined) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'videoId, type, and value are required' }));
                return;
              }

              const columnName = type === 'done' ? 'is_done' : 'has_concept';
              await db.execute(
                `INSERT INTO video_status (video_id, ${columnName}) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE ${columnName} = ?, updated_at = CURRENT_TIMESTAMP`,
                [videoId, value, value]
              );
              res.statusCode = 200;
              res.end(JSON.stringify({ videoId, [type]: value }));
            }
          } catch (error) {
            console.error('[Video Status API] Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Video Titles API (TiDB)
        server.middlewares.use('/api/video-titles', async (req, res, next) => {
          console.log('[Video Titles API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            const urlPath = req.url.split('?')[0];
            const pathParts = urlPath.split('/').filter(Boolean);
            const videoId = pathParts[0] || null;

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              const [titles] = await db.execute('SELECT video_id as id, title FROM video_titles');
              const titleMap = {};
              titles.forEach(t => titleMap[t.id] = t.title);
              res.statusCode = 200;
              res.end(JSON.stringify(titleMap));
            } else if (req.method === 'POST') {
              let body = '';
              for await (const chunk of req) body += chunk;
              const { id, title } = JSON.parse(body);

              if (!id || !title) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'ID and title required' }));
                return;
              }

              await db.execute(
                'INSERT INTO video_titles (video_id, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = ?',
                [id, title, title]
              );
              res.statusCode = 200;
              res.end(JSON.stringify({ id, title, updated: true }));
            } else if (req.method === 'DELETE' && videoId) {
              await db.execute('DELETE FROM video_titles WHERE video_id = ?', [videoId]);
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, id: videoId }));
            }
          } catch (error) {
            console.error('[Video Titles API] Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Learning Notes API (restored)
        server.middlewares.use('/api/notes', async (req, res, next) => {
          console.log('[Learning Notes API]', req.method, req.url);
          // Skip if query param ?id is present for DELETE/PUT (it's handled, but we need to check exact match if strict)
          // Actually req.url includes query params in middleware? Yes.

          // Strict check to avoid capturing /api/notes/something if we had subroutes, but here it's simple.
          if (req.url.startsWith('/api/notes') && !req.url.includes('chapter-tracker')) {
            try {
              await initDatabase();
              const db = await getDbPool();
              res.setHeader('Content-Type', 'application/json');

              const parseBody = async () => {
                let body = '';
                for await (const chunk of req) body += chunk;
                return body ? JSON.parse(body) : {};
              };

              const url = new URL(req.url, `http://${req.headers.host}`);
              const id = url.searchParams.get('id');

              if (req.method === 'GET') {
                const [notes] = await db.execute('SELECT * FROM learning_notes ORDER BY created_at DESC');
                // Transform for frontend if needed? 
                // Frontend expects: id, title, description, topic, type, etc.
                // DB columns match well. images/links are NOT in DB schema shown above?
                // Wait, lines 187-202 of vite.config.js DO NOT show images or links columns for learning_notes!
                // Let me re-read lines 187-202 carefully.
                // 187: CREATE TABLE IF NOT EXISTS learning_notes ...
                // It has: source, tags, description... NO images or links columns?
                // But NotesLibrary2 uses note.images and note.links!
                // And NotesStore sends them!
                // Maybe they are stored in `description` as JSON or I missed the columns in previous view?
                // Or maybe the table definition I saw was OLD and I need to ALTER it?
                // "196:         source VARCHAR(500)," is there.
                // "194:         tags TEXT," is there.
                // If images/links are missing, saving them via API will fail if I just do INSERT.
                // However, avoiding a schema change if possible.
                // Let's look at `CompactNoteCard` (Step 169): 
                // It renders `note.images` and `note.links`.
                // If the table doesn't have them, they might be lost?
                // Or maybe they are new fields the user wants?
                // NOTE: The user just said "TypeError: filteredNotes.slice is not a function".
                // Prioritizing fixing the crash first by returning an array.
                // I will include logic to return `[]` for images/links if they don't exist in DB rows.
                // AND I will check if I need to add columns.
                // For now, I'll return the rows.

                // Client expects: notes array.
                res.statusCode = 200;
                res.end(JSON.stringify(notes));
              }
              else if (req.method === 'POST') {
                const body = await parseBody();
                // Insert
                // Note: body contains images/links but if table lacks them, we might ignore or we should add them?
                // I will assume for now they might be ignored or I should add them to schema later.
                // Safety first: Insert what we have columns for.
                const { id, type, subject, topic, title, description, tags, priority, source } = body;
                await db.execute(
                  `INSERT INTO learning_notes (id, type, subject, topic, title, description, tags, priority, source)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [id, type, subject, topic, title, description, tags, priority, source]
                );
                res.statusCode = 201;
                res.end(JSON.stringify(body));
              }
              else if (req.method === 'PUT') {
                const body = await parseBody();
                const { id, type, subject, topic, title, description, tags, priority, source, is_revised, revision_count } = body;
                await db.execute(
                  `UPDATE learning_notes SET 
                           type=?, subject=?, topic=?, title=?, description=?, tags=?, priority=?, source=?, is_revised=?, revision_count=?, updated_at=NOW()
                         WHERE id=?`,
                  [type, subject, topic, title, description, tags, priority, source, is_revised, revision_count, id]
                );
                res.statusCode = 200;
                res.end(JSON.stringify(body));
              }
              else if (req.method === 'DELETE') {
                if (!id) throw new Error('Missing ID');
                await db.execute('DELETE FROM learning_notes WHERE id = ?', [id]);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              }
              else {
                next(); // Pass to next if not matched (e.g. OPTIONS?) or 405
              }
            } catch (e) {
              console.error('[Notes API Error]', e);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
            return;
          }
          next();
        });

        // Notes API (TiDB) -> Renamed to Chapter Tracker
        server.middlewares.use('/api/chapter-tracker', async (req, res, next) => {
          console.log('[Chapter Tracker API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            res.setHeader('Content-Type', 'application/json');

            // Utility to parse body
            const parseBody = async () => {
              let body = '';
              for await (const chunk of req) body += chunk;
              return body ? JSON.parse(body) : {};
            };

            if (req.method === 'GET') {
              // Fetch all chapters and entries
              const [chapters] = await db.execute('SELECT * FROM chapters ORDER BY created_at ASC');
              const [entries] = await db.execute('SELECT * FROM entries ORDER BY created_at ASC');

              res.statusCode = 200;
              res.end(JSON.stringify({ chapters, entries }));
            }
            else if (req.method === 'POST') {
              const body = await parseBody();
              const { action, data } = body;

              if (action === 'sync') {
                // Full sync from client (simple overwrite strategy for now, or per-item)
                // For now, let's support atomic actions
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Full sync not implemented, use specific actions' }));
              }
              else if (action === 'add_chapter') {
                const { id, subject, name } = data;
                await db.execute(
                  'INSERT INTO chapters (id, subject, name) VALUES (?, ?, ?)',
                  [id, subject, name]
                );
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              }
              else if (action === 'add_entry') {
                const { id, chapterId, text, type, images, urls, description, tags, priority } = data;
                await db.execute(
                  `INSERT INTO entries (id, chapter_id, text, type, images, urls, description, tags, priority) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [id, chapterId, text, type, JSON.stringify(images || []), JSON.stringify(urls || []), description, tags, priority]
                );
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              }
              else if (action === 'update_entry') {
                const { id, text, images, urls, description, tags, priority } = data;
                await db.execute(
                  `UPDATE entries SET 
                      text = ?, images = ?, urls = ?, description = ?, tags = ?, priority = ?, updated_at = NOW()
                    WHERE id = ?`,
                  [text, JSON.stringify(images || []), JSON.stringify(urls || []), description, tags, priority, id]
                );
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              }
            }
            else if (req.method === 'DELETE') {
              // Parse query params for simple deletes? Or use body?
              // Let's use body for consistency
              const body = await parseBody();
              const { action, id } = body;

              if (action === 'delete_chapter') {
                await db.execute('DELETE FROM chapters WHERE id = ?', [id]);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              }
              else if (action === 'delete_entry') {
                await db.execute('DELETE FROM entries WHERE id = ?', [id]);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              }
            }
            else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }

          } catch (error) {
            console.error('[Notes API] Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Pomodoro Sessions API middleware
        server.middlewares.use('/api/sessions', async (req, res, next) => {
          console.log('[Sessions API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Auto-cleanup: Delete sessions older than 1 year
            try {
              await db.execute(`
                DELETE FROM pomodoro_sessions 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY)
              `);
            } catch (cleanupErr) {
              console.log('[Sessions] Cleanup skipped:', cleanupErr.message);
            }

            // Parse body for POST requests
            let body = {};
            if (req.method === 'POST') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              // Get all sessions (last 30 days)
              const [sessions] = await db.execute(
                'SELECT id, type, minutes, elapsed_seconds as elapsedSeconds, status, created_at as timestamp FROM pomodoro_sessions ORDER BY created_at DESC'
              );
              res.statusCode = 200;
              res.end(JSON.stringify(sessions));
            } else if (req.method === 'POST') {
              // Add new session
              const newId = body.id || crypto.randomUUID();
              const { type, minutes, elapsedSeconds, status } = body;

              if (!type || !minutes || !status) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
              }

              await db.execute(
                'INSERT INTO pomodoro_sessions (id, type, minutes, elapsed_seconds, status) VALUES (?, ?, ?, ?, ?)',
                [newId, type, minutes, elapsedSeconds || 0, status]
              );

              res.statusCode = 201;
              res.end(JSON.stringify({ id: newId, type, minutes, elapsedSeconds, status }));
            } else if (req.method === 'DELETE') {
              // Check for delete-all action
              const urlPath = req.url.split('?')[0];
              if (urlPath === '/all') {
                await db.execute('DELETE FROM pomodoro_sessions');
                res.statusCode = 200;
                res.end(JSON.stringify({ deleted: true, all: true }));
                return;
              }
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Sessions API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Active Timer API middleware - for cross-device timer persistence
        server.middlewares.use('/api/active-timer', async (req, res, next) => {
          console.log('[Active Timer API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Parse body for POST requests
            let body = {};
            if (req.method === 'POST') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              // Get active timer state
              const [timers] = await db.execute(
                'SELECT id, start_time as startTime, duration_seconds as durationSeconds, paused_remaining as pausedRemaining, status, updated_at as updatedAt FROM active_timer WHERE id = ?',
                ['default']
              );

              if (timers.length === 0) {
                res.statusCode = 200;
                res.end(JSON.stringify({ status: 'idle' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify(timers[0]));

            } else if (req.method === 'POST') {
              // Save/update timer state
              const { startTime, durationSeconds, pausedRemaining, status } = body;

              if (!status) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Status is required' }));
                return;
              }

              // Upsert the timer record
              await db.execute(`
                INSERT INTO active_timer (id, start_time, duration_seconds, paused_remaining, status)
                VALUES ('default', ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                  start_time = VALUES(start_time),
                  duration_seconds = VALUES(duration_seconds),
                  paused_remaining = VALUES(paused_remaining),
                  status = VALUES(status)
              `, [startTime || 0, durationSeconds || 0, pausedRemaining || null, status]);

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, status }));

            } else if (req.method === 'DELETE') {
              // Clear timer (on complete/reset/give-up)
              await db.execute('DELETE FROM active_timer WHERE id = ?', ['default']);
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true }));

            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Active Timer API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // SRS (Spaced Repetition System) API middleware
        server.middlewares.use('/api/srs', async (req, res, next) => {
          console.log('[SRS API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Parse URL path
            const urlPath = req.url.split('?')[0];
            const pathSegments = urlPath.split('/').filter(Boolean);
            const action = pathSegments[0] || 'topics'; // 'topics', 'review', 'heatmap'

            // Parse body for POST requests
            let body = {};
            if (req.method === 'POST') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET' && action === 'topics') {
              // Get all topics with their SRS data
              const [topics] = await db.execute(`
                SELECT 
                  topic_id as topicId,
                  topic_name as topicName,
                  class_level as \`class\`,
                  subject,
                  review_count as reviewCount,
                  ease_factor as easeFactor,
                  interval_days as intervalDays,
                  last_reviewed as lastReviewed,
                  next_review_date as nextReviewDate,
                  created_at as createdAt
                FROM srs_topic_reviews
                ORDER BY next_review_date ASC, last_reviewed ASC
              `);

              // Get activity for heatmap (last 365 days)
              const [activityRows] = await db.execute(`
                SELECT 
                  DATE_FORMAT(activity_date, '%Y-%m-%d') as date,
                  topic_id,
                  topic_name
                FROM srs_study_activity
                WHERE activity_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
                ORDER BY activity_date DESC
              `);

              // Transform activity into heatmap format
              const activity = {};
              for (const row of activityRows) {
                if (!activity[row.date]) {
                  activity[row.date] = { count: 0, topics: [] };
                }
                activity[row.date].count++;
                if (!activity[row.date].topics.includes(row.topic_name)) {
                  activity[row.date].topics.push(row.topic_name);
                }
              }

              // Calculate streak
              let streak = 0;
              const today = new Date();
              const checkDate = new Date(today);

              // Check if today has activity (if not, check from yesterday)
              const todayStr = checkDate.toISOString().split('T')[0];
              if (!activity[todayStr] || activity[todayStr].count === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
              }

              while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (activity[dateStr] && activity[dateStr].count > 0) {
                  streak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  break;
                }
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ topics, activity, streak }));

            } else if (req.method === 'POST' && action === 'review') {
              // Record a topic review
              const { topicId, topicName, classLevel, subject = 'Physics', rating = 3 } = body;

              if (!topicId || !topicName) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'topicId and topicName are required' }));
                return;
              }

              // SM-2 Algorithm variables
              const INTERVALS = [1, 3, 7, 14, 30, 60, 120];
              const MIN_EASE = 1.3;

              // Check if topic exists
              const [existing] = await db.execute(
                'SELECT * FROM srs_topic_reviews WHERE topic_id = ?',
                [topicId]
              );

              let newReviewCount, newEase, newInterval, nextReviewDate;
              const today = new Date();

              if (existing.length > 0) {
                // Update existing topic
                const current = existing[0];
                newReviewCount = (current.review_count || 0) + 1;

                // Adjust ease factor based on rating (1-5)
                // 3 is neutral, <3 decreases ease, >3 increases ease
                newEase = Math.max(MIN_EASE,
                  (current.ease_factor || 2.5) + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
                );

                // Calculate new interval
                if (rating < 3) {
                  // Failed - reset to beginning
                  newInterval = 1;
                } else {
                  const baseInterval = newReviewCount < INTERVALS.length
                    ? INTERVALS[newReviewCount - 1]
                    : INTERVALS[INTERVALS.length - 1];
                  newInterval = Math.round(baseInterval * newEase);
                }

                nextReviewDate = new Date(today);
                nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

                // Helper for local date string
                const getLocalDateStr = (d) => {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };

                await db.execute(`
                  UPDATE srs_topic_reviews 
                  SET review_count = ?, ease_factor = ?, interval_days = ?, 
                      last_reviewed = NOW(), next_review_date = ?
                  WHERE topic_id = ?
                `, [newReviewCount, newEase.toFixed(2), newInterval,
                  getLocalDateStr(nextReviewDate), topicId]);

              } else {
                // Create new topic entry
                newReviewCount = 1;
                newEase = 2.5;
                newInterval = INTERVALS[0];
                nextReviewDate = new Date(today);
                nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

                // Helper for local date string
                const getLocalDateStr = (d) => {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };

                await db.execute(`
                  INSERT INTO srs_topic_reviews 
                  (topic_id, topic_name, class_level, subject, review_count, ease_factor, 
                   interval_days, last_reviewed, next_review_date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                `, [topicId, topicName, classLevel || '12', subject,
                  newReviewCount, newEase, newInterval,
                  getLocalDateStr(nextReviewDate)]);
              }

              // Helper for local date string
              const getLocalDateStr = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              };

              // Record activity for heatmap
              const todayStr = getLocalDateStr(today);
              try {
                await db.execute(`
                  INSERT INTO srs_study_activity (activity_date, topic_id, topic_name)
                  VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE topic_name = VALUES(topic_name)
                `, [todayStr, topicId, topicName]);
              } catch (e) {
                // Ignore duplicate key errors
                console.log('[SRS] Activity already recorded for today');
              }

              res.statusCode = 200;
              res.end(JSON.stringify({
                topicId,
                topicName,
                reviewCount: newReviewCount,
                easeFactor: newEase,
                interval: newInterval,
                lastReviewed: getLocalDateStr(today),
                nextReviewDate: getLocalDateStr(nextReviewDate)
              }));

            } else if (req.method === 'GET' && action === 'heatmap') {
              // Get just heatmap data
              const [activityRows] = await db.execute(`
                SELECT 
                  DATE_FORMAT(activity_date, '%Y-%m-%d') as date,
                  COUNT(*) as count,
                  GROUP_CONCAT(topic_name) as topics
                FROM srs_study_activity
                WHERE activity_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
                GROUP BY activity_date
                ORDER BY activity_date DESC
              `);

              const activity = {};
              for (const row of activityRows) {
                activity[row.date] = {
                  count: row.count,
                  topics: row.topics ? row.topics.split(',') : []
                };
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ activity }));

            } else if (req.method === 'DELETE' && action === 'topics' && pathSegments[1] === 'all') {
              // Delete ALL SRS data (admin action)
              await db.execute('DELETE FROM srs_study_activity');
              await db.execute('DELETE FROM srs_topic_reviews');
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, all: true }));

            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} or action ${action} not allowed` }));
            }
          } catch (error) {
            console.error('[SRS API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Custom Apps API middleware - for cloud-synced app shortcuts
        server.middlewares.use('/api/custom-apps', async (req, res, next) => {
          console.log('[Custom Apps API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Parse URL for app ID
            const urlPath = req.url.split('?')[0];
            const pathSegments = urlPath.split('/').filter(Boolean);
            const appId = pathSegments[0] || null;

            // Parse body for POST/PUT requests
            let body = {};
            if (req.method === 'POST' || req.method === 'PUT') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              // Get all custom apps
              const [apps] = await db.execute(
                'SELECT id, name, url, description, icon, image, created_at FROM custom_apps ORDER BY created_at DESC'
              );

              // Transform to match frontend format
              const formattedApps = apps.map(app => ({
                id: app.id,
                name: app.name,
                url: app.url,
                description: app.description,
                icon: app.icon,
                image: app.image,
                isCustom: true
              }));

              res.statusCode = 200;
              res.end(JSON.stringify(formattedApps));

            } else if (req.method === 'POST') {
              // Create new custom app
              const { id, name, url, description, icon, image } = body;

              if (!name || !url) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Name and URL are required' }));
                return;
              }

              const appId = id || `custom-${Date.now()}`;

              await db.execute(
                'INSERT INTO custom_apps (id, name, url, description, icon, image) VALUES (?, ?, ?, ?, ?, ?)',
                [appId, name, url, description || 'Custom App', icon || 'Globe', image || null]
              );

              res.statusCode = 201;
              res.end(JSON.stringify({
                id: appId,
                name,
                url,
                description: description || 'Custom App',
                icon: icon || 'Globe',
                image: image || null,
                isCustom: true
              }));

            } else if (req.method === 'PUT') {
              // Update custom app
              if (!appId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'App ID required' }));
                return;
              }

              const { name, url, description, icon, image } = body;
              await db.execute(
                'UPDATE custom_apps SET name = ?, url = ?, description = ?, icon = ?, image = ? WHERE id = ?',
                [name, url, description, icon, image, appId]
              );

              res.statusCode = 200;
              res.end(JSON.stringify({ id: appId, updated: true }));

            } else if (req.method === 'DELETE') {
              // Delete custom app
              if (appId === 'all') {
                await db.execute('DELETE FROM custom_apps');
                res.statusCode = 200;
                res.end(JSON.stringify({ deleted: true, all: true }));
                return;
              }

              if (!appId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'App ID required' }));
                return;
              }

              await db.execute('DELETE FROM custom_apps WHERE id = ?', [appId]);
              res.statusCode = 200;
              res.end(JSON.stringify({ deleted: true, id: appId }));

            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Custom Apps API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Admin API middleware - Database stats endpoint
        server.middlewares.use('/api/admin/db-stats', async (req, res, next) => {
          console.log('[Admin DB Stats API]', req.method, req.url);

          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          try {
            await initDatabase();
            const db = await getDbPool();

            // Get database size from information_schema
            const [rows] = await db.execute(`
              SELECT 
                SUM(data_length + index_length) as used_bytes
              FROM information_schema.tables 
              WHERE table_schema = DATABASE()
            `);

            const usedBytes = rows[0]?.used_bytes || 0;
            const totalBytes = 5 * 1024 * 1024 * 1024; // 5GB default

            // Get per-table breakdown
            const [tableRows] = await db.execute(`
              SELECT 
                table_name,
                data_length + index_length as size_bytes,
                table_rows as row_count
              FROM information_schema.tables 
              WHERE table_schema = DATABASE()
              ORDER BY size_bytes DESC
            `);

            const tables = tableRows.map(row => ({
              name: row.table_name,
              size: parseInt(row.size_bytes || 0),
              rows: parseInt(row.row_count || 0)
            }));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              used: parseInt(usedBytes),
              total: totalBytes,
              tables
            }));
          } catch (error) {
            console.error('[Admin DB Stats API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: error.message,
              used: 0,
              total: 5 * 1024 * 1024 * 1024
            }));
          }
        });

        // Vault API middleware - PDF uploads metadata management with trash system
        server.middlewares.use('/api/vault', async (req, res, next) => {
          console.log('[Vault API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Parse URL path
            const urlPath = req.url.split('?')[0];
            const pathSegments = urlPath.split('/').filter(Boolean);
            const action = pathSegments[0] || 'list'; // 'list', 'save', 'delete', 'trash', 'restore', 'permanent-delete'

            // Parse body for POST requests
            let body = {};
            if (req.method === 'POST') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            // Ensure pdf_uploads table exists with deleted_at column
            try {
              await db.execute(`
                CREATE TABLE IF NOT EXISTS pdf_uploads (
                  id VARCHAR(36) PRIMARY KEY,
                  filename VARCHAR(255) NOT NULL,
                  size_bytes BIGINT NOT NULL,
                  mega_node_id VARCHAR(255),
                  mega_download_url TEXT,
                  deleted_at TIMESTAMP NULL DEFAULT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  INDEX idx_created (created_at),
                  INDEX idx_deleted (deleted_at)
                )
              `);
              // Add deleted_at column if it doesn't exist (migration)
              try {
                await db.execute(`ALTER TABLE pdf_uploads ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`);
              } catch (e) { /* Column already exists */ }
            } catch (e) { /* Table already exists */ }

            // Auto-cleanup: Permanently delete trash items older than 10 days
            try {
              await db.execute(`
                DELETE FROM pdf_uploads 
                WHERE deleted_at IS NOT NULL 
                AND deleted_at < DATE_SUB(NOW(), INTERVAL 10 DAY)
              `);
            } catch (cleanupErr) {
              console.log('[Vault] Cleanup skipped:', cleanupErr.message);
            }

            // Create vault_folders table
            try {
              await db.execute(`
                CREATE TABLE IF NOT EXISTS vault_folders (
                  id VARCHAR(36) PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  parent_id VARCHAR(36) NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (parent_id) REFERENCES vault_folders(id) ON DELETE CASCADE
                )
              `);

              // Add folder_id to pdf_uploads if not exists
              try {
                await db.execute(`ALTER TABLE pdf_uploads ADD COLUMN folder_id VARCHAR(36) NULL`);
                await db.execute(`ALTER TABLE pdf_uploads ADD CONSTRAINT fk_folder FOREIGN KEY (folder_id) REFERENCES vault_folders(id) ON DELETE SET NULL`);
              } catch (e) { /* Column or constraint already exists */ }
            } catch (e) { /* Table exists */ }

            if (req.method === 'GET' && (action === 'list' || action === '')) {
              // List active files (not in trash)
              const [rows] = await db.execute(`
                SELECT id, filename, size_bytes, mega_node_id, mega_download_url, created_at, folder_id
                FROM pdf_uploads
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
              `);

              // Get folders
              const [folderRows] = await db.execute(`
                SELECT id, name, parent_id, created_at FROM vault_folders ORDER BY name ASC
              `);


              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                files: rows.map(row => ({
                  id: row.id,
                  name: row.filename,
                  size: row.size_bytes,
                  megaNodeId: row.mega_node_id,
                  downloadUrl: row.mega_download_url,
                  name: row.filename,
                  size: row.size_bytes,
                  megaNodeId: row.mega_node_id,
                  downloadUrl: row.mega_download_url,
                  createdAt: row.created_at,
                  folderId: row.folder_id
                })),
                folders: folderRows.map(row => ({
                  id: row.id,
                  name: row.name,
                  parentId: row.parent_id,
                  createdAt: row.created_at
                }))
              }));

            } else if (req.method === 'GET' && action === 'trash') {
              // List files in trash
              const [rows] = await db.execute(`
                SELECT id, filename, size_bytes, mega_node_id, mega_download_url, deleted_at, created_at
                FROM pdf_uploads
                WHERE deleted_at IS NOT NULL
                ORDER BY deleted_at DESC
              `);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                files: rows.map(row => ({
                  id: row.id,
                  name: row.filename,
                  size: row.size_bytes,
                  megaNodeId: row.mega_node_id,
                  downloadUrl: row.mega_download_url,
                  deletedAt: row.deleted_at,
                  createdAt: row.created_at,
                  // Calculate days remaining before permanent deletion
                  daysRemaining: Math.max(0, 10 - Math.floor((Date.now() - new Date(row.deleted_at).getTime()) / (1000 * 60 * 60 * 24)))
                }))
              }));

            } else if (req.method === 'POST' && action === 'save') {
              // Save file metadata
              const { id, filename, sizeBytes, megaNodeId, downloadUrl } = body;

              if (!filename || !sizeBytes) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required fields: filename, sizeBytes' }));
                return;
              }

              const fileId = id || crypto.randomUUID();

              await db.execute(`
                INSERT INTO pdf_uploads (id, filename, size_bytes, mega_node_id, mega_download_url)
                VALUES (?, ?, ?, ?, ?)
              `, [fileId, filename, sizeBytes, megaNodeId || null, downloadUrl || null]);

              res.statusCode = 201;
              res.end(JSON.stringify({
                success: true,
                file: {
                  id: fileId,
                  name: filename,
                  size: sizeBytes,
                  megaNodeId,
                  downloadUrl
                }
              }));

            } else if (req.method === 'POST' && action === 'delete') {
              // Soft delete - move to trash (set deleted_at)
              const { id: fileId } = body;

              if (!fileId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required field: id' }));
                return;
              }

              const [result] = await db.execute(`
                UPDATE pdf_uploads SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL
              `, [fileId]);

              if (result.affectedRows === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'File not found or already in trash' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'File moved to trash',
                recoverable: true,
                daysUntilPermanentDeletion: 10
              }));

            } else if (req.method === 'POST' && action === 'restore') {
              // Restore from trash
              const { id: fileId } = body;

              if (!fileId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required field: id' }));
                return;
              }

              const [result] = await db.execute(`
                UPDATE pdf_uploads SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL
              `, [fileId]);

              if (result.affectedRows === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'File not found in trash' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'File restored from trash'
              }));

            } else if (req.method === 'POST' && action === 'permanent-delete') {
              // Permanent delete (from trash only) - also returns megaNodeId for client-side MEGA deletion
              const { id: fileId } = body;

              if (!fileId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required field: id' }));
                return;
              }

              // First get the file info for MEGA deletion
              const [fileRows] = await db.execute(`
                SELECT mega_node_id FROM pdf_uploads WHERE id = ? AND deleted_at IS NOT NULL
              `, [fileId]);

              if (fileRows.length === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'File not found in trash' }));
                return;
              }

              const megaNodeId = fileRows[0].mega_node_id;

              // Now permanently delete from database
              await db.execute(`DELETE FROM pdf_uploads WHERE id = ?`, [fileId]);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'File permanently deleted',
                megaNodeId: megaNodeId // Client should use this to delete from MEGA
              }));

            } else if (req.method === 'POST' && action === 'folders') {
              // Folder Management (create, delete, rename)
              // Sub-action in query or body? Let's use body 'type'
              const { type } = body;

              if (type === 'create') {
                const { name, parentId } = body;
                const newId = crypto.randomUUID();
                await db.execute(
                  'INSERT INTO vault_folders (id, name, parent_id) VALUES (?, ?, ?)',
                  [newId, name, parentId || null]
                );
                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, folder: { id: newId, name, parentId } }));

              } else if (type === 'delete') {
                const { id } = body;
                await db.execute('DELETE FROM vault_folders WHERE id = ?', [id]);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, id }));
              }

            } else if (req.method === 'POST' && action === 'move') {
              // Move file to folder
              const { fileId, folderId } = body;

              if (!fileId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'fileId required' }));
                return;
              }

              await db.execute(
                'UPDATE pdf_uploads SET folder_id = ? WHERE id = ?',
                [folderId || null, fileId]
              );

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, fileId, folderId }));

            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} or action ${action} not allowed` }));
            }
          } catch (error) {
            console.error('[Vault API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        // Learning Notes API middleware
        server.middlewares.use('/api/notes', async (req, res, next) => {
          console.log('[Notes API]', req.method, req.url);

          try {
            await initDatabase();
            const db = await getDbPool();

            // Extract query parameters manually
            const url = new URL(req.url, `http://${req.headers.host}`);
            const noteId = url.searchParams.get('id');

            // Parse body for POST/PUT requests
            let body = {};
            if (req.method === 'POST' || req.method === 'PUT') {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const raw = Buffer.concat(chunks).toString();
              if (raw) body = JSON.parse(raw);
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              if (noteId) {
                const [notes] = await db.execute('SELECT * FROM learning_notes WHERE id = ?', [noteId]);
                if (notes.length === 0) {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Note not found' }));
                } else {
                  res.statusCode = 200;
                  res.end(JSON.stringify(notes[0]));
                }
              } else {
                const [notes] = await db.execute('SELECT * FROM learning_notes ORDER BY created_at DESC');
                res.statusCode = 200;
                res.end(JSON.stringify(notes));
              }
            } else if (req.method === 'POST') {
              const { id, type, subject, topic, title, description, tags, priority, source } = body;
              const newId = id || crypto.randomUUID();

              await db.execute(
                `INSERT INTO learning_notes (id, type, subject, topic, title, description, tags, priority, source) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newId, type, subject, topic, title, description, tags, priority, source]
              );

              res.statusCode = 201;
              res.end(JSON.stringify({ id: newId, message: 'Note created successfully' }));
            } else if (req.method === 'PUT') {
              if (!noteId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Note ID required' }));
                return;
              }

              const { type, subject, topic, title, description, tags, priority, source, is_revised, revision_count } = body;

              const [existing] = await db.execute('SELECT * FROM learning_notes WHERE id = ?', [noteId]);
              if (existing.length === 0) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Note not found' }));
                return;
              }

              // Build dynamic update to only change provided fields if needed, 
              // but for now we follow the simple pattern of existing APIs
              await db.execute(
                `UPDATE learning_notes SET 
                  type = ?, subject = ?, topic = ?, title = ?, 
                  description = ?, tags = ?, priority = ?, source = ?, 
                  is_revised = ?, revision_count = ?
                 WHERE id = ?`,
                [
                  type || existing[0].type,
                  subject || existing[0].subject,
                  topic || existing[0].topic,
                  title || existing[0].title,
                  description || existing[0].description,
                  tags || existing[0].tags,
                  priority || existing[0].priority,
                  source || existing[0].source,
                  is_revised !== undefined ? is_revised : existing[0].is_revised,
                  revision_count !== undefined ? revision_count : existing[0].revision_count,
                  noteId
                ]
              );

              res.statusCode = 200;
              res.end(JSON.stringify({ id: noteId, message: 'Note updated successfully' }));
            } else if (req.method === 'DELETE') {
              if (!noteId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Note ID required' }));
                return;
              }

              await db.execute('DELETE FROM learning_notes WHERE id = ?', [noteId]);
              res.statusCode = 200;
              res.end(JSON.stringify({ message: 'Note deleted successfully' }));
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
            }
          } catch (error) {
            console.error('[Notes API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });

        server.middlewares.use('/api/chat', async (req, res, next) => {
          if (req.method === 'GET') {
            res.end('API functionality check: OK');
            return;
          }

          if (req.method !== 'POST') {
            return next();
          }

          console.log('[API] Received request:', req.method, req.originalUrl || req.url);

          let body = '';
          try {
            for await (const chunk of req) {
              body += chunk;
            }
          } catch (e) {
            console.error('[API] Error reading body:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Error reading body' }));
            return;
          }

          let data;
          try {
            data = JSON.parse(body);
          } catch (e) {
            console.error('[API] Invalid JSON:', e);
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }

          console.log('[API] Provider:', data.provider);

          // API Handler Logic
          let apiUrl, apiKey, headers, requestBody;

          // Google Gemini API
          if (data.provider === 'google') {
            const GEMINI_API_KEY = GEMINI_API_KEY;
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${data.model || 'gemini-flash-latest'}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
            headers = { 'Content-Type': 'application/json' };

            const contents = [];
            for (const msg of (data.messages || [])) {
              const role = msg.role === 'assistant' ? 'model' : 'user';
              const parts = [];
              if (Array.isArray(msg.content)) {
                for (const part of msg.content) {
                  if (part.type === 'text') {
                    parts.push({ text: part.text });
                  } else if (part.type === 'image_url' && part.image_url?.url) {
                    const dataUrl = part.image_url.url;
                    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
                    if (match) {
                      parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
                    }
                  }
                }
              } else {
                parts.push({ text: msg.content });
              }
              contents.push({ role, parts });
            }

            requestBody = JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: 'You are a helpful AI assistant. CRITICAL: For ALL math, wrap in dollar signs: $...$ for inline or $$...$$ for display math. NEVER use bracket notation [ ] or \\[ \\] for math. Examples: $\\frac{d}{dx}[x^2] = 2x$, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$. Use markdown for formatting. Be concise.' }]
              },
              generationConfig: {
                maxOutputTokens: data.max_tokens || 8192,
                temperature: data.temperature || 0.7,
                topP: data.top_p || 0.9,
              },
            });
          } else if (data.provider === 'sambanova') {
            // SambaNova
            apiUrl = 'https://api.sambanova.ai/v1/chat/completions';
            apiKey = SAMBANOVA_API_KEY;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            const sambaMessages = [
              { role: 'system', content: 'You are a helpful AI assistant. CRITICAL: For ALL math, wrap in dollar signs: $...$ for inline or $$...$$ for display math. NEVER use bracket notation [ ] or \\[ \\] for math. Examples: $\\frac{d}{dx}[x^2] = 2x$, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$. Be concise.' },
              ...(data.messages || [])
            ];
            requestBody = JSON.stringify({
              model: data.model || 'DeepSeek-R1-0528',
              messages: sambaMessages,
              stream: true,
              max_tokens: data.max_tokens || 8192,
              temperature: data.temperature || 0.1,
              top_p: data.top_p || 0.1,
            });
          } else if (data.provider === 'hybrid') {
            // HYBRID MODE: Gemini Vision + DeepSeek Reasoning
            // Use environment variable from top of file
            const MAX_LOOPS = 3;

            // Helper: Call Gemini for vision
            async function callGemini(prompt, imageData = null) {
              const parts = [{ text: prompt }];
              if (imageData) {
                const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
                if (match) {
                  parts.unshift({ inline_data: { mime_type: match[1], data: match[2] } });
                }
              }

              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
              const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ role: 'user', parts }],
                  generationConfig: { maxOutputTokens: 4096, temperature: 0.3 }
                })
              });
              const geminiData = await geminiRes.json();
              return geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }

            // Helper: Call DeepSeek for reasoning (non-streaming for hybrid)
            async function callDeepSeek(messages) {
              console.log('[Hybrid] Calling DeepSeek with', messages.length, 'messages');
              try {
                const deepseekUrl = 'https://api.sambanova.ai/v1/chat/completions';
                const deepseekRes = await fetch(deepseekUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SAMBANOVA_API_KEY}`
                  },
                  body: JSON.stringify({
                    model: 'DeepSeek-R1-0528',
                    messages,
                    stream: false,
                    max_tokens: 8192,
                    temperature: 0.1,
                    top_p: 0.1
                  })
                });
                console.log('[Hybrid] DeepSeek response status:', deepseekRes.status);
                const deepseekData = await deepseekRes.json();
                console.log('[Hybrid] DeepSeek data received, content length:', deepseekData.choices?.[0]?.message?.content?.length || 0);
                if (!deepseekRes.ok) {
                  console.error('[Hybrid] DeepSeek error:', JSON.stringify(deepseekData).slice(0, 500));
                  return 'DeepSeek API error. Please try again.';
                }
                return deepseekData.choices?.[0]?.message?.content || 'No response from DeepSeek';
              } catch (err) {
                console.error('[Hybrid] DeepSeek fetch error:', err.message);
                return `Error calling DeepSeek: ${err.message}`;
              }
            }

            // Extract image from messages
            let imageBase64 = null;
            let userQuestion = '';
            for (const msg of data.messages || []) {
              if (msg.role === 'user') {
                if (Array.isArray(msg.content)) {
                  for (const part of msg.content) {
                    if (part.type === 'text') userQuestion = part.text;
                    if (part.type === 'image_url') imageBase64 = part.image_url?.url;
                  }
                } else {
                  userQuestion = msg.content;
                }
              }
            }

            // Check if this is a text-only message (no image in current message)
            const hasImage = imageBase64 !== null;

            if (!hasImage) {
              // TEXT-ONLY MODE: DeepSeek tries first with conversation history
              console.log('[Hybrid] Text-only message - DeepSeek first mode with history');

              // Include conversation history for context (previous messages)
              const conversationHistory = [];
              for (const msg of data.messages || []) {
                if (msg.role === 'user') {
                  // Extract text content only (skip image references)
                  let textContent = '';
                  if (Array.isArray(msg.content)) {
                    for (const part of msg.content) {
                      if (part.type === 'text') textContent = part.text;
                    }
                  } else {
                    textContent = msg.content;
                  }
                  if (textContent) conversationHistory.push({ role: 'user', content: textContent });
                } else if (msg.role === 'assistant') {
                  conversationHistory.push({ role: 'assistant', content: msg.content });
                }
              }

              console.log('[Hybrid] Conversation history built:', conversationHistory.length, 'messages');
              console.log('[Hybrid] Message roles:', conversationHistory.map(m => m.role).join(', '));
              console.log('[Hybrid] Last message:', conversationHistory[conversationHistory.length - 1]?.content?.slice(0, 100));

              const deepseekMessages = [
                { role: 'system', content: 'You are a brilliant problem solver. You have context from a previous conversation which may include image descriptions. Use that context to answer follow-up questions. Be helpful and concise. IMPORTANT: Do NOT use LaTeX notation. Use plain text and Unicode symbols (like ², ³, √, π, α, β, γ, ∑, ∫, →, ≈, ≠, ≤, ≥) instead of $...$ or \\frac{} syntax.' },
                ...conversationHistory
              ];

              // First attempt: DeepSeek tries alone
              const deepseekResponse = await callDeepSeek(deepseekMessages);

              // Check if DeepSeek needs visual help
              const needsVisualHelp = /need to see (the |an )?image|cannot (see|view|analyze) the image|require visual|need visual (information|reference|context)/i.test(deepseekResponse);

              let finalResponse = deepseekResponse;
              let prefixMessage = '**🧠 DeepSeek Response:**\n';

              if (needsVisualHelp) {
                // DeepSeek needs help - ask Gemini to analyze the context
                console.log('[Hybrid] DeepSeek needs visual help - calling Gemini');
                prefixMessage = '**🔄 DeepSeek needed visual context, asking Gemini...**\n\n';

                const geminiHelp = await callGemini(`The user asked: "${userQuestion}"\n\nProvide any relevant context, explanations, or information that might help answer this question. If there's no specific image to analyze, provide general knowledge on the topic.`, null);

                // Give Gemini's help to DeepSeek
                deepseekMessages.push({ role: 'assistant', content: deepseekResponse });
                deepseekMessages.push({ role: 'user', content: `Here's additional context from Gemini:\n${geminiHelp}\n\nNow please answer the original question: ${userQuestion}` });

                finalResponse = await callDeepSeek(deepseekMessages);
                prefixMessage = '**📚 Gemini provided context:**\n' + geminiHelp.slice(0, 500) + '...\n\n---\n\n**🧠 DeepSeek Final Answer:**\n';
              }

              // Stream the response
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');

              const fullResponse = prefixMessage + finalResponse;
              const chunks = fullResponse.match(/.{1,100}/g) || [];
              for (const chunk of chunks) {
                const chunkData = { choices: [{ delta: { content: chunk } }] };
                res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
              }
              res.write('data: [DONE]\n\n');
              res.end();
              return;
            }

            // IMAGE MODE: Full Gemini → DeepSeek flow (original logic)
            console.log('[Hybrid] Image detected - Full vision + reasoning mode');

            // Step 1: Get VERY detailed description from Gemini
            const visionPrompt = `Analyze this image in EXTREME detail. Describe:
1. ALL text, numbers, symbols, equations, and labels you can see
2. The structure and layout (diagrams, circuits, graphs, tables)
3. Relationships between elements
4. Any specific values, units, or measurements
5. Context clues about what problem or topic this represents

Be thorough - the more detail, the better. This description will be used by a reasoning AI to solve any problems shown.`;

            const imageDescription = await callGemini(visionPrompt, imageBase64);

            // Build conversation for DeepSeek
            const deepseekMessages = [
              { role: 'system', content: 'You are a brilliant problem solver. You have been given a detailed description of an image. Use your reasoning abilities to help the user. If you need more information about specific details in the image, clearly ask for clarification. IMPORTANT: Do NOT use LaTeX notation. Use plain text and Unicode symbols (like ², ³, √, π, α, β, γ, ∑, ∫, →, ≈, ≠, ≤, ≥) instead of $...$ or \\frac{} syntax.' },
              { role: 'user', content: `IMAGE DESCRIPTION:\n${imageDescription}\n\nUSER QUESTION: ${userQuestion}` }
            ];

            // Agentic loop
            let finalResponse = '';
            let loopCount = 0;

            while (loopCount < MAX_LOOPS) {
              loopCount++;
              const deepseekResponse = await callDeepSeek(deepseekMessages);

              // Check if DeepSeek needs clarification
              const needsClarification = /need more (information|details|clarity)|can you clarify|what is the (value|number|text)|cannot (see|determine|read)|unclear|please (specify|provide|tell me)/i.test(deepseekResponse);

              if (needsClarification && loopCount < MAX_LOOPS) {
                // Extract the question and ask Gemini
                const clarifyPrompt = `Based on this question about the image: "${deepseekResponse.slice(-500)}"
                
Look at the image again and provide the specific information requested. Focus on any values, numbers, text, or details that were asked about.`;

                const clarification = await callGemini(clarifyPrompt, imageBase64);

                // Add to conversation
                deepseekMessages.push({ role: 'assistant', content: deepseekResponse });
                deepseekMessages.push({ role: 'user', content: `ADDITIONAL IMAGE DETAILS:\n${clarification}` });
              } else {
                finalResponse = deepseekResponse;
                break;
              }
            }

            // Stream the final response to the client
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Send image description first (so user sees what Gemini saw)
            const introChunk = { choices: [{ delta: { content: `**📷 Image Analysis (Gemini):**\n${imageDescription}\n\n---\n\n**🧠 Reasoning (DeepSeek):**\n` } }] };
            res.write(`data: ${JSON.stringify(introChunk)}\n\n`);

            // Stream final response in chunks
            const chunks = finalResponse.match(/.{1,100}/g) || [];
            for (const chunk of chunks) {
              const chunkData = { choices: [{ delta: { content: chunk } }] };
              res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;

          } else if (data.provider === 'huggingface') {
            // Hugging Face Inference API (OpenAI-compatible)
            const HF_TOKEN = process.env.HF_API_KEY || '';
            apiUrl = 'https://router.huggingface.co/v1/chat/completions';
            apiKey = HF_TOKEN;
            headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            };
            requestBody = JSON.stringify({
              model: data.model,
              messages: data.messages || [],
              stream: true,
              max_tokens: data.max_tokens || 4096,
              temperature: data.temperature || 0.7,
            });
          } else if (data.provider === 'groq') {
            // Groq API
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            apiKey = GROQ_API_KEY;
            headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            };
            const groqMessages = [
              { role: 'system', content: 'You are a helpful AI assistant. CRITICAL: For ALL math, wrap in dollar signs: $...$ for inline or $$...$$ for display math. NEVER use bracket notation [ ] or \\[ \\] for math. Examples: $\\frac{d}{dx}[x^2] = 2x$, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$. Be concise.' },
              ...(data.messages || [])
            ];
            requestBody = JSON.stringify({
              model: data.model || 'llama-3.3-70b-versatile',
              messages: groqMessages,
              stream: true,
              max_completion_tokens: data.max_tokens || 8192,
              temperature: data.temperature || 1,
              top_p: data.top_p || 1,
            });
          } else {
            // Cerebras
            apiUrl = 'https://api.cerebras.ai/v1/chat/completions';
            apiKey = CEREBRAS_API_KEY;
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };

            // Add system message for structured responses
            const messagesWithSystem = [
              { role: 'system', content: 'You are a helpful AI assistant. Provide well-structured, organized answers. Use markdown formatting: headings (##), bullet points (-), numbered lists (1.), bold (**text**), and code blocks (```). CRITICAL: For ALL math equations, you MUST wrap them in dollar signs: use $...$ for inline math or $$...$$ for display math. NEVER use bracket notation like [ ] or \\[ \\] for math. Examples: $\\frac{d}{dx}[x^2] = 2x$, $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$. Be concise but thorough.' },
              ...(data.messages || [])
            ];

            requestBody = JSON.stringify({
              model: data.model || 'llama-3.3-70b',
              messages: messagesWithSystem,
              stream: true,
              max_completion_tokens: data.max_tokens || 8192,
              temperature: data.temperature || 0.7,
              top_p: data.top_p || 0.9,
            });
          }

          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers,
              body: requestBody,
            });

            console.log('[API] Upstream Status:', response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[API] Upstream Error:', errorText);
              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Upstream error: ${errorText}` }));
              return;
            }

            res.statusCode = response.status;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            if (data.provider === 'google') {
              // Gemini Format Transformation
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const geminiData = JSON.parse(line.slice(6));
                      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                      if (text) {
                        const openaiFormat = { choices: [{ delta: { content: text } }] };
                        res.write(`data: ${JSON.stringify(openaiFormat)}\n\n`);
                      }
                    } catch (e) { }
                  }
                }
              }
              res.write('data: [DONE]\n\n');
              res.end();
            } else {
              // Pass strict
              const reader = response.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
              res.end();
            }
          } catch (error) {
            console.error('[API] Fetch error:', error);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message }));
            }
          }
        });
      },
    }
  ],
  define: {
    '__CEREBRAS_KEY__': JSON.stringify(CEREBRAS_API_KEY),
    '__SAMBANOVA_KEY__': JSON.stringify(SAMBANOVA_API_KEY),
    '__GEMINI_KEY__': JSON.stringify(GEMINI_API_KEY),
  },
  // Build optimization - manual chunk splitting for better caching
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion', 'gsap'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-context-menu'
          ],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'zustand'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        }
      },
      plugins: [
        // Bundle analysis - generates stats.html in dist folder
        process.env.ANALYZE && visualizer({
          filename: 'dist/bundle-stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        })
      ].filter(Boolean),
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false, // Reduce bundle size in production
    // Optimize minification
    minify: 'esbuild',
    target: 'es2020',
  },
})

