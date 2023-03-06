import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export default (req,res,next)=>{
    const {authorization}=req.headers
    if(!authorization){
        return res.json({message: "Authorization Token Needed",status: 401,data: {}})
    }
    const token=authorization.replace("Bearer ","")
    jwt.verify(token,process.env.JWT_SECRET,async (err,payload)=>{
        if(err){
        return res.json({message: "Invalid Authorization Token",status: 403,data: {}})   
        }
        const {userId}=payload
        req.id=userId
        next()
    })
}