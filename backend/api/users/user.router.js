const express=require('express')
const { signup, signin } = require('./user.controller');
const router=require('express').Router();
const bodyParser = require('body-parser')

router.post('/signup',signup)
router.post('/signin',signin)

module.exports=router