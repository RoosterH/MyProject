/**
 * This route is for /api/events
 */
const express = require('express');
const { check } = require('express-validator');
const moment = require('moment');

const eventsController = require('../controllers/eventsController');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
router.get('/', eventsController.getAllEvents);

router.get('/:eid', eventsController.getEventById);

router.get('/club/:cid', eventsController.getEventsByClubId);

// request events between dates
router.post(
	'/date',
	[
		check('evevntType').not().isEmpty(),
		check('startDate').custom(
			value =>
				moment(value).format('YYYY,MM,DD') >
				moment('20200101').format('YYYY,MM,DD')
		),
		check('endDate').custom(
			(value, { req }) => value >= req.body.startDate
		),
		check('distance').not().isEmpty(),
		check('zip').isLength(5)
	],
	eventsController.getEventsByDate
);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkAuth);

// get event entry form
router.get('/form/:eid', eventsController.getEventEntryForm);

// get event entry form
router.get('/form/submit/:eid', eventsController.getEventEntryForm);

// last valid day to allow for event addition, modification, or deletion
let validFormModDate = moment().add(1, 'days').format('YYYY-MM-DD');
// only clubs are able to create an event
router.post(
	'/',
	fileUpload.fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'courseMap', maxCount: 1 }
	]),
	[
		(check('name').isLength({ min: 5 }),
		check('type').isLength({ min: 5 }),
		check('startDate').custom(
			value => moment(value).format('YYYY,MM,DD') > validFormModDate
		),
		check('endDate').custom(
			(value, { req }) => value >= req.body.startDate
		),
		check('regStartDate').custom(
			(value, { req }) => value < req.body.startDate
		),
		check('regEndDate').custom((value, { req }) => {
			value < req.body.startDate && value >= reg.body.regStartDate;
		}),
		check('venue').not().isEmpty(),
		check('address').isLength({ min: 10 }),
		check('description').isLength({ min: 10 }),
		check('instruction').isLength({ min: 10 }))
	],
	eventsController.createEvent
);

router.patch(
	'/:eid',
	fileUpload.fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'courseMap', maxCount: 1 }
	]),
	[
		check('name').isLength({ min: 5 }),
		check('type').isLength({ min: 5 }),
		check('startDate').custom(value => value > validFormModDate),
		check('endDate').custom(
			(value, { req }) => value >= req.body.startDate
		),
		check('regStartDate').custom(
			(value, { req }) => value < req.body.startDate
		),
		check('regEndDate').custom(
			(value, { req }) =>
				value < req.body.startDate && value >= req.body.regStartDate
		),
		check('venue').not().isEmpty(),
		check('address').isLength({ min: 10 }),
		check('description').isLength({ min: 10 }),
		check('instruction').isLength({ min: 10 })
	],
	eventsController.updateEvent
);

router.delete('/:eid', eventsController.deleteEvent);

module.exports = router;
