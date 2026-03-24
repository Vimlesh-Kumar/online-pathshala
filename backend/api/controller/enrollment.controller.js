import * as enrollmentServices from '../services/enrollment.services.js';

export const enrollment = async (req, res) => {
    try {
        const body = req.body;
        const result = await enrollmentServices.enrolling(body);
        return res.status(200).json({
            data: result,
            message: "Enrollment Success!!"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to insert Enrollment details."
        });
    }
};