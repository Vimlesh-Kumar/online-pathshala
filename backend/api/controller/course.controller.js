const courseServices = require('../services/course.service');
const enrollmentServices = require('../services/enrollment.services')

module.exports = {

    addCourse: async (req, res) => {
        const body = req.body;
        // console.log(body)
        courseServices.addCourseInDB(body, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: "Unable to insert course details..."
                })
            }
            const enrollmentDetails = {
                course_id: result.insertId,
                user_id: req.user.id
            }
            // console.log(enrollmentDetails)
            enrollmentServices.enrolling(enrollmentDetails)
            return res.status(200).json({
                data: result,
                // enrolllll:this.enroll,
                message: "Course Added & course_id and user_id added in enrollment table"

            })
        })
    },
    allcourseByUserId: async (req, res) => {
        const id = req.user.id
        // console.log(id)
        courseServices.courseByUserId(id, (err, courses) => {
            if (err) {
                return res.status(404).json({
                    message: "No any course found by user id."
                })
            }
            return res.status(200).json({
                courses: courses,
                message: "User's All Courses.."
            })
        })
    },
    allCOURSES: async (req, res) => {
        courseServices.allCourses((err, courses) => {
            if (err) {
                return res.status(500).json({
                    message: "Error in finding all courses."
                })
            }
            return res.status(200).json({
                courses: courses,
                message: "All courses from database."
            })
        })
    },

    courseByCourseId: async (req, res) => {
        // console.log(req.params)
        courseServices.courseById(req.params.id, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: "Course Not found!!"
                })
            }
            return res.status(200).json({
                message: "Course found by its own id",
                course: result
            })
        })
    }
}