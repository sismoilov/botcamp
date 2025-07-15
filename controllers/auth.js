const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const nodeMailer = require('nodemailer')
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')

//desc Register User
//@route POST /api/auth/register
//@access Public
exports.register = asyncHandler(async (req, res, next) => {
    const {name, email, password, role } = req.body;

    //Create User
    const user = await User.create({
        name, email, password, role
    });

 sendTokenResponse(user, 200, res)
})

//desc Register User
//@route POST /api/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password,  } = req.body;

    //valid email & password
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400))
    }
    //check for user
    const user =  await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401))
    }
    //match the password
   const isMatch = await user.matchPassword(password)
    if(!isMatch){
        return next(new ErrorResponse('Password doesnot match or invalid  credential', 401))
    }
    //create token
 sendTokenResponse(user, 200, res)
});

//GET token from model, create cookie and send ErrorResponse
const sendTokenResponse = (user, statusCode, res) => {
     //create token
    const token = user.getSignedJwtToken()

    const options = {
       expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
       ),
       httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({success: true, token})
}

//desc get me page
//@route GET /api/auth/me
//@access private
exports.getMe = asyncHandler( async ( req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({success: true, data: user})
})

//desc     Update user detail
//@route   PUT /api/auth/updatedetails 
//@access  Private
exports.updateDetails = asyncHandler( async ( req, res, next) => {
   const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
   }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: user})
})

//desc     Update password
//@route   PUT /api/auth/updatepassword
//@access  Private
exports.updatePassword = asyncHandler( async ( req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next (new ErrorResponse('Password is incorrect', 401))
    };

    user.password = req.body.newPassword;
    await user.save()

   sendTokenResponse(user, 200, res)
})




// //desc Forgot password
// //@route POST /api/auth/forgotpassword
// //@access Public

// exports.forgotPassword= asyncHandler( async ( req, res, next) => {
//     const user = await User.findOne({email: req.body.email});

//     if(!user) {
//         return next( new ErrorResponse('There is no user with that email', 404))
//     }

//     //Get reset token
//     const resetToken = user.getResetPasswordToken();

//     await user.save({validateBeforeSave: false})
//     //create reset url
//     const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    
//     const message = `You are recieving this email because you (or someone else) has requested the reset of a password. 
//     Please make a PUT request to: \n\n ${resetUrl}`;

//     try {
//         await sendEmail({
//             email: user.email,
//             subject: 'Password reset token',
//             message
//         })
//          return res.status(200).json({succes: true, data:'Email sent' })
//     } catch (err) {
//         console.log(err);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save({validateBeforeSave: false});

//         return next( new ErrorResponse('Email could not be sent', 500))
//     }
//     res.status(200).json({success: true, data: user})
// })

//desc Reset Password
//@Route PUT /api/auth/resetpassword/:resettoken
//@access Public
// exports.resetPassword= asyncHandler(async(req, res, next) => {
//     //Get hashed token
//     const resetPasswordToken = crypto.
//     createHash('sha256')
//     .update(req.params.resettoken)
//     .digest('hex');

//     const user = await User.findOne({
//         resetPasswordToken,
//         resetPasswordExpire: {$gt: Date.now()}
//     });

//     if(!user){
//         return next(new ErrorResponse('Invalid token', 400))
//     }

//     //set new password
//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save()

//      sendTokenResponse(user, 200, res)
// })

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({email: req.body.email})

  if(!user) {
        return next( new ErrorResponse('There is no user with that email', 404))
    }
  const resetCode = user.getResetPasswordCode();
  await user.save({validateBeforeSave: false});

  const message = `Confirmation Code: ${resetCode} \n\n Code will expire in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password Code',
      message,
    });

    return res.status(200).json({ success: true, message: 'Code sent to gmail' });
  } catch (err) {
    console.error(err);
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
   
    await user.save({validateBeforeSave: false});

    return next(new ErrorResponse( 'Email could not be sent', 500))

  }
});


exports.resetPassword = asyncHandler( async(req, res, next) => {
    const {email, code, password} = req.body
    if(!email||!password||!code){
        return next( new ErrorResponse('You need your email and the code that sent to you', 400))
    } 

    const resetPasswordToken = crypto
           .createHash('sha256')
           .update(code)
           .digest('hex');

    const user = await User.findOne({
        email,
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorResponse('Invalid or expired code', 400))
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res)

});