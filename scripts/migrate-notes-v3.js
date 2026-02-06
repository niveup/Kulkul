import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config();

async function migrate() {
    console.log('Connecting to TiDB for migration...');
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
        console.log('✅ Connected. Migrating `learning_notes` table...');

        // Add images column
        try {
            await connection.execute(`
                ALTER TABLE learning_notes 
                ADD COLUMN images JSON AFTER source
            `);
            console.log('✅ Added \`images\` column.');
        } catch (e) {
            console.log('⚠️ images column add failed/exists:', e.message);
        }

        // Add links column
        try {
            await connection.execute(`
                ALTER TABLE learning_notes 
                ADD COLUMN links JSON AFTER images
            `);
            console.log('✅ Added \`links\` column.');
        } catch (e) {
            console.log('⚠️ links column add failed/exists:', e.message);
        }

        // Initialize existing rows with empty arrays if needed
        await connection.execute(`
            UPDATE learning_notes 
            SET images = '[]' 
            WHERE images IS NULL
        `);

        await connection.execute(`
            UPDATE learning_notes 
            SET links = '[]' 
            WHERE links IS NULL
        `);

        console.log('✅ Migration complete!');
        connection.release();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrate();
