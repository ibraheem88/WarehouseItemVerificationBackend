import express from "express"
import bcrypt from 'bcrypt'
import User from '../models/user.model.js'
import Order from "../models/order.model.js"
const router=express.Router()

const SALT_ROUNDS=10

const encryptPassword=async(password)=>{
    return bcrypt.genSalt(SALT_ROUNDS).then(salt=>{
        return bcrypt.hash(password,salt)
    }).then((hash)=>hash)
}

router.get("/",async(req,res)=>{
    const users=await User.find()
    res.status(200).json(users)
})

router.get("/:id",async(req,res)=>{
    const {id}=req.params
    let user
    user=await User.findOne({userId:id})
    if(user){
        res.status(200).json(user)
    }else{
        res.status(404).json("User not found")
    }
})

router.delete("/:id",async(req,res)=>{
    const {id}=req.params
    let user
    user=await User.findOne({userId: id})
    if(user){
        await user.delete()
        res.status(200).json("User Deleted")
    }else{
        res.status(404).json("User not found")
    }
})

router.patch('/orders',async(req,res)=>{
    let {userId,orders}=req.body
    let user,invalidIds=false
    const assignedOrders=await User.find({ assignedOrders : { $elemMatch :{$in : orders} }}, { _id: 1})
    if(assignedOrders.length>0){
        res.status(403).json("Cannot assign one order to multiple users. One or more orders already assigned")
    }
    else{
    const orderIdDb=await Order.distinct('entity_id')
    orders.map((order)=>{
    if(!orderIdDb.includes(order)){
        invalidIds=true
    }
    })
    if(invalidIds){
         res.status(403).json("Invalid Order Ids Passed!")
    }else{
    user=await User.findOne({userId})
    if(user){
    await user.updateOne({ $push: { assignedOrders: [...orders] } })
    res.status(200).json("Orders Assigned To Users")
    }
    else{
        res.status(403).json("Invalid User Id")
    }
}
    }
})

router.patch('/',async(req,res)=>{
    const {userId,username,password,canVerify,assignedOrders,name}=req.body
    let user
    user=await User.findOne({userId})
    if(user){
    const updatedProperties={
        username: username ? username : user.username,
        name: name ? name :user.name,
        password: password ? password: user.password,
        canVerify: canVerify!==undefined ? canVerify : user.canVerify,
        assignedOrders: assignedOrders ? assignedOrders : user.assignedOrders
    }
    User.findOneAndUpdate({userId},updatedProperties,{new: true}).exec((err,editedUser)=>{
        if(err){
            res.json(err.message)
        }else{
            editedUser.save().then(()=>{
                res.status(200).json("Record for User Updated Successfully")
            })
        }
    })
    }
    else{
        res.status(404).json("Record for User Not Found")
    }
})

router.post('/',async(req,res)=>{
const {name,password,canVerify,userId}=req.body

if(userId && password){
    const userExists=await User.findOne({userId})
    if(userExists){
        res.status(403).json("User Id Already Exists!")
    }else{
let encryptedPassowrd=await encryptPassword(password)
const user=new User({
    userId: userId,
    name: name ? name : '',
    password: encryptedPassowrd,
    assignedOrders: [],
    canVerify: canVerify ? canVerify : true
})
user.save().then((user)=>{
    res.json("User with id "+user.userId+" Added")}
    ).catch(err=>console.log(err))}}
else{
    res.status(403).json("User Id and Password Required To Register New User!")
}
})

export default router