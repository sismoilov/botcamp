const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');


//@desc     Get Reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = asyncHandler(async(req, res, next) => {
  
   if(req.params.bootcampId){
    const reviews =  await Review.find({bootcamp: req.params.bootcampId});

    return res.status(200)
            .json({success: true,
                   count: reviews.length,
                   data: reviews})
        } else {
       res
           .status(200)
           .json(res.advancedResults) 
   }    
});


//@desc     Get  Single Review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async(req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
  });

  if(!review){
        return next( new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
  }
res.status(200).json({success: true, data: review})
});

//@desc     Add Review
// @route   POST /api/bootcamp/bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async(req, res, next) => {
 req.body.bootcamp = req.params.bootcampId;
 req.body.user = req.user.id;

 const bootcamp = await Bootcamp.findById(req.params.bootcampId);

 if(!bootcamp){
        return next( new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`))
 }

 const review = await Review.create(req.body);
 res.status(201).json({
        success: true,
        data: review
 })
});


//@desc     Update Review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async(req, res, next) => {
 let review = await Review.findById(req.params.id);

 if(!review){
        return next( new ErrorResponse(`No review with the id of ${req.params.id}`, 400))
 }

 //make sure review belong to user
 if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
       return next( new ErrorResponse('Not authorized to update review', 401))
 }

 review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
 });

 res.status(200).json({
        success: true,
        data: review
 })
});


//@desc     Delete Review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async(req, res, next) => {
 const review = await Review.findById(req.params.id);

 if(!review){
        return next( new ErrorResponse(`No review with the id of ${req.params.id}`, 400))
 }

 //make sure review belong to user
 if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
       return next( new ErrorResponse('Not authorized to update review', 401))
 }

 await review.deleteOne()

 res.status(200).json({
        success: true,
        data:{}
 })
});