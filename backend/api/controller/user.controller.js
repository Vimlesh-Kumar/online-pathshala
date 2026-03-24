import * as userService from '../services/user.services.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET || "MYSECRETKEYFORJWT";

// User Registration
export const signup = async (req, res) => {
    try {
        const body = req.body;
        // Hash Password
        body.password = await bcrypt.hash(body.password, 10);

        // Sending data to user service
        const results = await userService.create(body);
        return res.status(200).json({
            data: results
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Database connection error or user already exists."
        });
    }
};

// User Sign-in
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (passwordCheck) {
            user.password = undefined; // Hide password
            const token = jwt.sign({ id: user.id, email: user.email, role: user.user_role }, SECRET_KEY, { expiresIn: "1h" });
            return res.status(200).json({
                user: user,
                message: "Login successful.",
                token: token
            });
        } else {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error during signin."
        });
    }
};

export const userById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }
        user.password = undefined;
        return res.status(200).json({
            message: "User found.",
            user: user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error fetching user details."
        });
    }
};