import express from 'express';
const router = express.Router();
import * as sectionLectureController from '../controller/sectionLectures.controller.js';
import authuser from '../../middlewares/token_validation.js';
import { google } from 'googleapis';
import { Readable } from 'stream';

const google_API_Folder_ID = '1-vZD_0PPbk9JJd3k99-sAa8vA8QZ8L6w';

const auth = new google.auth.GoogleAuth({
    keyFile: './googlekey.json',
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

router.post('/lectures/upload', authuser.checkToken, async (req, res) => {
    try {
        const media = {
            mimeType: 'application/octet-stream',
            body: Readable.from(Buffer.from(req.body.content.split(',')[1], 'base64'))
        };
        const fileMetaData = {
            'name': req.body.name || 'vim.mp4',
            'parents': [google_API_Folder_ID]
        };
        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });
        return res.json({
            video_id: response.data.id,
            message: 'Uploaded Successfully!!'
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({ message: "Upload failed." });
    }
});

router.post('/save', authuser.checkToken, sectionLectureController.sectionLectures);
router.get('/all-sections', authuser.checkToken, sectionLectureController.allSectionForTutur);

export default router;