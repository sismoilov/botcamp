const mongoose = require('mongoose');
const crypto  = require('crypto');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please write your name']
    },
     email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }

});

//encrypt password using bcrypt
UserSchema.pre('save',  async function(next){

    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next()
});

// sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

//match user  entered password to hashed password
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

// UserSchema.methods.getResetPasswordToken = function(){
//     const resetToken = crypto.randomBytes(20).toString('hex');

//     //Hash token and set to resetPasswordToken field
//     this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//     //Expire time
//     this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

//     return resetToken;
// }

UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

// UserSchema.methods.getResetPasswordToken = function(){
//   // ^ xonanli raqamni jonatish yoli
//   const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

//   //hash qilib db ga saqlash 
//   this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
// }
UserSchema.methods.getResetPasswordCode = function(){
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetCode
}

module.exports = mongoose.model('User', UserSchema)