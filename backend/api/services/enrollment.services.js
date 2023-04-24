const pool=require('../../database/database')

module.exports={
    enrolling:(data,callback)=>{
        pool.query('insert into enrollment(is_completed,course_id,user_id) values(true,?,?)',
        [
            data.course_id,
            data.user_id
        ],(error,result)=>{
            if(error){
                console.log(error)
                return callback(error)
            }
            return callback(null,result)
        })
    }
}