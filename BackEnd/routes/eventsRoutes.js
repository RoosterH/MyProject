/**
 * This route is for /api/events
 */
const express = require('express');
const { check } = require('express-validator');
const moment = require('moment');

const eventsController = require('../controllers/eventsController');
const {
	ensureAuthenticated,
	forwardAuthenticated
} = require('../util/auth');

const router = express.Router();

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
router.get('/', eventsController.getAllEvents);

router.get('/date/', eventsController.getEventsByDate);

router.get('/:eid', eventsController.getEventById);

router.get('/club/:cid', eventsController.getEventsByClubId);

// router.get('/user/:uid', eventsController.getEventsByUserId);

// last valid day to allow for event addition, modification, or deletion
let validFormModDate = moment().add(1, 'days').format('YYYY,MM,DD');
// only clubs are able to create an event
router.post(
	'/',
	ensureAuthenticated,
	[
		check('name').isLength({ min: 5 }),
		check('startDate').custom(
			value => moment(value).format('YYYY,MM,DD') > validFormModDate
		),
		check('endDate').custom(
			(value, { req }) => value >= req.body.startDate
		),
		check('venue').not().isEmpty(),
		check('address').isLength({ min: 10 }),
		check('description').isLength({ min: 10 })
	],
	eventsController.createEvent
);

router.patch(
	'/:eid',
	ensureAuthenticated,
	[
		check('name').isLength({ min: 5 }),
		check('startDate').custom(
			value => moment(value).format('YYYY,MM,DD') > validFormModDate
		),
		check('endDate').custom(
			(value, { req }) => value >= req.body.startDate
		),
		check('venue').not().isEmpty(),
		check('address').isLength({ min: 10 }),
		check('description').isLength({ min: 10 })
	],
	eventsController.updateEvent
);

router.delete('/:eid', eventsController.deleteEvent);

module.exports = router;
