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

    allSectionsbycourseId: (id, callback) => {
        // pool.query(`select distinct (section_name) from lesson where course_id=?`, [id], (err, sections) => {
        //     console.log(sections[0].section_name)
        // })
        // const sections=[this.sections]
        // console.log(sections)
        const sql = 'SELECT * FROM lesson where course_id=?'
        pool.query(sql, [id], (error, result) => {
            if (error) {
                return callback(error)
            }
            // console.log(result)
            return callback(null, result)
        })
    }
}