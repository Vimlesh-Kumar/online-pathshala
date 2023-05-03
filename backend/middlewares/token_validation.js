const { verify } = require("jsonwebtoken")
const SECRET_KEY = "MYSECRETKEYFORJWT"

const auth = {
    checkToken(req, res, next) {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7);
            verify(token, SECRET_KEY, (err, decoded) => {
                if (err) {
                    res.status(403).json({
                        message: "Invalid token.",
                        token:"Invalid"
                    })
                }
                else {
                    req.user=decoded.user
                    next();
                }
            })
        }
        else {
            res.status(403).json({
                message: "Access denied! unauthorized user."
            })
        }
    }
}


module.exports = auth