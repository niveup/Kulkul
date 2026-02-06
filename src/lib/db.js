// Shared Database Utility for Vercel Serverless Functions
import mysql from 'mysql2/promise';

let pool = null;
let isDbInitialized = false;

function validateEnvVars() {
    const required = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export async function getDbPool() {
    validateEnvVars();
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

// Initialize database schema (Optimized for Serverless Cold Starts)
export async function initDatabase() {
    if (isDbInitialized) return;
    const db = await getDbPool();

    // FAST PATH: Check if a core table exists to skip 15+ DDL queries
    try {
        // If this succeeds, schema handles are likely in place
        await db.execute('SELECT 1 FROM auth_sessions LIMIT 1');
        isDbInitialized = true;
        return;
    } catch (error) {
        // Table doesn't exist, proceed to initialization
        console.log('[DB] Initializing schema (Cold Start)...');
    }

    const connection = await db.getConnection();
    try {
        // Use Promise.all to run DDL queries in parallel for faster startup
        await Promise.all([
            // Core tables
            connection.execute(`
                CREATE TABLE IF NOT EXISTS conversations (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    model_id VARCHAR(100),
                    model_name VARCHAR(100),
                    deleted_at TIMESTAMP NULL DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `),
            connection.execute(`
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
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS todos (
                    id VARCHAR(36) PRIMARY KEY,
                    text VARCHAR(500) NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS pomodoro_sessions (
                    id VARCHAR(36) PRIMARY KEY,
                    type VARCHAR(50) NOT NULL,
                    minutes INT NOT NULL,
                    elapsed_seconds INT NOT NULL,
                    status ENUM('completed', 'failed') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS active_timer (
                    id VARCHAR(36) PRIMARY KEY DEFAULT 'default',
                    start_time BIGINT NOT NULL,
                    duration_seconds INT NOT NULL,
                    paused_remaining INT NULL,
                    status ENUM('active', 'paused', 'idle') DEFAULT 'idle',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `),
            connection.execute(`
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
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS srs_study_activity (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    activity_date DATE NOT NULL,
                    topic_id VARCHAR(100) NOT NULL,
                    topic_name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_daily_topic (activity_date, topic_id)
                )
            `),
            connection.execute(`
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
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS auth_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    token VARCHAR(64) NOT NULL UNIQUE,
                    ip_address VARCHAR(45) NOT NULL,
                    user_agent_hash VARCHAR(64),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    INDEX idx_token (token),
                    INDEX idx_expires (expires_at)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS auth_config (
                    id INT PRIMARY KEY DEFAULT 1,
                    kill_sessions_before TIMESTAMP DEFAULT '1970-01-01 00:00:01'
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS security_audit_log (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_type VARCHAR(50) NOT NULL,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    details TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_event_type (event_type),
                    INDEX idx_created_at (created_at)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS rate_limits (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ip_address VARCHAR(45) NOT NULL,
                    endpoint VARCHAR(100) NOT NULL,
                    request_count INT DEFAULT 1,
                    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_ip_endpoint (ip_address, endpoint)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS daily_todos (
                    id VARCHAR(36) PRIMARY KEY,
                    text VARCHAR(500) NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS compact_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date DATE NOT NULL,
                    minutes INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_date (date)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS pdf_uploads (
                    id VARCHAR(36) PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    size_bytes BIGINT NOT NULL,
                    mega_node_id VARCHAR(255),
                    mega_download_url TEXT,
                    folder_id VARCHAR(36) NULL,
                    description TEXT NULL,
                    author VARCHAR(255) NULL,
                    subject VARCHAR(255) NULL,
                    deleted_at TIMESTAMP NULL DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created (created_at),
                    INDEX idx_folder (folder_id),
                    INDEX idx_deleted (deleted_at)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS vault_folders (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    parent_id VARCHAR(36) NULL,
                    color VARCHAR(7) DEFAULT '#6366f1',
                    icon VARCHAR(50) DEFAULT 'folder',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_parent (parent_id)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS vault_tags (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_tag_name (name)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS file_tags (
                    file_id VARCHAR(36) NOT NULL,
                    tag_id VARCHAR(36) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (file_id, tag_id),
                    INDEX idx_file (file_id),
                    INDEX idx_tag (tag_id)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS pdf_annotations (
                    id VARCHAR(36) PRIMARY KEY,
                    file_id VARCHAR(36) NOT NULL,
                    type ENUM('highlight', 'note', 'bookmark') NOT NULL,
                    page_number INT NOT NULL,
                    content TEXT,
                    position_x DECIMAL(10,2) NULL,
                    position_y DECIMAL(10,2) NULL,
                    width DECIMAL(10,2) NULL,
                    height DECIMAL(10,2) NULL,
                    color VARCHAR(7) DEFAULT '#fbbf24',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_file (file_id),
                    INDEX idx_page (file_id, page_number)
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS reading_progress (
                    file_id VARCHAR(36) PRIMARY KEY,
                    current_page INT DEFAULT 1,
                    total_pages INT NULL,
                    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    reading_time_seconds INT DEFAULT 0
                )
            `),
            connection.execute(`
                CREATE TABLE IF NOT EXISTS ai_user_memories (
                    id VARCHAR(36) PRIMARY KEY,
                    category VARCHAR(50) NOT NULL,
                    content TEXT NOT NULL,
                    confidence DECIMAL(3,2) DEFAULT 1.00,
                    source ENUM('user', 'ai') DEFAULT 'ai',
                    source_conversation_id VARCHAR(36),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_category (category),
                    INDEX idx_active (is_active),
                    INDEX idx_source (source),
                    INDEX idx_updated (updated_at)
                )
            `)
        ]);

        // Post-creation tasks (must run after tables exist)
        await connection.execute(`
            INSERT IGNORE INTO auth_config (id, kill_sessions_before) VALUES (1, '1970-01-01 00:00:01')
        `);

        // Migrations (Run safe ALTERs in parallel if possible, or sequentially if dependent)
        // These are safe to run every time as they use try-catch or IF EXISTS logic internally in previous version
        // Ideally these should also be skipped if 'SELECT 1 FROM auth_sessions' passed, which we did above.
        // So we only need to put them here for when tables ARE created or if we want to ensure schema updates.
        // For simplicity/speed, we'll assume fresh tables have correct schema.

        isDbInitialized = true;
    } finally {
        connection.release();
    }
}

// Helper to generate UUID
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
