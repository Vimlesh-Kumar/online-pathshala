/**
 * aiQuota.js
 *
 * A tiny in-memory, per-user sliding-window limiter for the AI endpoints.
 *
 * Groq's free tier gives the whole app one shared request budget, so a single
 * learner hammering the tutor could exhaust it for everyone. This keeps each
 * user to a fair share. It is per-process (not shared across instances), which
 * is fine for its job: a soft guard, not a billing system.
 */
import { sendError } from '../../utils/apiResponse.js';

const hitsByKey = new Map();

/**
 * Express middleware allowing `limit` requests per user per `windowMs`.
 * Must run after auth.checkToken so `req.user.id` is set.
 *
 * @param {string} bucket - name shared by the routes that draw on one budget
 * @param {{limit: number, windowMs: number}} options
 */
export const aiQuota = (bucket, { limit, windowMs }) => (req, res, next) => {
    const key = `${bucket}:${req.user?.id}`;
    const now = Date.now();
    const recent = (hitsByKey.get(key) || []).filter((at) => now - at < windowMs);

    if (recent.length >= limit) {
        const retryAfterSeconds = Math.ceil((windowMs - (now - recent[0])) / 1000);
        res.set('Retry-After', String(retryAfterSeconds));
        return sendError(res, {
            statusCode: 429,
            message: `You're going fast! Try again in about ${retryAfterSeconds} seconds.`
        });
    }

    recent.push(now);
    hitsByKey.set(key, recent);
    return next();
};

// Drop idle users so the map can't grow without bound on a long-lived process.
setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [key, hits] of hitsByKey) {
        if (!hits.length || hits[hits.length - 1] < cutoff) hitsByKey.delete(key);
    }
}, 10 * 60 * 1000).unref();
