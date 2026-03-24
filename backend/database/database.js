import mysql from 'mysql2/promise';
import 'dotenv/config';

const connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
};

if (process.env.DB_SOCKET_PATH) {
    connectionConfig.socketPath = process.env.DB_SOCKET_PATH;
}

const pool = mysql.createPool(connectionConfig);

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the MySQL database.');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

export default pool;