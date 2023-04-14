const userModel = require('./user.services')
const bcrypt=require('bcrypt')

const signup = async (req, res) => {
    const body=req.body;
    body.password=await bcrypt.hash(body.password,10)
    console.log(body)
    // Sending data to user service
    console.log(typeof (body.created_at) )
    userModel.create(body,(err,results)=>{
        if(err){
            console.log(err);
            return res.status(500).json({
                message:"Database connection error......."
            })
        }
        return res.status(200).json({
            data:results
        })
    })
}

const signin = (req, res) => {

}

module.exports={signin,signup}