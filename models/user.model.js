import mongoose from "mongoose";
const Schema=mongoose.Schema

const userSchema=new Schema({
    userId: {type:String,required: true},
    name: String,
    password: {type:String,required: true},
    role: {type: Number,required: true},
    assignedOrders: [String],
    canVerify: Boolean
})

const User=mongoose.model('User',userSchema) 
export default User