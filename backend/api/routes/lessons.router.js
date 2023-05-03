const router = require('express').Router();
const { google } = require('googleapis')
const google_API_Folder_ID = '1-vZD_0PPbk9JJd3k99-sAa8vA8QZ8L6w'

const { Readable } = require('stream')

const auth = new google.auth.GoogleAuth({
    keyFile: './api/routes/googlekey.json',
    scopes: ['https://www.googleapis.com/auth/drive']
})

const drive = google.drive({ version: 'v3', auth });



router.post('/upload', async (req, res) => {
    // console.log(req.body)
    try {
        
        const media = {
            mimeType: 'application/octet-stream',
            body: Readable.from(Buffer.from(req.body.content.split(',')[1], 'base64'))
        };
        const fileMetaData = {
            'name': req.body.name || 'vim.mp4',
            'parents': [google_API_Folder_ID]
        }
        const response =await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });
        console.log(response.data.id)
    } catch (error) {
        console.log(error,"!!!!!!!!!!!!!!!!!")
    }

})

module.exports = router;