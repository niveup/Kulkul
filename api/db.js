// Shared Database Utility for Vercel Serverless Functions
import mysql from 'mysql2/promise';

let pool = null;
let isDbInitialized = false;

export async function getDbPool() {
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

export async function initDatabase() {
    if (isDbInitialized) return;
    const db = await getDbPool();
    const connection = await db.getConnection();
    try {
        // Conversations table
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

        // Messages table
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

        // Todos table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS todos (
                id VARCHAR(36) PRIMARY KEY,
                text VARCHAR(500) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Pomodoro sessions table
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

        // Active timer table
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

        // SRS tables
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

        // Custom apps table
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

        // Auth sessions table
        await connection.execute(`
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
        `);

        // Auth config table (for session kill feature)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS auth_config (
                id INT PRIMARY KEY DEFAULT 1,
                kill_sessions_before TIMESTAMP DEFAULT '1970-01-01 00:00:01'
            )
        `);
        // Ensure auth_config has initial row
        await connection.execute(`
            INSERT IGNORE INTO auth_config (id, kill_sessions_before) VALUES (1, '1970-01-01 00:00:01')
        `);

        // Security audit log
        await connection.execute(`
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
        `);

        // Rate limits table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS rate_limits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL,
                endpoint VARCHAR(100) NOT NULL,
                request_count INT DEFAULT 1,
                window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_ip_endpoint (ip_address, endpoint)
            )
        `);

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
