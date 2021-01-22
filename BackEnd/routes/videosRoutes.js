/**
 * This route is for /api/videos
 */
const express = require('express');
const { check } = require('express-validator');

const videosController = require('../controllers/videosController');

const router = express.Router();

// get driver videos, params are page (the nth page currently on) and pageSize(number of videos per page)
router.get(
	'/drivers/:page&:pageSize',
	videosController.getDriverVideos
);

// router.get('/instructional/', videosController.getDriverVideos);

module.exports = router;
