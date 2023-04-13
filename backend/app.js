const express=require('express')
require("dotenv").config();
const app=express()

app.get('/',(req,res)=>{
    res.json({
        success:200,
        message:'Rest API working now...........'
    })
})





app.listen(process.env.APP_PORT,()=>{
    console.log('Server is running on PORT:',process.env.APP_PORT)
})