const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please Enter Name'],
        maxlength: [30, 'Your name cannot be exceed more than 30 Character']
    },
    email: {
        type: String,
        required: [true, 'Please Enter Email'],
        unique: true,
        validate: [validator.isEmail, 'Please Enter Valid Email']
    },
    phoneNo: {
        type: Number,
        required: [true, 'Please Enter Phone Number'],
        maxlength: [10, "Mobile Number cannot exceed 10 digit"],
    },
    role: {
        type: String,
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please Enter Password'],
        minlength: [6, 'Password must be longer than 6 Character'],
        select: false //For hiding the text in input field
    },
    companyName: {
        type: String,
        required: [true, 'Please Enter Company Name'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

//Encrypting Password before saving the user

userSchema.pre('save', async function (next) {

    //Checking if password is modified or not
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

//Compare User Password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

// Return JWT Token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

//Generate Reset Password token

userSchema.methods.getResetPasswordToken = function (){

    //Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Encrypt the token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //Set the token expire
    this.resetPasswordToken = Date.now() + 30 * 60* 1000

    return resetToken
}
module.exports = mongoose.model('User', userSchema)
