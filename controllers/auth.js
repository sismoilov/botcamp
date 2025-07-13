const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

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