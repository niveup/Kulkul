// Quick script to delete all data from the database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAllData() {
    console.log('Connecting to database...');

    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        ssl: { rejectUnauthorized: true },
    });

    try {
        console.log('Deleting all data...\n');

        // Delete in correct order (respect foreign keys)
        console.log('1. Deleting messages...');
        const [r1] = await pool.execute('DELETE FROM messages');
        console.log(`   Deleted ${r1.affectedRows} messages`);

        console.log('2. Deleting conversations...');
        const [r2] = await pool.execute('DELETE FROM conversations');
        console.log(`   Deleted ${r2.affectedRows} conversations`);

        console.log('3. Deleting pomodoro_sessions...');
        const [r3] = await pool.execute('DELETE FROM pomodoro_sessions');
        console.log(`   Deleted ${r3.affectedRows} sessions`);

        console.log('4. Deleting todos...');
        const [r4] = await pool.execute('DELETE FROM todos');
        console.log(`   Deleted ${r4.affectedRows} todos`);

        console.log('5. Deleting daily_todos...');
        const [r5] = await pool.execute('DELETE FROM daily_todos');
        console.log(`   Deleted ${r5.affectedRows} daily todos`);

        console.log('6. Deleting active_timer...');
        const [r6] = await pool.execute('DELETE FROM active_timer');
        console.log(`   Deleted ${r6.affectedRows} active timer entries`);

        console.log('7. Deleting srs_study_activity...');
        const [r7] = await pool.execute('DELETE FROM srs_study_activity');
        console.log(`   Deleted ${r7.affectedRows} SRS activity entries`);

        console.log('8. Deleting srs_topic_reviews...');
        const [r8] = await pool.execute('DELETE FROM srs_topic_reviews');
        console.log(`   Deleted ${r8.affectedRows} SRS topics`);

        console.log('9. Deleting custom_apps...');
        const [r9] = await pool.execute('DELETE FROM custom_apps');
        console.log(`   Deleted ${r9.affectedRows} custom apps`);

        console.log('10. Deleting compact_sessions...');
        const [r10] = await pool.execute('DELETE FROM compact_sessions');
        console.log(`   Deleted ${r10.affectedRows} compact sessions`);

        console.log('\n✅ All data deleted successfully!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

deleteAllData();
