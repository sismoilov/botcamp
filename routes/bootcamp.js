const express = require('express');

const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius} = require('../controllers/bootcamp');
const router = express.Router();

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').put(updateBootcamp).delete(deleteBootcamp).get(getBootcamp);


module.exports = router;
