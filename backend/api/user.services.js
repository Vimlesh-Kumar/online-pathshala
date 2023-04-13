const pool = require('../database/database')

module.exports = {
    create: (data, callback) => {
        pool.query(`insert into users(created_at,full_name,email,password,user_role)
            values(?,?,?,?,?)`,
            [
                data.created_at,
                data.full_name,
                data.email,
                data.password,
                data.user_role
            ],
            (error,result,fields)=>{
                if(error){
                    return callback(error)
                }
                return callback(null,result)
            }
        )
    }
}