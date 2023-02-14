import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
dotenv.config()
import user_routes from './routes/users.js'
import auth_routes from './routes/auth.js'
import order_routes from './routes/orders.js'

const app=express()
const PORT=6000

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser: true})

app.use(express.json())
app.use('/users',user_routes)
app.use('/orders',order_routes)
app.use('/auth',auth_routes)

app.listen(PORT,()=>{
    console.log("Server Running on Port: "+PORT)
})