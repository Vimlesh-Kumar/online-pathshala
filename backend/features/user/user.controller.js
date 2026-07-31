import * as userService from './user.services.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { sendError, sendSuccess } from '../../utils/apiResponse.js';
import { uploadFile, downloadFile, deleteFile, listFiles } from '../../utils/blob.service.js';
import { Readable } from 'stream';

const SECRET_KEY = process.env.JWT_SECRET;

const formatUserAvatar = (user, req) => {
    if (user && user.avatar_url && user.avatar_url.includes('.private.blob.vercel-storage.com')) {
        const host = req.get('host');
        if (!user.avatar_url.includes(`/user/avatar-file`)) {
            user.avatar_url = `${req.protocol}://${host}/user/avatar-file?url=${encodeURIComponent(user.avatar_url)}`;
        }
    }
    return user;
};

const cleanUserBlobFolder = async (userId, keepUrl = null) => {
    try {
        const prefix = `users/${userId}/`;
        console.log(`Scanning Vercel Blob folder: ${prefix} for cleanup...`);
        const { blobs } = await listFiles({ prefix });
        if (blobs && blobs.length > 0) {
            let urlsToDelete = blobs.map(b => b.url);
            if (keepUrl) {
                urlsToDelete = urlsToDelete.filter(url => url !== keepUrl);
            }
            if (urlsToDelete.length > 0) {
                console.log(`Purging old blobs for user ${userId}:`, urlsToDelete);
                await deleteFile(urlsToDelete);
                console.log('✅ Purge complete.');
            }
        }
    } catch (err) {
        console.error(`Failed to clean up blob folder for user ${userId}:`, err);
    }
};

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
            formatUserAvatar(user, req);
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
        formatUserAvatar(user, req);

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

        // If avatar_url is a proxy URL, extract the raw private Vercel Blob URL before saving
        if (body.avatar_url && body.avatar_url.includes('/user/avatar-file?url=')) {
            try {
                const urlObj = new URL(body.avatar_url, `${req.protocol}://${req.get('host')}`);
                const rawUrl = urlObj.searchParams.get('url');
                if (rawUrl) {
                    body.avatar_url = rawUrl;
                }
            } catch (e) {
                console.error('Failed to parse avatar proxy URL during profile update:', e);
            }
        }

        const updatedUser = await userService.updateProfile(userId, body);
        
        // Clean up orphaned or unused custom avatars in Vercel Blob
        if (updatedUser.avatar_url && updatedUser.avatar_url.includes('.private.blob.vercel-storage.com')) {
            // Keep only the active Vercel Blob URL, purge all others in users/${userId}/
            await cleanUserBlobFolder(userId, updatedUser.avatar_url);
        } else {
            // User is using a preset or external avatar, delete all custom avatar blobs
            await cleanUserBlobFolder(userId);
        }

        updatedUser.password = undefined;
        formatUserAvatar(updatedUser, req);

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
        const userId = req.user.id;
        const { image } = req.body;
        if (!image) {
            return sendError(res, {
                statusCode: 400,
                message: 'No image data provided.'
            });
        }

        // Clean up any old custom avatar files in the user's folder before uploading a new one.
        // This prevents orphaned files if a user uploads multiple images in a row without saving.
        await cleanUserBlobFolder(userId);

        // Convert base64 data to Buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `users/${userId}/avatar-${Date.now()}.jpg`;

        console.log(`Uploading avatar to Vercel Blob under users/${userId}/...`);
        const blob = await uploadFile(filename, buffer);

        if (!blob || !blob.url) {
            throw new Error('Vercel Blob upload failed to return a URL.');
        }

        console.log(`✅ Avatar uploaded successfully: ${blob.url}`);
        const proxyUrl = `${req.protocol}://${req.get('host')}/user/avatar-file?url=${encodeURIComponent(blob.url)}`;
        return sendSuccess(res, {
            message: 'Image uploaded successfully.',
            data: { url: proxyUrl }
        });
    } catch (err) {
        console.error('Avatar upload failed:', err);
        return sendError(res, {
            statusCode: 500,
            message: 'Failed to upload image. Please try again.'
        });
    }
};

/**
 * Proxy route to serve private Vercel Blob files.
 */
export const getAvatarFile = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return sendError(res, { statusCode: 400, message: 'URL is required.' });
        }

        // Validate the URL belongs to Vercel private blob storage to avoid open proxying
        if (!url.includes('.private.blob.vercel-storage.com')) {
            return sendError(res, { statusCode: 400, message: 'Invalid URL origin.' });
        }

        const blob = await downloadFile(url);
        
        res.setHeader('Content-Type', blob.contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        const nodeStream = Readable.fromWeb(blob.stream);
        return nodeStream.pipe(res);
    } catch (err) {
        console.error('Error fetching private blob:', err);
        return sendError(res, { statusCode: 500, message: 'Failed to retrieve avatar file.' });
    }
};
