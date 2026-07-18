import express from 'express';
const router = express.Router();
import * as sectionLectureController from '../controller/sectionLectures.controller.js';
import authuser from '../../middlewares/token_validation.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { google } from 'googleapis';
import { Readable } from 'node:stream';
import { existsSync } from 'node:fs';

const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID || '1-vZD_0PPbk9JJd3k99-sAa8vA8QZ8L6w';
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Build the Google Drive client lazily so the server boots even when no
 * credentials are configured. Credentials can come from either:
 *   - GOOGLE_CREDENTIALS env var (full service-account JSON string), or
 *   - a local ./googlekey.json file (dev only — never commit it).
 * Returns null when neither is present.
 */
let driveClient;
function getDrive() {
    if (driveClient !== undefined) return driveClient;

    let authOptions = null;
    if (process.env.GOOGLE_CREDENTIALS) {
        authOptions = { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS), scopes: DRIVE_SCOPES };
    } else if (existsSync('./googlekey.json')) {
        authOptions = { keyFile: './googlekey.json', scopes: DRIVE_SCOPES };
    }

    driveClient = authOptions
        ? google.drive({ version: 'v3', auth: new google.auth.GoogleAuth(authOptions) })
        : null;
    return driveClient;
}

router.post('/lectures/upload', authuser.checkToken, async (req, res) => {
    try {
        const drive = getDrive();
        if (!drive) {
            return sendError(res, {
                statusCode: 503,
                message: 'Video upload is not configured. Set GOOGLE_CREDENTIALS to enable it.'
            });
        }

        if (!req.body?.content) {
            return sendError(res, {
                statusCode: 400,
                message: 'Lecture content is required.'
            });
        }

        const media = {
            mimeType: 'application/octet-stream',
            body: Readable.from(Buffer.from(req.body.content.split(',')[1], 'base64'))
        };
        const fileMetaData = {
            'name': req.body.name || 'vim.mp4',
            'parents': [GDRIVE_FOLDER_ID]
        };
        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });

        return sendSuccess(res, {
            message: 'Uploaded successfully.',
            data: {
                video_id: response.data.id
            }
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return sendError(res, {
            statusCode: 500,
            message: 'Upload failed.'
        });
    }
});

router.post('/save', authuser.checkToken, sectionLectureController.sectionLectures);
router.get('/all-sections', authuser.checkToken, sectionLectureController.allSectionForTutur);

export default router;
