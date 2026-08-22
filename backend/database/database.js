import knex from 'knex';
import '../config/env.js';

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
        } else {
            // Update column type if it already exists to VARCHAR(500)
            await pool.raw('ALTER TABLE users MODIFY COLUMN avatar_url VARCHAR(500)');
        }

        // Courses gained a real owner column; databases created before that
        // still identify the instructor by display name only.
        const hasCourseOwner = await pool.schema.hasColumn('courses', 'owner_user_id');
        if (!hasCourseOwner) {
            console.log('Adding owner_user_id to courses table...');
            await pool.raw('ALTER TABLE courses ADD COLUMN owner_user_id INT DEFAULT NULL');
            await pool.raw(
                'ALTER TABLE courses ADD CONSTRAINT fk_courses_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)'
            );
            // Backfill from the display name. Names are not unique, so this is a
            // best-effort migration — new courses record the owner directly.
            const backfilled = await pool.raw(
                'UPDATE courses c JOIN users u ON u.full_name = c.author SET c.owner_user_id = u.id WHERE c.owner_user_id IS NULL'
            );
            console.log(`✅ Courses table altered; owners backfilled (${backfilled[0]?.affectedRows ?? 0} rows).`);
        }

        // Flashcard reviews and practice quizzes also count towards a streak.
        // `CREATE TABLE IF NOT EXISTS` never adds columns to an existing table,
        // so databases created before those features need them added here.
        const hasCardsReviewed = await pool.schema.hasColumn('learning_activity', 'cards_reviewed');
        if (!hasCardsReviewed) {
            console.log('Adding review counters to learning_activity table...');
            await pool.raw('ALTER TABLE learning_activity ADD COLUMN cards_reviewed INT NOT NULL DEFAULT 0');
            await pool.raw('ALTER TABLE learning_activity ADD COLUMN quizzes_taken INT NOT NULL DEFAULT 0');
            console.log('✅ learning_activity table altered with review counters.');
        }
    } catch (err) {
        console.error('❌ Database connection or schema migration failed:', err.message);
    }
})();

export default pool;
