import mysql from 'mysql2/promise';

// TiDB connection configuration - NO FALLBACK CREDENTIALS FOR SECURITY
const poolConfig = {
    host: import.meta.env.VITE_TIDB_HOST,
    port: parseInt(import.meta.env.VITE_TIDB_PORT || '4000'),
    user: import.meta.env.VITE_TIDB_USER,
    password: import.meta.env.VITE_TIDB_PASSWORD,
    database: import.meta.env.VITE_TIDB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: true
    }
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

/**
 * Initialize the database by creating exam_results table if it doesn't exist
 */
export async function initDatabase() {
    try {
        const connection = await pool.getConnection();

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS exam_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        exam_type VARCHAR(50) NOT NULL,
        total_score INT NOT NULL,
        max_score INT NOT NULL,
        correct_count INT NOT NULL,
        wrong_count INT NOT NULL,
        unattempted_count INT NOT NULL,
        accuracy DECIMAL(5, 2) NOT NULL,
        total_time_spent INT NOT NULL,
        subject_stats JSON,
        question_results JSON,
        INDEX idx_exam_date (exam_date DESC),
        INDEX idx_exam_type (exam_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        await connection.execute(createTableQuery);
        connection.release();

        console.log('✅ Database initialized successfully');
        return { success: true, message: 'Database initialized successfully' };
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Save exam result to database
 * @param {Object} resultData - The exam result data
 * @returns {Promise<Object>} Result of the save operation
 */
export async function saveExamResult(resultData) {
    try {
        const {
            examType,
            totalScore,
            maxScore,
            correct,
            wrong,
            unattempted,
            accuracy,
            totalTimeSpent,
            subjectStats,
            questionResults
        } = resultData;

        const insertQuery = `
      INSERT INTO exam_results (
        exam_type,
        total_score,
        max_score,
        correct_count,
        wrong_count,
        unattempted_count,
        accuracy,
        total_time_spent,
        subject_stats,
        question_results
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(insertQuery, [
            examType,
            totalScore,
            maxScore,
            correct,
            wrong,
            unattempted,
            accuracy,
            totalTimeSpent,
            JSON.stringify(subjectStats),
            JSON.stringify(questionResults)
        ]);

        console.log('✅ Exam result saved to database with ID:', result.insertId);
        return {
            success: true,
            message: 'Exam result saved successfully',
            id: result.insertId
        };
    } catch (error) {
        console.error('❌ Error saving exam result:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Get recent exam results
 * @param {number} limit - Number of results to retrieve
 * @returns {Promise<Array>} Array of exam results
 */
export async function getExamResults(limit = 10) {
    try {
        const query = `
      SELECT 
        id,
        exam_date,
        exam_type,
        total_score,
        max_score,
        correct_count,
        wrong_count,
        unattempted_count,
        accuracy,
        total_time_spent,
        subject_stats,
        question_results
      FROM exam_results
      ORDER BY exam_date DESC
      LIMIT ?
    `;

        const [rows] = await pool.execute(query, [limit]);

        // Parse JSON fields
        const results = rows.map(row => ({
            ...row,
            subject_stats: JSON.parse(row.subject_stats || '{}'),
            question_results: JSON.parse(row.question_results || '[]')
        }));

        return { success: true, data: results };
    } catch (error) {
        console.error('❌ Error retrieving exam results:', error);
        return { success: false, message: error.message, data: [] };
    }
}

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Database connection successful');
        return { success: true, message: 'Connection successful' };
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return { success: false, message: error.message };
    }
}

// Initialize database on module load
initDatabase();
