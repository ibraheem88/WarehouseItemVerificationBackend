import express from "express"
import bcrypt from 'bcrypt'
import User from '../models/user.model.js'
import Order from "../models/order.model.js"
import formidable from 'express-formidable'
import requireToken from "../middleware/requireToken.js";
import adminToken from '../middleware/requireAdminToken.js'
const router=express.Router()

const SALT_ROUNDS=10

const encryptPassword=async(password)=>{
    return bcrypt.genSalt(SALT_ROUNDS).then(salt=>{
        return bcrypt.hash(password,salt)
    }).then((hash)=>hash)
}

router.get("/",adminToken,async(req,res)=>{
    const users=await User.find()
    res.json({data: users,message: "Users Loaded Successfully",
    status: 200})
})

router.get("/detail/:id",requireToken,async(req,res)=>{
    const {id}=req.params
    let user
    user=await User.findOne({userId:id})
    if(user){
        res.json({data: user,message: "User Detail Loaded Successfully",
        status: 200})
    }else{
        res.json({data: {},message: "User Not Found",
        status: 404})
    }
})

router.delete("/:id",adminToken,async(req,res)=>{
    const {id}=req.params
    let user
    user=await User.findOne({userId: id})
    if(user){
        await user.delete()
        res.json({data: {},message: "User Deleted",
        status: 200})
    }else{
        res.json({data: {},message: "User Not Found",
        status: 404})
    }
})

router.get('/orders',requireToken,async(req,res)=>{
    const {id}=req
    const user=await User.findOne({userId:id})
    if(user){
        const orders=await Order.find({entity_id: {$in: user.assignedOrders}})
        res.json({data:orders,message:"Orders Assigned Loaded",status:200})
    }else{
        res.json({data: {},message:"User not found",status:404}) 
    }
})

router.get('/orders/:orderId',requireToken,async(req,res)=>{
    const {orderId}=req.params
    const {id}=req
    const user=await User.findOne({userId:id})
    if(user){
        const order=await Order.findOne({$and: [
            {entity_id: {$in: user.assignedOrders}},
            {entity_id: {$in: orderId}}
        ]
        })
        if(order){
            res.json({data: order,message: "Order is assigned",status:200})
        }else{
            res.json({data: false,message: "Order not assigned",status:200})
        }
    }else{
        res.json({data: {},message:"User not found",status:404}) 
    }
})

router.patch('/orders',adminToken,async(req,res)=>{
    let {userId,orders=[]}=req.body
    let user,invalidIds=false
    const assignedOrders=await User.find({ assignedOrders : { $elemMatch :{$in : orders} }}, { _id: 1})
    if(assignedOrders.length>0){
        res.json({data: {},message: "Cannot assign one order to multiple users. One or more orders already assigned",status:400})
    }
    else{
    const orderIdDb=await Order.distinct('entity_id')
    orders.map((order)=>{
    if(!orderIdDb.includes(order)){
        invalidIds=true
    }
    })
    if(invalidIds){
         res.json({data:{},message:"Invalid Order Ids Passed!",status:400})
    }else{
    user=await User.findOne({userId})
    if(user){
    await user.updateOne({ $push: { assignedOrders: [...orders] } })
    res.json({data: {},message:"Orders Assigned To User",status:200})
    }
    else{
        res.json({data: {},message:"Invalid User Id",status:403})
    }
}
    }
})

router.patch('/',adminToken,async(req,res)=>{
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
                res.json({data: {},message: "Record for user updated successfully",
                status: 200})
            })
        }
    })
    }
    else{
        res.json({data: {},message: "User record not found",
        status: 404})
    }
})

router.post('/',adminToken,formidable(),async(req,res)=>{
const {name,password,canVerify,userId}=req.fields

if(userId && password){
    const userExists=await User.findOne({userId})
    if(userExists){
        res.json({data: {},message: "UserId already exists",
        status: 409})
    }else{
let encryptedPassowrd=await encryptPassword(password)
const user=new User({
    userId: userId,
    name: name ? name : '',
    role:2,
    password: encryptedPassowrd,
    assignedOrders: [],
    canVerify: canVerify ? canVerify : true
})
user.save().then((user)=>{
    res.json({data: {},message: `User with id#${user.userId} added`,
    status: 200})}
    ).catch(err=>console.log(err))}}
else{
    res.json({data: {},message: `User id and password required for registration`,
    status: 400})
}
})

export default router