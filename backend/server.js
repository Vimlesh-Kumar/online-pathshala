const express = require('express')
require("dotenv").config();
const app = express()
const userRouter = require('./api/routes/user.router')
const cors = require('cors');
const courseRouter = require('./api/routes/course.router')
const enrollmentRouter = require('./api/routes/enrollment.router')
const objectivesRouter = require('./api/routes/courseObjectives.router')
const lecturesRouter = require('./api/routes/section&Lectures.router')
const cartRouter=require('./api/routes/cart.router')


var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));


app.use(cors());
app.use(express.json());
app.use('/user', userRouter);
app.use('/', courseRouter);
app.use('/user/course', enrollmentRouter);
app.use('/', objectivesRouter);
app.use('/course/section', lecturesRouter);
app.use('/',cartRouter)


app.listen(process.env.APP_PORT, () => {
    console.log('Server is running on PORT:', process.env.APP_PORT)
})