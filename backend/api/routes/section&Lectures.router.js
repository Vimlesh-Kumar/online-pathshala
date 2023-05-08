const router = require('express').Router();
const sectionLectureController=require('../controller/section&Lectures.controller')
const authuser = require('../../middlewares/token_validation')


const { google } = require('googleapis')
const google_API_Folder_ID = '1-vZD_0PPbk9JJd3k99-sAa8vA8QZ8L6w'

const { Readable } = require('stream')

const auth = new google.auth.GoogleAuth({
    keyFile: './googlekey.json',
    scopes: ['https://www.googleapis.com/auth/drive']
})

const drive = google.drive({ version: 'v3', auth });



router.post('/lectures/upload', authuser.checkToken, async (req, res) => {
    // console.log(req)
    try {

        const media = {
            mimeType: 'application/octet-stream',
            body: Readable.from(Buffer.from(req.body.content.split(',')[1], 'base64'))
        };
        const fileMetaData = {
            'name': req.body.name || 'vim.mp4',
            'parents': [google_API_Folder_ID]
        }
        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });
        // console.log(response.data.id)
        return res.json({
            video_id:response.data.id,
            message:'Uploaded Successfully!!'
        })
    } catch (error) {
        console.log(error, "!!!!!!!!!!!!!!!!!")
    }

})

router.post('/save',authuser.checkToken,sectionLectureController.sectionLectures)

module.exports = router;