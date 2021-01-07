/**
 * This route is for /api/events
 */
const express = require('express');
const { check } = require('express-validator');
const moment = require('moment');

const eventsController = require('../controllers/eventsController');
const fileUpload = require('../middleware/file-upload');
const checkClubAuth = require('../middleware/check-clubAuth');
const checkUserAuth = require('../middleware/check-userAuth');

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

// adding checkClubAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkClubAuth);

// GET /api/ownerClub/:cid return all events
router.get(
	'/ownerClub/:cid',
	eventsController.getEventsByOwnerClubId
);

// GET /api/ownerClubPublished/:cid
router.get(
	'/ownerClubPublished/:cid',
	eventsController.getPublishedEventsByOwnerClubId
);

// GET /api/ownerClubEvent/:eid return eid event
router.get(
	'/ownerClubEvent/:eid',
	eventsController.getOwnerClubEvent
);

// get event entry report
router.get('/entryreport/:eid', eventsController.getEntryReport);

// get event entry report
router.get('/paymentReport/:eid', eventsController.getPaymentReport);

// last valid day to allow for event addition, modification, or deletion
let validFormModDate = moment().add(1, 'days').format('YYYY-MM-DD');
// only clubs are able to create an event
router.post(
	'/',
	//  actually we dont need this but because we are using formData at front end so we have to have it
	fileUpload.fields([
		{ name: 'eventImage', maxCount: 1 },
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
		{ name: 'eventImage', maxCount: 1 },
		{ name: 'courseMap', maxCount: 1 }
	]),
	eventsController.updateEventPhotos
);

router.patch(
	'/registration/:eid',
	[
		check('totalCap').not().isEmpty(),
		check('numGroups').not().isEmpty(),
		check('capDistribution').not().isEmpty(),
		check('multiDayEvent').not().isEmpty()
	],
	eventsController.createUpdateEventRegistration
);

router.patch(
	'/:eid',
	//  actually we dont need this but because we are using formData at front end so we have to have it
	fileUpload.fields([
		{ name: 'eventImage', maxCount: 1 },
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

router.patch(
	'/closeEventRegistration/:eid',
	[check('closed').not().isEmpty()],
	eventsController.closeEventRegistration
);

router.delete('/:eid', eventsController.deleteEvent);

// /api/clubs/form/:eid
router.get('/form/:eid', eventsController.getEntryForm);

// create event entry form
router.post('/form/:eid', eventsController.createUpdateEntryForm);

// charge all entries for the event
router.post('/chargeAll/:eid', eventsController.chargeAll);

router.use(checkUserAuth);

// get event entry report
router.post(
	'/entryreportforusers/:eid',
	[check('displayName').not().isEmpty()],
	eventsController.getEntryReportForUsers
);

module.exports = router;
