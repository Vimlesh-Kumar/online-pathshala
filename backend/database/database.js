import knex from 'knex';
import 'dotenv/config';

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

/**
 * Build the SSL config.
 *  - Hosted providers (Aiven, TiDB, PlanetScale, etc.) require TLS.
 *  - If a CA certificate is supplied (recommended), the server cert is verified.
 *  - Otherwise TLS is still enabled but the CA is not verified (works everywhere,
 *    slightly less secure — acceptable for a free demo deployment).
 */
function resolveSsl() {
    if (DB_CA_CERT) {
        // CA pasted directly into the env var (Render/Vercel support multi-line values).
        return { ca: DB_CA_CERT.replaceAll('\\n', '\n'), rejectUnauthorized: true };
    }
    if (!isLocal || DB_SSL === 'true') {
        return { rejectUnauthorized: false };
    }
    return undefined;
}

const connectionConfig = {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: MYSQL_DATABASE,
    ssl: resolveSsl()
};

// A local unix socket is only valid for a local server — never for a hosted DB.
if (DB_SOCKET_PATH && isLocal) {
    connectionConfig.socketPath = DB_SOCKET_PATH;
}

const pool = knex({
    client: 'mysql2',
    connection: connectionConfig,
    pool: { min: 2, max: 10 }
});

// Verify connectivity on boot and perform automatic user table schema updates.
(async () => {
    try {
        await pool.raw('SELECT 1');
        console.log(`✅ Connected to MySQL at ${DB_HOST}:${DB_PORT} (db: ${MYSQL_DATABASE}) using Knex`);

        // Perform schema migration dynamically for users table if needed
        const hasAvatarUrl = await pool.schema.hasColumn('users', 'avatar_url');
        if (!hasAvatarUrl) {
            console.log('Adding profile columns to users table...');
            await pool.schema.alterTable('users', (table) => {
                table.string('avatar_url', 500).nullable();
                table.string('headline', 255).nullable();
                table.text('bio').nullable();
                table.string('website_url', 255).nullable();
                table.string('twitter_url', 255).nullable();
                table.string('linkedin_url', 255).nullable();
                table.string('github_url', 255).nullable();
                table.string('youtube_url', 255).nullable();
                table.string('phone', 20).nullable();
                table.string('address', 255).nullable();
                table.string('gender', 20).nullable();
            });
            console.log('✅ Users table altered successfully with profile columns.');
        }
    } catch (err) {
        console.error('❌ Database connection or schema migration failed:', err.message);
    }
})();

export default pool;
