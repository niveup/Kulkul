import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;

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
    console.log('Initializing database...');
    const db = await getDbPool();
    const connection = await db.getConnection();
    try {
        console.log('Creating conversations table...');
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

        console.log('Updating conversations table...');
        try {
            await connection.execute(`ALTER TABLE conversations ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`);
        } catch (e) {
            console.log('Updated failed (expected if column exists):', e.message);
        }

        console.log('Creating messages table...');
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

        console.log('Creating todos table...');
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(36) PRIMARY KEY,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log('Creating pomodoro_sessions table...');
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

        console.log('Creating srs_topic_reviews table...');
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

        console.log('Creating srs_study_activity table...');
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

        console.log('Creating active_timer table...');
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

        console.log('Creating custom_apps table...');
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

        console.log('✅ TiDB tables initialized');
    } catch (error) {
        console.error('❌ Init failed:', error);
    } finally {
        connection.release();
        pool.end();
    }
}

initDatabase();
