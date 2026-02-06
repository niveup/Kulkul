import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config();

async function check() {
    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        ssl: { rejectUnauthorized: true },
    });

    try {
        // Check table schema
        const [columns] = await pool.execute(`
            DESCRIBE learning_notes
        `);
        console.log('Table columns:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'required'})`);
        });

        // Try a manual update to test
        console.log('\n--- Testing manual update ---');
        const testImages = JSON.stringify(['https://test.com/image.png']);
        const [result] = await pool.execute(
            `UPDATE learning_notes SET images = ? WHERE title = ? LIMIT 1`,
            [testImages, 'rgreg']
        );
        console.log('Update result:', result);

        // Check if it worked
        const [rows] = await pool.execute(
            `SELECT title, images FROM learning_notes WHERE title = ?`,
            ['rgreg']
        );
        console.log('After update:', rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

check();
