const express = require('express')
require("dotenv").config();
const app = express()
const userRouter = require('./api/routes/user.router')
const cors = require('cors');
const courseRouter=require('./api/routes/course.router')
const enrollmentRouter=require('./api/routes/enrollment.router')

// app.get('/',(req,res)=>{
//     res.json({
//         success:200,
//         message:'Rest API working now...........'
//     })
// })
app.use(cors());
app.use(express.json());

app.use('/user', userRouter);
app.use('/user/tutor',courseRouter)
app.use('/user/course',enrollmentRouter)

app.listen(process.env.APP_PORT, () => {
    console.log('Server is running on PORT:', process.env.APP_PORT)
})