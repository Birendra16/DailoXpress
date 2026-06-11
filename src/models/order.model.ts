import mongoose from "mongoose";


interface IOrder{
    _id?:mongoose.Types.ObjectId
    user:mongoose.Types.ObjectId
    items:[
        {
            grocery:mongoose.Types.ObjectId,
            name:string,
            price:string,
            unit:string,
            image:string,
            quantity:number
        }
    ]
    isPaid:boolean,
    totalAmount:number,
    paymentMethod:"cod" | "online",
    transactionUuid?:string
    address:{
        fullName:string,
        mobile:string,
        city:string,
        state:string,
        pinCode:string,
        fullAddress:string,
        latitude:number,
        longitude:number

    }
    status:"pending" | "out of delivery" | "delivered",
    createdAt?:Date
    updatedAt?:Date
}

const orderSchema = new mongoose.Schema<IOrder>({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[
        {
            grocery:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Grocery",
                required:true
            },
            name:String,
            price:String,
            unit:String,
            image:String,
            quantity:Number,
        }
    ],
    paymentMethod:{
        type:String,
        enum:["cod","online"],
        default:"cod"
    },
    transactionUuid:{
        type:String,
        default:null
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    totalAmount:Number,
    address:{
        fullName:String,
        mobile:String,
        city:String,
        state:String,
        pinCode:String,
        fullAddress:String,
        latitude:Number,
        longitude:Number
    },
    status:{
        type: String,
        enum:["pending","out of delivery","delivered"],
        default:"pending"
    }
},{timestamps:true})

const Order = mongoose.models.Order || mongoose.model("Order",orderSchema)
export default Order