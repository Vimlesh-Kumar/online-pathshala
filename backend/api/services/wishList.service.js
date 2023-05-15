const pool = require('../../database/database');

module.exports = {
    addToWishList: (data, callback) => {
        const sql = 'INSERT INTO wishlist(course_id,user_id) VALUES(?,?)'
        pool.query(sql, [data.course_id, data.user_id], (error, result) => {
            if (error) {
                return callback(error)
            }
            // console.log(result)
            return callback(null, result)
        })
    },

    removewishlistCourseFromDB: (data, callback) => {
        const sql = 'DELETE FROM wishlist where course_id=? AND user_id=?';
        pool.query(sql, [data.course_id, data.user_id], (error, result) => {
            if (error) {
                return callback(error)
            }
            // console.log(result)
            return callback(null, result)
        })
    },

    allCoursesOfUserInWishlist: (id, callback) => {
        const sql ='SELECT course_id as id,author,category,price,rating,subtitle,thumb_url,title FROM courses JOIN wishlist on wishlist.course_id=courses.id where wishlist.user_id=?'
        pool.query(sql, [id], (error, result) => {
            if (error) {
                return callback(error)
            }
            // console.log(result)
            return callback(null, result)
        })
    }
}

