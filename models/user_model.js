const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email: {
        type:String,
        unique: true,
        required: true,
    },
    password:{
        type:String,
        required:true,
    },
    verified: Boolean

}, {timestamps: true});

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel