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
    const user = await userModel.getUserByEmail(body.email, async (err, user) => {
        if (err) {
            console.log(err)
        }
        if (!user) {
            console.log(user)
            return res.status(404).json({
                data: "User not found........"
            })
        }
        const passwordCheck = await bcrypt.compare(body.password, user.password);
        // console.log((passwordCheck))
        if (passwordCheck) {
            user.password=null;
            const jsontoken = jwt.sign({ user: user }, SECRET_KEY);
            return res.json({
                // user: user,
                token: jsontoken
            })
        }
        else{
            return res.status(403).json({
                Message:'Wrong Password'
            })
        }
    })

}

module.exports = { signin, signup }