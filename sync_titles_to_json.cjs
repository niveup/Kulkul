require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function sync() {
    console.log('[Sync] Connecting to database...');

    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        ssl: { rejectUnauthorized: true }
    });

    try {
        const [rows] = await pool.execute('SELECT video_id, title FROM video_titles');
        if (rows.length === 0) {
            console.log('[Sync] No custom titles found in database.');
            return;
        }

        const titleMap = {};
        rows.forEach(row => { titleMap[row.video_id] = row.title; });
        console.log(`[Sync] Found ${rows.length} custom titles.`);

        const jsonPath = path.join(__dirname, 'public', 'videos-data.json');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        let updateCount = 0;
        data.videos = data.videos.map(video => {
            if (titleMap[video.id]) {
                updateCount++;
                return { ...video, lesson: titleMap[video.id] };
            }
            return video;
        });

        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log(`[Sync] Updated ${updateCount} videos in JSON.`);

    } catch (error) {
        console.error('[Sync] Error:', error);
    } finally {
        await pool.end();
    }
}

sync();
