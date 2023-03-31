const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../configs")
const mongoose = require("mongoose")
const UserModel = require("../models/user_model")

module.exports = (req, res, next) =>{
    const { authorization } = req.headers

    if(!authorization){
        return res.status(401).json({error: "Unauthorized user"})
    }
    const token = authorization.replace("Bearer ","")

    jwt.verify(token, JWT_SECRET, (error, payload) =>{
        if(error){
            return res.status(401).json({error: "Unauthorized user"})
        }
        const {_id} = payload;
        UserModel.findById(_id)
        .then((dbUser) => {
            req.dbUser = dbUser
            next()
        })
        .catch(error => console.log(error))
    })
}
