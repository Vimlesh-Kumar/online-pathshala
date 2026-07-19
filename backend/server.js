import express from 'express';
import 'dotenv/config';
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

const app = express();
const PORT = process.env.PORT || process.env.APP_PORT || 5000;

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
// Allow all origins by default; lock down to the frontend URL by setting CORS_ORIGIN.
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

// Lightweight health check (no DB) — used by Render to confirm the service is up.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/user', userRouter);
app.use('/', courseRouter);
app.use('/user/course', enrollmentRouter);
app.use('/', objectivesRouter);
app.use('/course/section', lecturesRouter);
app.use('/', cartRouter);
app.use('/', wishListRouter);
app.use('/', orderRouter);
app.use('/', engagementRouter);
app.use('/', aiSupportRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on PORT: ${PORT}`);
});

export default app;