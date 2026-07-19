import * as userService from './user.services.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';
import { put } from '@vercel/blob';

const SECRET_KEY = process.env.JWT_SECRET;

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

/**
 * Update the user's profile details.
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const body = req.body;

        if (!body.full_name || !body.email) {
            return sendError(res, {
                statusCode: 400,
                message: 'Name and email are required.'
            });
        }

        // Check if email is already taken by someone else
        const existingUser = await userService.getUserByEmail(body.email);
        if (existingUser && existingUser.id !== userId) {
            return sendError(res, {
                statusCode: 400,
                message: 'This email is already in use by another account.'
            });
        }

        const updatedUser = await userService.updateProfile(userId, body);
        updatedUser.password = undefined;

        return sendSuccess(res, {
            message: 'Profile updated successfully.',
            data: updatedUser
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Server error updating profile details.'
        });
    }
};

/**
 * Update the user's password.
 */
export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return sendError(res, {
                statusCode: 400,
                message: 'Old password and new password are required.'
            });
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            return sendError(res, {
                statusCode: 404,
                message: 'User not found.'
            });
        }

        const passwordCheck = await bcrypt.compare(oldPassword, user.password);
        if (!passwordCheck) {
            return sendError(res, {
                statusCode: 400,
                message: 'Invalid current password.'
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await userService.updatePassword(userId, hashedNewPassword);

        return sendSuccess(res, {
            message: 'Password updated successfully.'
        });
    } catch (err) {
        console.error(err);
        return sendError(res, {
            statusCode: 500,
            message: 'Server error updating password.'
        });
    }
};

/**
 * Upload profile picture to Vercel Blob.
 */
export const uploadAvatar = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return sendError(res, {
                statusCode: 400,
                message: 'No image data provided.'
            });
        }

        // Convert base64 data to Buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `users/avatar-${Date.now()}.jpg`;

        console.log('Uploading avatar to Vercel Blob...');
        const blob = await put(filename, buffer, {
            access: 'private',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        if (!blob || !blob.url) {
            throw new Error('Vercel Blob upload failed to return a URL.');
        }

        console.log(`✅ Avatar uploaded successfully: ${blob.url}`);
        return sendSuccess(res, {
            message: 'Image uploaded successfully.',
            data: { url: blob.url }
        });
    } catch (err) {
        console.error('Avatar upload failed:', err);
        return sendError(res, {
            statusCode: 500,
            message: 'Failed to upload image. Please try again.'
        });
    }
};
