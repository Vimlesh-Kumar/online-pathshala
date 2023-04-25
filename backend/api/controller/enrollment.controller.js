const enrollmentServices = require('../services/enrollment.services')

module.exports = {
    enrollment: async (req, res) => {
        const body = req.body;
        // console.log(body)
        enrollmentServices.enrolling(body, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: "Unable to insert Enrollment details..."
                })
            }
            return res.status(200).json({
                data: result,
                message: "Enrollment Success!!"

            })
        })

    }
}