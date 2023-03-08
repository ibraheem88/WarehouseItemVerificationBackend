import express from 'express'
import User from '../models/user.model.js'
import Order from '../models/order.model.js'
import requireAdminToken from '../middleware/requireAdminToken.js'
import requireToken from '../middleware/requireToken.js'

const router=express.Router()

router.get('/',requireAdminToken,async(req,res)=>{
    const orders=await Order.find()
    res.json({data:orders,message:"Orders Loaded Successfully",status:200})
})

router.post('/',requireAdminToken,async(req,res)=>{
    const {orders=[]}=req.body
    let duplicate=false
    const orderIds=orders.map((order=>order.entity_id))
    const orderIdsDb=await Order.distinct('entity_id')
    orderIdsDb.map(item=>{
        if(orderIds.includes(item)){
            duplicate=true
        }
    })
    if(duplicate){
        res.json({data: {},message:"Cannot save duplicate orders. One or more orders provided are already present in db.",status:400})
    }
    else{
    if(orders.length>0){
    Order.insertMany([...orders], (err, docs) => {
        if(err){
            const key=Object.keys(err.errors)
            res.json({data: {},message:err._message+". "+err.errors[key[0]],status:400})
        }else{
            res.json({data: {},message:"Orders Added Successfully",status:200})
        }
      })
    }else{
        res.json({data:{},message:"No Orders to Add",status:400})
    }
    }
})

router.patch('/verify/:id',requireToken,async(req,res)=>{
    const {id}=req.params
    const {userId,lastLogin,scanDate}=(req.body.trail) || {}
    if(!userId || !lastLogin || !scanDate){
        res.json({data:{},message:"Audit trail of order required containing userId,lastLogin and scanDate",status:400})
    }else{
        const user=await User.find({userId})
        if(!user.length>0){
            res.json({data:{},message:"Invalid userId sent in audit trail",status:400}) 
        }
        else{
    const order=await Order.findOne({entity_id:id})
    if(order){
        let trail={
            userId,lastLogin,scanDate
        }
        await order.updateOne({is_verified: true,trail})
        order.save((err,doc)=>{
            if(doc){
            res.json({data:{},message:"Order With Id "+id+" Verified",status:200})
            }
            if(err){
                res.json({data:{},message:"Unable To Verify Order, Server Error",status:503})
            }
        })
    }else{
        res.json({data:{},message:"No Order Found Against Given Id",status:403})
    }
}
}
})


router.patch('/:id/item/:itemId',requireToken,async(req,res)=>{
    const {id,itemId}=req.params
    const userId=req.id
    const user=await User.findOne({userId})
    if(user && user.assignedOrders.includes(id)){
    const order=await Order.updateOne({entity_id:id,"item.item_id": itemId},{
        $set:{
            'item.$.is_verified':true,
            'item.$.verified_by': userId
        }
    })
    if(order.matchedCount>0){
        res.json({data:{},message:"Item "+itemId+" verified",status:200})
    }else{
        res.json({data:{},message:"Cannot Verify. Invalid Order Id Or Item Id",status:400}) 
    }}
    else{
        res.json({data:{},message:"Cannot Verify. Order not assigned to this user",status:400})
    }
})


export default router
