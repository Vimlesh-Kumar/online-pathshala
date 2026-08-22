/**
 * One-command database bootstrap.
 *
 *   npm run db:setup     schema + demo seed data
 *   npm run db:schema    schema only — for a database that already has real data
 *
 * Reads DB_* from the environment (.env / .env.local locally, or the host's env
 * vars in production) and applies database/schema.sql followed by
 * database/seed.sql. Everything is `CREATE TABLE IF NOT EXISTS` / `INSERT IGNORE`,
 * so existing tables and rows are never touched: re-running only fills in what is
 * missing. That is how new tables reach a database that is already in use.
 *
 * Works against local MySQL and hosted providers (Aiven, TiDB, ...) alike.
 */
import { bootstrapSecrets } from '../config/secrets.bootstrap.js';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const databaseDir = join(__dirname, '..', 'database');

// Top-level await, so the credentials below are read *after* configuration has
// resolved — including secrets pulled from Infisical. The cache is irrelevant to
// a schema migration, so its production requirement is waived here.
await bootstrapSecrets({ requireCache: false });

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

// Demo courses/users are useful on a fresh database and unwanted on one that
// already holds real data.
const schemaOnly = process.argv.slice(2).includes('--schema-only');

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

    // `CREATE TABLE IF NOT EXISTS` leaves existing tables untouched, so columns
    // added after a database was first created need an explicit migration.
    const [[{ hasOwnerColumn }]] = await connection.query(
        `SELECT COUNT(*) AS hasOwnerColumn FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'owner_user_id'`,
        [MYSQL_DATABASE]
    );
    if (!hasOwnerColumn) {
        await connection.query('ALTER TABLE courses ADD COLUMN owner_user_id INT DEFAULT NULL');
        await connection.query(
            'ALTER TABLE courses ADD CONSTRAINT fk_courses_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)'
        );
        // Best effort: display names are not unique, new courses store the owner directly.
        await connection.query(
            'UPDATE courses c JOIN users u ON u.full_name = c.author SET c.owner_user_id = u.id WHERE c.owner_user_id IS NULL'
        );
        console.log('✅ Added courses.owner_user_id (backfilled from author names).');
    }

    if (schemaOnly) {
        console.log('⏭️  Seed data skipped (--schema-only).');
    } else {
        const seed = await readFile(join(databaseDir, 'seed.sql'), 'utf8');
        await connection.query(seed);
        console.log('✅ Seed data applied.');
    }

    const [[{ courses }]] = await connection.query('SELECT COUNT(*) AS courses FROM courses');
    const [[{ users }]] = await connection.query('SELECT COUNT(*) AS users FROM users');
    console.log(`Done. Database "${MYSQL_DATABASE}" now has ${courses} courses and ${users} users.`);

    await connection.end();
}

run().catch((err) => {
    console.error('❌ Bootstrap failed:', err.message);
    process.exit(1);
});
