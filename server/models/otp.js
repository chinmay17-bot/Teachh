const mongoose = require("mongoose");
const mailSender= require('../utils/mailSender')

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    }, 
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60
    }
});

//this position is important
//================================================================================================

async function sendVerificationEmail(email , otp) {
    try {
        const mailResponse= await mailSender(email, "Verification Email", otp);
        console.log("Email sent successfully")
    } catch (error) {
        console.log("error during otp sending-"+error);
    }
}

//this will make it run before saving the document
otpSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next(); 
})

//================================================================================================
module.exports = mongoose.exports("OTP", otpSchema);
