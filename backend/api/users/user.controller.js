const userModel = require('./user.services')
const bcrypt = require('bcrypt')
const compareSync = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "MYKEYFORJWT"

const signup = async (req, res) => {
    const body = req.body;
    body.password = await bcrypt.hash(body.password, 10)
    // Sending data to user service
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

const signin = async (req, res) => {
    const body = req.body;
    const user = await userModel.getUserByEmail(body.email, (err, user) => {
        if (err) {
            console.log(err)
        }
        console.log(user)
        const a=user.length
        if (a===0) {
            console.log(user)
            return res.json({
                data: "User not found........"
            })
        }
        const passwordCheck = bcrypt.compare(body.password, user.password);
        // console.log((passwordCheck))
        if (passwordCheck) {
            const jsontoken = jwt.sign({ user: user }, SECRET_KEY);
            return res.json({
                user: user,
                token: jsontoken
            })
        }
    })

}

module.exports = { signin, signup }