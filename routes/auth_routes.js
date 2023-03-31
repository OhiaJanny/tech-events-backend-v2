const router = require("express").Router()
const UserModel = require("../models/user_model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../configs")
const nodemailer = require("nodemailer")
const otpModel = require("../models/otp_model")

let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: "kiisifelix06@gmail.com",
        pass: "ghkypqyfrmjztyrr",
    },
    tls: {
        rejectUnauthorized: false
    }
})

const sendOtp = async (user, email) => {

    const otp = Math.floor(1000 + Math.random() * 9000);
    
    const mailOptions = {
        from: 'Kiisifelix06@gmail.com',
        to: email,
        subject: 'Tech Events <Jane>',
        html: `<div>
    <p>Hi, ${user}</p>
    <p>OTP: ${otp}</p>
    </div>`,
    };
    transport.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err, "Error")
            return {error: 'Error'}
        } else {
            console.log("Email sent successfully", info);
            return {success: true}
        }
    });

    await otpModel.create({ email, otp })

}

router.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
        return res.status(400).json({ error: "One or more field left empty" });
    }

    UserModel.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(401).json({ error: "Already registered email" })
        }
        bcrypt.hash(password, 10)
            .then(hashedPassword => {
                const dbUser = new UserModel({ fullname: fullname, email: email, password: hashedPassword, verified: false })
                dbUser.save()
                    .then( async (user )=> {
                        res.status(201).json({ success: "Successful, an OTP was sent your email", verified: false })
                        let x = await sendOtp(fullname, email);
                        console.log(x)
                    }).catch(error => console.log(error))

            }).catch(error => console.log(error))

    }).catch(error => console.log(error))
})

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "One or more field left empty" });
    }

    UserModel.findOne({ email: email }).then((user) => {
        if (!user) {
            return res.status(401).json({ error: "Account not found" })
        }
        
        bcrypt.compare(password, user.password)
            .then(match => {
                if (match) {
                    if(!user.verified){
                        return res.status(200).json({ error: 'Your Account is not verified' })
                    }
                    const jwtToken = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET)
                    user.password = undefined
                    return res.status(200).json({ user: user, token: jwtToken })
                } else {
                    return res.status(400).json({ error: "Invalid credentials" })
                }
            })

    }).catch(error => console.log(error))
})

router.post('/verify', async (req, res) =>{
    const { otp, email } = req.body
    let otp_exist = await otpModel.find({ email })
    if(otp_exist[otp_exist.length - 1].otp === parseInt(otp)){
        await UserModel.updateOne({ email }, {verified: true})
        return res.status(200).json({success: "Email Verified"})
    }else{
        return res.status(403).json({error: "Invalid OTP"})
    }
})


module.exports = router