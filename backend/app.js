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

/**
 * NOTE: this module must only ever be imported *after* `bootstrapSecrets()` has
 * resolved — several routers (and database.js) read process.env at import time.
 * server.js enforces that ordering with a dynamic import.
 */
const app = express();

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
// Allow all origins by default; lock down to the frontend URL by setting CORS_ORIGIN.
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

// Lightweight health check (no DB) — used by Render to confirm the service is up.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/user', userRouter);
app.use('/', courseRouter);
app.use('/user/notes', notesRouter);
app.use('/user/notifications', notificationRouter);
app.use('/user/momentum', momentumRouter);
app.use('/user/course', enrollmentRouter);
app.use('/', objectivesRouter);
app.use('/course/section', lecturesRouter);
app.use('/', cartRouter);
app.use('/', wishListRouter);
app.use('/', orderRouter);
app.use('/', engagementRouter);
app.use('/', announcementRouter);
app.use('/', certificateRouter);
app.use('/', aiSupportRouter);

export default app;
