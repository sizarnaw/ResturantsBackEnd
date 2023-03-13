import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema= new Schema({
    id:{
        type: String
    }, 
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    permission:{
        type: String
    },
});

export default mongoose.model('users',userSchema);