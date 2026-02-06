import { getDbPool } from './src/lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing src/lib/db.js validation...');
    try {
        const db = await getDbPool();
        console.log('✅ getDbPool success! validation passed.');
        await db.end();
    } catch (e) {
        console.error('❌ getDbPool failed:', e.message);
        process.exit(1);
    }
}
test();
