import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';

import userRouter from './api/routes/user.router.js';
import courseRouter from './api/routes/course.router.js';
import enrollmentRouter from './api/routes/enrollment.router.js';
import objectivesRouter from './api/routes/courseObjectives.router.js';
import lecturesRouter from './api/routes/sectionLectures.router.js';
import cartRouter from './api/routes/cart.router.js';
import wishListRouter from './api/routes/wishlist.router.js';

const app = express();
const PORT = process.env.PORT || process.env.APP_PORT || 5000;

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(cors());
app.use(express.json());

app.use('/user', userRouter);
app.use('/', courseRouter);
app.use('/user/course', enrollmentRouter);
app.use('/', objectivesRouter);
app.use('/course/section', lecturesRouter);
app.use('/', cartRouter);
app.use('/', wishListRouter);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
}

export default app;