const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');

//@desc get all bootcamps
// @route GET /api/bootcamp
// @access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
 
        const bootcamps = await Bootcamp.find();
        res.status(200).json({success: true, count:bootcamps.length, data: bootcamps})  
});


//@desc get single bootcampall bootcamps
// @route GET /api/bootcamp/:id
// @access public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id);
        
        if(!bootcamp){
            return  next( new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
        }

        res.status(200).json({success: true, data: bootcamp})
});

//@desc create new bootcamp
// @route POST /api/bootcamp
// @access private
exports.createBootcamp = asyncHandler( async (req, res, next) => {
     
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, data: bootcamp});

});

//@desc update bootcamp
// @route PUT /api/bootcamp/:id
// @access private
exports.updateBootcamp =  asyncHandler(async(req, res, next) => {
   
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if(!bootcamp){
            return  next( new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
        }

        res.status(200).json({success: true, data: bootcamp})

});

//@desc delete bootcamp
// @route DELETE /api/bootcamp/:id
// @access private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
    
         const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if(!bootcamp){
        return  next( new ErrorResponse(`Bootcamp has not been found with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, msg: ` Deleted a bootcamp ${req.params.id}`});
    
   });

   // desc get radious response
   // route GET /api/bootcamp/radius/:zipcode/:distance
   // access public

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

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
            $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }
        }
    })
    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
})