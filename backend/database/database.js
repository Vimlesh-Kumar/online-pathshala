const { createPool } = require('mysql2')
require("dotenv").config();

const connectionConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10
};

if (process.env.DB_SOCKET_PATH) {
    connectionConfig.socketPath = process.env.DB_SOCKET_PATH;
} else {
    connectionConfig.host = process.env.DB_HOST;
    connectionConfig.port = process.env.DB_PORT;
}

const pool = createPool(connectionConfig);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err); // Log full error object
    } else {
        console.log('Successfully connected to the database.');
        connection.release();
    }
});

module.exports = pool;