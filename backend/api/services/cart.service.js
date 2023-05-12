const pool = require('../../database/database')

module.exports = {
    addCartDetailsInDB: (data, callback) => {
        const sql = 'insert into cart (course_id,user_id) values(?,?)'
        pool.query(sql,
            [
                data.course_id,
                data.user_id
            ],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result)
                return callback(null, result)
            })
    },

    userCartCourse: (user_id, callback) => {
        const sql = 'select * from courses join cart on cart.course_id=courses.id where cart.user_id=?'
        pool.query(sql, [user_id], (error, result) => {
            if (error) {
                return callback(error)
            }
            // console.log(result)
            return callback(null, result)
        })
    }
}