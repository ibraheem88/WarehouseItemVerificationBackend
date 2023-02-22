import express from "express"
import bcrypt from 'bcrypt'
import User from '../models/user.model.js'
import jsonwebtoken from "jsonwebtoken"
const router=express.Router()

const JWT_SECRET="UZIB"

const comparePassword=(password,hash='')=>{
    if(password?.length>0 && hash?.length>0){
    return bcrypt.compare(password,hash).then(password=>
        password)}
    else{
        return null
    }
   }

router.post('/login',async(req,res)=>{
const {userId,password}=req.body
let userExists;
userExists=await User.findOne({userId})

const passwordMatch=await comparePassword(password,userExists?.password)

if(userExists && passwordMatch){
    let token=jsonwebtoken.sign({userId},JWT_SECRET)
    res.status(200).json({token,userId: userExists.userId})
}
else{
    res.status(404).json("Invalid Username or Password")
}
})

export default router