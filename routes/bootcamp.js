const express = require('express');

const { getBootcamps,
     getBootcamp,
     createBootcamp,
     updateBootcamp, 
     deleteBootcamp,
     getBootcampsInRadius,
     bootcampPhotoUpload
    } = require('../controllers/bootcamp');

    
const courseRouter = require('./course');
const router = express.Router();

router.use('/:bootcampId/courses', courseRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').put(updateBootcamp).delete(deleteBootcamp).get(getBootcamp);
router.route('/:id/photo').put(bootcampPhotoUpload)


module.exports = router;
