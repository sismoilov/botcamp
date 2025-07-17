const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


//@desc get courses
// @route GET /api/courses
// @route GET /api/bootcamp/:bootcampId/courses
// @access public
exports.getCourses = asyncHandler(async(req, res, next) => {
  
   if(req.params.bootcampId){
    const courses =  await Course.find({bootcamp: req.params.bootcampId});

    return res.status(200).json({success: true, count: courses.length, data: courses})
   }else{
    res.status(200).json(res.advancedResults) 
   }    
})

//@desc get courses
// @route GET /api/courses/:id
// @access public

  exports.getCourse = asyncHandler( async ( req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course){
        return next( new ErrorResponse(`Course not found with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: course});
  });

//@desc  POST courses
//@route POST /api/bootcamp/:bootcampId/courses
//@access private
  exports.addCourse = asyncHandler( async (req, res, next) => {
      req.body.bootcamp = req.params.bootcampId;
      req.body.user = req.user.id;


      const bootcamp = await Bootcamp.findById(req.params.bootcampId);

      if(!bootcamp){
        return next( new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
      }

      //make sure that owner logged in
      if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
              return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to add a course to this`, 401))
          }

      const course = await Course.create(req.body);

      res.status(200).json({success: true, data: course});
  });

//@desc  PUT courses
//@route PUT /api/courses/:id
//@access private
exports.updateCourse = asyncHandler( async (req, res, next) => {
      let course = await Course.findById(req.params.id);
  

    if(!course){
      return next( new ErrorResponse(`No course found with  the id of ${req.params.id}`, 404));
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
              return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to update a course to this`, 401))
          }

   course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
 
    res.status(200).json({success: true, data: course});
});

//@desc  DELETE courses
//@route DELETE /api//courses/:id
//@access private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No course found and delted with the id of ${req.params.id}`, 404));
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
              return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to delete a course to this`, 401))
          }


    await course.deleteOne();

    res.status(200).json({success:true, data:{}});
})