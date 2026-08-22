import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import userRouter from './features/user/user.router.js';
import courseRouter from './features/course/course.router.js';
import enrollmentRouter from './features/enrollment/enrollment.router.js';
import objectivesRouter from './features/courseObjectives/courseObjectives.router.js';
import lecturesRouter from './features/sectionLectures/sectionLectures.router.js';
import cartRouter from './features/cart/cart.router.js';
import wishListRouter from './features/wishlist/wishlist.router.js';
import orderRouter from './features/order/order.router.js';
import engagementRouter from './features/engagement/engagement.router.js';
import aiSupportRouter from './features/aiSupport/aiSupport.router.js';
import notesRouter from './features/notes/notes.router.js';
import notificationRouter from './features/notification/notification.router.js';
import momentumRouter from './features/momentum/momentum.router.js';
import announcementRouter from './features/announcement/announcement.router.js';
import certificateRouter from './features/certificate/certificate.router.js';
import flashcardsRouter from './features/flashcards/flashcards.router.js';
import practiceRouter from './features/practice/practice.router.js';
import goalsRouter from './features/goals/goals.router.js';
import socialRouter from './features/social/social.router.js';
import linkPreviewRouter from './features/linkPreview/linkPreview.router.js';

/**
 * NOTE: this module must only ever be imported *after* `bootstrapSecrets()` has
 * resolved — several routers (and database.js) read process.env at import time.
 * server.js enforces that ordering with a dynamic import.
 */
const app = express();

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
/**
 * Allowed browser origins.
 *
 * CORS_ORIGIN accepts a comma-separated list, because one deployment routinely
 * has several legitimate origins: the custom domain, the *.vercel.app domain it
 * aliases, and a per-commit preview URL. Passing the raw string to cors() would
 * only ever match one of them, and the other two fail in the browser while
 * curl keeps working — which makes the fault look like anything but CORS.
 *
 * Unset means "reflect whatever origin asked", i.e. wide open, which is the
 * right default for local development only.
 */
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);

console.log(
  allowedOrigins.length === 0
    ? '🌐 CORS: CORS_ORIGIN is unset — reflecting every origin (development default)'
    : `🌐 CORS: allowing ${allowedOrigins.join(', ')}`
);

app.use(cors({
  origin: allowedOrigins.length === 0
    ? true
    : (origin, callback) => {
        // A same-origin or server-to-server request sends no Origin header at all;
        // rejecting those would break curl, health checks and the service worker.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);

        // cors() answers a rejected origin by sending *no* CORS headers at all —
        // not even `Vary: Origin`. The browser then reports the generic "No
        // 'Access-Control-Allow-Origin' header is present", which looks identical
        // to the server being misrouted or down, while curl keeps working and the
        // log says nothing. Name the origin that was turned away.
        console.warn(
          `🚫 CORS: rejected origin ${origin} — CORS_ORIGIN allows ${allowedOrigins.join(', ')}`
        );
        return callback(null, false);
      },
}));
app.use(express.json());

// Lightweight health check (no DB) — used by the host to confirm the service is up.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/user', userRouter);
app.use('/', courseRouter);
app.use('/user/notes', notesRouter);
app.use('/user/notifications', notificationRouter);
app.use('/user/momentum', momentumRouter);
app.use('/user/flashcards', flashcardsRouter);
app.use('/user/goals', goalsRouter);
app.use('/user/social', socialRouter);
app.use('/user/links', linkPreviewRouter);
app.use('/user/course', enrollmentRouter);
app.use('/', objectivesRouter);
app.use('/course/section', lecturesRouter);
app.use('/', cartRouter);
app.use('/', wishListRouter);
app.use('/', orderRouter);
app.use('/', engagementRouter);
app.use('/', practiceRouter);
app.use('/', announcementRouter);
app.use('/', certificateRouter);
app.use('/', aiSupportRouter);

export default app;
