const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const { param } = require('../routes/bootcamp');

//@desc get all bootcamps
// @route GET /api/bootcamp
// @access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    //filtering codes 
    let query;
    const reqQuery = {...req.query};
// fields to exclude
    const removeFields = ['select', 'sort','page', 'limit'];
// loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // create operators (gt, gte, lt, lte, in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$ ${match}`);

// finding resources
    query = Bootcamp.find(JSON.parse(queryStr)).populate({
        path: 'course',
        select: 'title description weeks tuition'
    });

    //select fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
// sort fields
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    //pagination and limit`
   const page = parseInt(req.query.page, 10) || 1;
   const limit = parseInt(req.query.limit, 10) || 25;
   const startIndex = (page - 1) * limit;
   const endIndex = page * limit;
   const total = await Bootcamp.countDocuments();

   query = query.skip(startIndex).limit(limit);

   const pagination = {}

   if(endIndex < total ){
       pagination.next = {
           page: page + 1,
           limit
        }
    }
    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    
    
    // executing query
    const bootcamps = await query;
    res.status(200).json({ success: true, pagination, count: bootcamps.length, data: bootcamps })
});




//@desc get single bootcampall bootcamps
// @route GET /api/bootcamp/:id
// @access public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp })
});

//@desc create new bootcamp
// @route POST /api/bootcamp
// @access private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });

});

//@desc update bootcamp
// @route PUT /api/bootcamp/:id
// @access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp })

});

//@desc delete bootcamp
// @route DELETE /api/bootcamp/:id
// @access private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
    }

    await bootcamp.deleteOne();
    res.status(200).json({ success: true, msg: ` Deleted a bootcamp ${req.params.id}` });

});

// desc get radius response
// route GET /api/bootcamp/radius/:zipcode/:distance
// access public

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    //get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //calculate the radius
    //devide distance by radius of the earth
    //earth radius = 3,963 mi / 6378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    })
    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
})