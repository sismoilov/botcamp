const Bootcamp = require('../models/Bootcamp');

//@desc get all bootcamps
// @route GET /api/bootcamp
// @access public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({success: true, msg: 'Show all the bootcamps'});
}

//@desc get single bootcampall bootcamps
// @route GET /api/bootcamp/:id
// @access public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `Show a bootcamp ${req.params.id}`});
}

//@desc create new bootcamp
// @route POST /api/bootcamp
// @access private
exports.createBootcamp =  async (req, res, next) => {
    try {       
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, data: bootcamp});
    } catch (err) {
        res.status(400).json({success: false, err: err.message});
    }

}

//@desc update bootcamp
// @route PUT /api/bootcamp/:id
// @access private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `Updated a bootcamp ${req.params.id}`});
}

//@desc delete bootcamp
// @route DELETE /api/bootcamp/:id
// @access private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({success: true, msg: ` Deleted a bootcamp ${req.params.id}`});
}