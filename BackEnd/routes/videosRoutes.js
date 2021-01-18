/**
 * This route is for /api/videos
 */
const express = require('express');
const { check } = require('express-validator');

const videosController = require('../controllers/videosController');

const router = express.Router();

// Get youtube videos
router.get('/drivers/', videosController.getDriverVideos);

router.get('/instructional/', videosController.getDriverVideos);

module.exports = router;
