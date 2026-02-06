import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config();

async function initLearningNotesTable() {
    console.log('Connecting to TiDB...');
    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        ssl: { rejectUnauthorized: true },
        waitForConnections: true,
        connectionLimit: 1,
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected. Creating `learning_notes` table...');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS learning_notes (
                id VARCHAR(36) PRIMARY KEY,
                type ENUM('concept', 'question', 'formula', 'trick', 'mistake', 'doubt', 'resource') NOT NULL,
                subject VARCHAR(50) NOT NULL,
                topic VARCHAR(100),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                tags TEXT,
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                source VARCHAR(255),
                is_revised BOOLEAN DEFAULT FALSE,
                revision_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_subject (subject),
                INDEX idx_type (type)
            )
        `);

        console.log('✅ `learning_notes` table is ready!');
        connection.release();
    } catch (error) {
        console.error('❌ Failed to initialize table:', error.message);
    } finally {
        await pool.end();
    }
}

initLearningNotesTable();
