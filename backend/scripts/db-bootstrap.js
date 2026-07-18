/**
 * One-command database bootstrap.
 *
 *   npm run db:setup
 *
 * Reads DB_* from the environment (.env locally, or the host's env vars in
 * production) and applies database/schema.sql followed by database/seed.sql.
 * Both files are idempotent, so this is safe to run on every deploy.
 *
 * Works against local MySQL and hosted providers (Aiven, TiDB, ...) alike.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const databaseDir = join(__dirname, '..', 'database');

const {
    DB_HOST = 'localhost',
    DB_PORT = '3306',
    DB_USER,
    DB_PASSWORD,
    MYSQL_DATABASE,
    DB_SOCKET_PATH,
    DB_CA_CERT,
    DB_SSL
} = process.env;

const isLocal = DB_HOST === 'localhost' || DB_HOST === '127.0.0.1';

function resolveSsl() {
    if (DB_CA_CERT) {
        return { ca: DB_CA_CERT.replaceAll('\\n', '\n'), rejectUnauthorized: true };
    }
    if (!isLocal || DB_SSL === 'true') {
        return { rejectUnauthorized: false };
    }
    return undefined;
}

async function run() {
    if (!MYSQL_DATABASE) {
        throw new Error('MYSQL_DATABASE is not set. Configure your .env (or host env vars) first.');
    }

    const baseConfig = {
        host: DB_HOST,
        port: Number(DB_PORT),
        user: DB_USER,
        password: DB_PASSWORD,
        multipleStatements: true,
        ssl: resolveSsl()
    };
    // A local unix socket is only valid for a local server.
    if (DB_SOCKET_PATH && isLocal) {
        baseConfig.socketPath = DB_SOCKET_PATH;
    }

    // Connect without a default database so we can create it locally if needed.
    const connection = await mysql.createConnection(baseConfig);
    console.log(`Connected to MySQL at ${DB_HOST}:${DB_PORT}`);

    if (isLocal) {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\``);
    }
    await connection.query(`USE \`${MYSQL_DATABASE}\``);

    const schema = await readFile(join(databaseDir, 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('✅ Schema applied.');

    const seed = await readFile(join(databaseDir, 'seed.sql'), 'utf8');
    await connection.query(seed);
    console.log('✅ Seed data applied.');

    const [[{ courses }]] = await connection.query('SELECT COUNT(*) AS courses FROM courses');
    const [[{ users }]] = await connection.query('SELECT COUNT(*) AS users FROM users');
    console.log(`Done. Database "${MYSQL_DATABASE}" now has ${courses} courses and ${users} users.`);

    await connection.end();
}

run().catch((err) => {
    console.error('❌ Bootstrap failed:', err.message);
    process.exit(1);
});
