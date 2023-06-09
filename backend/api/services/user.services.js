const pool = require('../../database/database')

module.exports = {

    // inserting user data into users table at signup
    create: (data, callback) => {
        pool.query(`insert into users(full_name,email,password,user_role) values(?,?,?,?)`,
            [
                data.full_name,
                data.email,
                data.password,
                data.user_role
            ],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                return callback(null, result)
            }
        )
    },


    // Finding user by email from databse
    getUserByEmail: (email, callback) => {
        pool.query(`select * from users where email=?`, [email],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result[0])
                return callback(null, result[0])
            })
    },

    // // find user
    getUserById: (id, callback) => {
        pool.query(`select * from users where id=?`, [id],
            (error, result) => {
                if (error) {
                    return callback(error)
                }
                // console.log(result)
                return callback(null, result[0])
            })
    }


}