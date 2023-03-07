import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import formidable from 'express-formidable'
dotenv.config()
import user_routes from './routes/users.js'
import auth_routes from './routes/auth.js'
import order_routes from './routes/orders.js'

const app=express()
const PORT=6000

mongoose.set('strictQuery', true);
const call=async function(){
try {
    await mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true
    })
    console.log('mongoose connection: '+mongoose.connection.readyState);
    
} catch (error) {
    console.log("error ====>", error )    
}
}
await call()


app.use(express.json())
app.use(formidable())
// app.use('/',(req,res)=>{
//     res.json("Grape")
// })
app.use('/users',user_routes)
app.use('/orders',order_routes)
app.use('/auth',auth_routes)

app.listen(PORT,()=>{
    console.log("Server Running on Port: "+PORT)
})