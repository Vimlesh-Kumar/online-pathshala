const pool = require('../../database/database')

module.exports = {

    // inserting user data into users table at signup
    create: (data, callback) => {
        pool.query(`insert into users(created_at,full_name,email,password,user_role) values(now(),?,?,?,?)`,
            [
                data.full_name,
                data.email,
                data.password,
                data.user_role
            ],
            (error,result,fields)=>{
                if(error){
                    return callback(error)
                }
                // console.log(data)
                return callback(null,result)
            }
        )
    },

    getUserByEmail:(email,callback)=>{
        pool.query(`select * from users where email=?`,[email],()=>{
            
        })
    }
}