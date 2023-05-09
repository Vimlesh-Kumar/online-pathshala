const pool = require('../../database/database')

module.exports = {
    addLectures: (allLectures, callback) => {
        pool.query(`insert into lesson (lesson_name,duration,video_key,section_name,course_id) values ?`, 
        [allLectures], (error, result) => {
            if (error) {
                return callback(error)
            }
            console.log(result)
            return callback(null, result)
        })
    },

    allSectionsbycourseId:(id,callback)=>{
        const sql='SELECT * FROM lesson where course_id=?'
        pool.query(sql, [id], (error, result) => {
            if (error) {
                return callback(error)
            }
            console.log(result)
            return callback(null, result)
        })
    }
}