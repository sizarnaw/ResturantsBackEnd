import mongoose from "mongoose";
import { Schema } from "mongoose";

const productSchema= new Schema({
    id:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type: String
    },
    price:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        required: true
    }


    
})

export default mongoose.model('products',productSchema);