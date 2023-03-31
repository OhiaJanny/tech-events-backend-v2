const express = require("express")
const app = express()
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const securedRoute = require("./middleware/securedRoute")
const { data } = require('./mockup_data')
const port = 5000;
dotenv.config();
app.use(cors())

// const MONGODB_URI = "mongodb+srv://kiisifelix:kiisifelix2006@movix.mmil1zi.mongodb.net/user?retryWrites=true&w=majority";
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGODB_URI).then(()=> console.log("connected")).catch(error => console.log(error));


app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}));

app.use(require("./routes/auth_routes"))

app.get('/', securedRoute, (req, res) =>{
    return res.status(201).json({success: "Welcome", user: req.dbUser})
})

app.get('/tech-events', (req, res) =>{
    res.status(200).json({data})
})

app.listen(port, ()=> console.log(`Server running on port: ${port}`))