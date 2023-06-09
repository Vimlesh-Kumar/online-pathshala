const pool = require('../../database/database')

module.exports = {
    addingObjectivesInDB: (objectives, callback) => {
        // console.log(items);
        pool.query(`insert into course_objectives (objective,course_id) values ?`,
            [objectives],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                console.log(result)
                return callback(null, result)
            });
    },

    gettingObjectivesFromDB: (course_id, callback) => {
        pool.query(`select * from course_objectives where course_id=?`, [course_id],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result)
                return callback(null, result)
            })
    },

    updateObjectiveInDB: (data, callback) => {
        const sql = 'UPDATE course_objectives set objective=? WHERE id=?';
        pool.query(sql, [data.objective, data.id],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result)
                return callback(null, result)
            })
    },

    deleteObj: (id, callback) => {
        const sql = 'DELETE FROM course_objectives WHERE id=?';
        pool.query(sql, [id],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result)
                return callback(null, result)
            })
    }
}