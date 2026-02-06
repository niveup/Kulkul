import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config();

console.log('---------------------------------------------------');
console.log('Testing Database Connection...');
console.log('Host:', process.env.TIDB_HOST);
console.log('User:', process.env.TIDB_USER);
console.log('Database:', process.env.TIDB_DATABASE);
console.log('Port:', process.env.TIDB_PORT || 4000);
console.log('---------------------------------------------------');

async function testConnection() {
    try {
        const pool = mysql.createPool({
            host: process.env.TIDB_HOST,
            port: parseInt(process.env.TIDB_PORT || '4000'),
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: { rejectUnauthorized: true },
            waitForConnections: true,
            connectionLimit: 10,
        });

        console.log('Attempting to get connection...');
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to pool!');

        console.log('Executing test query (SELECT 1)...');
        const [rows] = await connection.execute('SELECT 1 as val');
        console.log('✅ Query result:', rows);

        connection.release();
        await pool.end();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Hint: Check if the usage of port and host is correct.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Hint: Check that your username and password are correct.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('Hint: Check that your host address is correct.');
        }
        process.exit(1);
    }
}

testConnection();
