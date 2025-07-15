const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const { param } = require('../routes/bootcamp');
const path = require('path');

//@desc get all bootcamps
// @route GET /api/bootcamp
// @access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults)
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
    //add user to req.body
    req.body.user = req.user.id

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

    //if the user is not admin they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User with the ID ${req.user.id} has already published a bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });
});

//@desc update bootcamp
// @route PUT /api/bootcamp/:id
// @access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
    }
    //make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID ${req.params.id} is not authorized to update the bootcamp`, 401))
    }

   bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
   })

    res.status(200).json({ success: true, data: bootcamp })

});

//@desc delete bootcamp
// @route DELETE /api/bootcamp/:id
// @access private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID ${req.params.id} is not authorized to delete the bootcamp`, 401))
    }

    await bootcamp.deleteOne();
    res.status(200).json({ success: true, msg: ` Deleted a bootcamp ${req.params.id}`, data: {} });

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


//desc  Upload All Photos
//route   PUT /api/bootcamp/:id/photo
//acess  Private
exports.bootcampPhotoUpload = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next( new ErrorResponse( `Bootcamp not found with the id of ${req.params.id}`), 404)
    }

    //make sure user is bootcamp owner
     if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User with ID ${req.params.id} is not authorized to delete the bootcamp`, 401))
    }

    if(!req.files){
       return next( new ErrorResponse('Please upload a file',400))
    }



    const file = req.files.file;

// MAKU SURE THE IMAGE IS A PHOTO
   if(!file.mimetype.startsWith('image')){
    return next( new ErrorResponse('Please upload an image file', 400))
   }
// CHECK FILESIZE
   if(file.size > process.env.MAX_FILE_UPLOAD){
    return next( new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400 ))
   }

   //create custom file Name
   file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

   //upload path

   file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if(err){
      console.error(err);
      return next(
        new ErrorResponse(`Problem with file upload`, 500)
      )
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({success: true, data: file.name} )
   })
})