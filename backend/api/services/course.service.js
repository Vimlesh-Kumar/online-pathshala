const pool = require('../../database/database')

module.exports = {
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
                return callback(null, result)
            }
        )
    },
    allCourseById: (id, callback) => {
        pool.query(`select * from courses where id=?`, [id], (error, result) => {
            if(error)
            {
                return callback(error)
            }
            return callback(null,result)
        })
    }
}