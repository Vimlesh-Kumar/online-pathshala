import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET || "MYSECRETKEYFORJWT";

const auth = {
    checkToken(req, res, next) {
        let token = req.get("authorization");
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
            jwt.verify(token, SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.status(403).json({
                        message: "Invalid token.",
                        token: "Invalid"
                    });
                } else {
                    // Decoded contains { id, email, role } based on my update in controller
                    req.user = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).json({
                message: "Access denied! Unauthorized user."
            });
        }
    }
};

export default auth;