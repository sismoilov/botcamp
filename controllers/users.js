const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const nodeMailer = require('nodemailer')
const advancedResults = require('../middleware/advancedResults')


//desc    Get all users
//@route  GET /api/auth/users
//@access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
   res.status(200).json(res.advancedResults)
})

//desc    Get single user
//@route  GET /api/auth/users/:id
//@access Private/Admin
exports.getUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({success: true, data: user})
})

//desc    Create user
//@route  POST /api/auth/users
//@access Private/Admin
exports.createUser = asyncHandler(async(req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({success: true, data: user})
})

//desc    Create user
//@route  PUT /api/auth/users/:id
//@access Private/Admin
exports.updateUser = asyncHandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: user})
})

//desc    Delete user
//@route  DELETE /api/auth/users/:id
//@access Private/Admin
exports.deleteUser = asyncHandler(async(req, res, next) => {
     await User.findByIdAndDelete(req.params.id);

    res.status(201).json({success: true, data: {}})
})