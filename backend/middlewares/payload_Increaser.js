// const bodyParser = require('body-parser');

// // Set the maximum payload size limit to 50MB
// const maxPayloadSize = '50mb';

// // Create a middleware function that sets the maximum payload size limit for a specific route
// const setMaxPayloadSizeForCourseUpload = (req, res, next) => {
//     console.log(req.body)
//     console.log('Vvvvvvvvvvvvv')
//     // bodyParser.json({ limit: maxPayloadSize })(req, res, err => {
//     //     if (err) {
//     //         return res.status(413).send('Payload Too Large');
//     //     }
//     //     console.log('aaaaaaaaaaaaa')
//     //     next();
//     // });
// };

// module.exports = {
//     setMaxPayloadSizeForCourseUpload
// };
