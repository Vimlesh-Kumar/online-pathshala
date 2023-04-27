const userModel = require('../services/user.services');
const bcrypt = require('bcrypt');
const compareSync = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const SECRET_KEY = "MYSECRETKEYFORJWT"

// User Registration
const signup = async (req, res) => {
    const body = req.body;

    // Hash Password
    body.password = await bcrypt.hash(body.password, 10)

    // Sending data to user service for inserting into Users table
    userModel.create(body, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database connection error......."
            })
        }
        return res.status(200).json({
            data: results
        })
    })
}

// User Sign-in
const signin = async (req, res) => {
    const body = req.body;
    const user = await userModel.getUserByEmail(body.email, async (err, user) => {
        if (err) {
            console.log(err)
        }
        if (!user) {
            // console.log(user)
            return res.status(404).json({
                data: "User not found........"
            })
        }
        const passwordCheck = await bcrypt.compare(body.password, user.password);
        if (passwordCheck) {
            user.password = null;
            const jsontoken = jwt.sign({ user: user }, SECRET_KEY, { expiresIn: "1h" });
            return res.json({
                user: user,
                message: "Login successfully and token generated.",
                token: jsontoken
            })
        }
        else {
            return res.status(403).json({
                Message: 'Wrong Password'
            })
        }
    })

}

const userById = async (req, res) => {
    // console.log(req.headers)
    // console.log(req.user)

    userModel.getUserById(req.user.id, (err, user) => {
        if (err) {
            console.log(err)
            return;
        }
        if (!user) {
            return res.json({
                message: 'User not found by user ID'
            })
        }
        else {
            user.password = null
            return res.json({
                message: "User found by its own ID",
                user: user
            })
        }

    })
}



module.exports = { signin, signup, userById }