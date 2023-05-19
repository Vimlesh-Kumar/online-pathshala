const pool = require('../../database/database')

module.exports = {

    // Adding a course in databse
    addCourseInDB: (data, callback) => {
        pool.query(`insert into courses(author,category,price,subtitle,thumb_url,title) values(?,?,?,?,?,?)`,
            [
                data.author,
                data.category,
                data.price,
                data.subtitle,
                data.thumb_url,
                data.title
            ], (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result)
                return callback(null, result)
            }
        )
    },

    // All courses by user's id
    courseByUserId: (id, callback) => {
        pool.query(`select courses.* from courses inner join enrollment on courses.id=enrollment.course_id inner join users on users.id=enrollment.user_id where users.id=?`, [id], (error, result) => {
            if (error) {
                return callback(error)
            }
            return callback(null, result)
        })
    },

    // Finding all courses from databse
    allCourses: (callback) => {
        pool.query(`select * from courses`, (error, result) => {
            if (error) {
                return callback(error)
            }
            return callback(null, result)
        })
    },

    // course by course-id
    courseById: (id, callback) => {
        pool.query(`select * from courses where id=?`, [id], (error, result) => {
            if (error) {
                return callback(error)
            }
            return callback(null, result[0])
        })
    },

    coursesByCategory:(category,callback)=>{
        const sql='SELECT * FROM courses where category=?';
        pool.query(sql, [category], (error, result) => {
            if (error) {
                return callback(error)
            }
            return callback(null, result)
        })
    },

    // user by courseID
    tutorByCourseId: (id, callback) => {
        pool.query(`select users.id from users inner join enrollment on users.id=enrollment.user_id where enrollment.course_id=? and users.user_role='Tutor'`,
            [id], (error, result) => {
                if (error) {
                    return callback(error)
                }
                if (result) {
                    // console.log(result[0])
                    return callback(null, result[0])

                }
            })
    }
}