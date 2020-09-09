/**
 * This route is for /api/events
 */
const express = require('express');
const { check } = require('express-validator');
const moment = require('moment');

const eventsController = require('../controllers/eventsController');
const fileUpload = require('../middleware/file-upload');
const checkClubAuth = require('../middleware/check-clubAuth');

const router = express.Router();

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
router.get('/', eventsController.getAllEvents);

router.get(
	'/ownerClubEvent/:eid',
	eventsController.getOwnerClubEvent
);
router.get('/:eid', eventsController.getEventById);

router.get('/club/:cid', eventsController.getEventsByClubId);

router.get(
	'/ownerClub/:cid',
	eventsController.getEventsByOwnerClubId
);

// get event entry form and answer
router.get(
	'/form/:eid/:uid',
	eventsController.getEventEntryFormAnswer
);

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

// adding checkClubAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkClubAuth);

// fileUpload.fields([
// 	{ name: 'image', maxCount: 1 },
// 	{ name: 'courseMap', maxCount: 1 }
// ]),

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
	'/photos/:eid',
	fileUpload.fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'courseMap', maxCount: 1 }
	]),
	eventsController.updateEventPhotos
);

router.patch(
	'/registration/:eid',
	[
		check('totalCap').not().isEmpty(),
		check('numGroups').not().isEmpty()
	],
	eventsController.updateEventRegistration
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
