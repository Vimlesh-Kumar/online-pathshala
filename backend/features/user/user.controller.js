import * as userService from './user.services.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';

const SECRET_KEY = process.env.JWT_SECRET || "MYSECRETKEYFORJWT";

/**
 * Register a new user and save a hashed password.
 */
export const signup = async (req, res) => {
    try {
        const body = req.body;

        if (!body?.full_name || !body?.email || !body?.password || !body?.user_role) {
            return sendError(res, {
                statusCode: 400,
                message: 'full_name, email, password and user_role are required.'
            });
        }

        body.password = await bcrypt.hash(body.password, 10);
        const results = await userService.create(body);

        return sendSuccess(res, {
            statusCode: 201,
            message: 'User registered successfully.',
            data: results
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: "Database connection error or user already exists."
        });
    }
};

/**
 * Authenticate a user and return a signed JWT.
 */
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, {
                statusCode: 400,
                message: 'email and password are required.'
            });
        }

        const user = await userService.getUserByEmail(email);

        if (!user) {
            return sendError(res, {
                statusCode: 404,
                message: "User not found."
            });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (passwordCheck) {
            user.password = undefined;
            const token = jwt.sign({ id: user.id, email: user.email, role: user.user_role }, SECRET_KEY, { expiresIn: "1h" });

            return sendSuccess(res, {
                message: "Login successful.",
                data: {
                    user,
                    token
                }
            });
        }

        return sendError(res, {
            statusCode: 401,
            message: "Invalid credentials."
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: "Server error during signin."
        });
    }
};

/**
 * Fetch the currently authenticated user's profile.
 */
export const userById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return sendError(res, {
                statusCode: 404,
                message: 'User not found.'
            });
        }

        user.password = undefined;

        return sendSuccess(res, {
            message: "User found.",
            data: user
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: "Server error fetching user details."
        });
    }
};
