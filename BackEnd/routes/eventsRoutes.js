/**
 * This route is for /api/events
 */
const express = require('express');
const { check } = require('express-validator');

const eventsController = require('../controllers/eventsController');
const HttpError = require('../models/httpError');

const router = express.Router();

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
router.get('/:eid', eventsController.getEventById);

router.get('/clubs/:cid', eventsController.getEventsByClubId);

let today = new Date();

router.post(
	'/',
	[
		check('name').isLength({ min: 5 }),
		check('title').isLength({ min: 5 }),
		check('startDate').custom(value => Date.parse(value) > today),
		check('endDate').custom((value, { req }) => value >= req.body.startDate),
		check('venue').not().isEmpty(),
		check('address').isLength({ min: 10 }),
		check('description').isLength({ min: 10 })
	],
	eventsController.createEvent
);

router.patch(
	'/:eid',
	[
		check('name').isLength({ min: 5 }),
		check('title').isLength({ min: 5 }),
		check('startDate').custom(value => Date.parse(value) > today),
		check('endDate').custom((value, { req }) => value >= req.body.startDate),
		check('venue').not().isEmpty(),
		check('address').isLength({ min: 10 }),
		check('description').isLength({ min: 10 })
	],
	eventsController.updateEvent
);

router.delete('/:eid', eventsController.deleteEvent);

module.exports = router;
// Date.parse(value) >= Date.parse(req.params('startDate')
