import express from 'express'
import User from '../models/user.model.js'
import Order from '../models/order.model.js'

const router=express.Router()

router.get('/',async(req,res)=>{
    const orders=await Order.find()
    res.status(200).send(orders)
})

router.post('/',async(req,res)=>{
    const {orders}=req.body
    let duplicate=false
    const orderIds=orders.map((order=>order.entity_id))
    const orderIdsDb=await Order.distinct('entity_id')
    orderIdsDb.map(item=>{
        if(orderIds.includes(item)){
            duplicate=true
        }
    })
    if(duplicate){
        res.status(403).json("Cannot save duplicate orders. One or more orders are already present in db.")
    }
    else{
    if(orders.length>0){
    Order.insertMany([...orders], (err, docs) => {
        if(err){
            const key=Object.keys(err.errors)
            res.status(400).json(err._message+". "+err.errors[key[0]])
        }else{
            res.status(200).json("Orders Added Successfully")
        }
      })
    }else{
        res.status(403).json("No Orders to Add")
    }
    }
})

router.patch('/verify/:id',async(req,res)=>{
    const {id}=req.params
    const {userId,lastLogin,scanDate}=req.body.trail
    if(!userId || !lastLogin || !scanDate){
        res.status(400).json("Audit trail of order required containing userId,lastLogin and scanDate")
    }else{
        const user=await User.find({userId})
        if(!user.length>0){
            res.status(400).json("Invalid userId sent") 
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
            res.status(200).json("Order With Id "+id+" Verified")
            }
            if(err){
                res.status(503).json("Unable To Verify Order, Server Error")
            }
        })
    }else{
        res.status(404).json("No Order Found Against Given Id")
    }
}
}
})





export default router
