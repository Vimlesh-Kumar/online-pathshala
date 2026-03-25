import jwt from 'jsonwebtoken';
import { sendError } from '../api/utils/apiResponse.js';

const SECRET_KEY = process.env.JWT_SECRET || "MYSECRETKEYFORJWT";

const auth = {
    /**
     * Validate bearer tokens and attach the decoded user payload to the request.
     */
    checkToken(req, res, next) {
        let token = req.get("authorization");
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
            jwt.verify(token, SECRET_KEY, (err, decoded) => {
                if (err) {
                    return sendError(res, {
                        statusCode: 403,
                        message: "Invalid token.",
                        errors: { token: 'Invalid' }
                    });
                } else {
                    req.user = decoded;
                    next();
                }
            });
        } else {
            return sendError(res, {
                statusCode: 403,
                message: "Access denied. Unauthorized user."
            });
        }
    }
};

export default auth;
