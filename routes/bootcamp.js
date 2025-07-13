const express = require('express');

const { getBootcamps,
     getBootcamp,
     createBootcamp,
     updateBootcamp, 
     deleteBootcamp,
     getBootcampsInRadius,
     bootcampPhotoUpload
    } = require('../controllers/bootcamp');
    const Bootcamp = require('../models/Bootcamp')
    const advancedResults = require('../middleware/advancedResults')


const courseRouter = require('./course');
const router = express.Router();

const {protect, authorize} = require('../middleware/auth')

router.use('/:bootcampId/courses', courseRouter)

router
.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius);

router
.route('/')
.get(advancedResults(Bootcamp, 'course'),getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp);

router
.route('/:id')
.put(protect,authorize('publisher', 'admin'), updateBootcamp)
.delete( protect, authorize('publisher', 'admin'), deleteBootcamp)
.get(getBootcamp);

router
.route('/:id/photo')
.put(protect,authorize('publisher', 'admin'), bootcampPhotoUpload)


module.exports = router;
