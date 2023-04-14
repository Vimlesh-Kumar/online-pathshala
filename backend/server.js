const express=require('express')
require("dotenv").config();
const app=express()
const userRouter=require('./api/users/user.router')



// app.get('/',(req,res)=>{
//     res.json({
//         success:200,
//         message:'Rest API working now...........'
//     })
// })

app.use(express.json());

app.use('/user',userRouter)

app.listen(process.env.APP_PORT,()=>{
    console.log('Server is running on PORT:',process.env.APP_PORT)
})