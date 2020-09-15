/**
 * This route is for /api/events
 */
const express = require('express');
const { check } = require('express-validator');

const entriesController = require('../controllers/entriesController');
const checkUserAuth = require('../middleware/check-userAuth');

const router = express.Router();

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
// router.get('/', eventsController.getAllEvents);

// router.get('/:eid', eventsController.getEventById);

// router.get('/club/:cid', eventsController.getEventsByClubId);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkUserAuth);

// users needs to login to see their events
// router.get('/user/:uid', eventsController.getEventsByUserId);

// get event entry form
// router.get('/form/:eid', eventsController.getEventEntryForm);

// get event entry form
// router.get('/form/submit/:eid', eventsController.getEventEntryForm);

// only clubs are able to create an event
router.post(
	'/submit/:eid',
	[
		(check('eventId').not().isEmpty(),
		check('carId').not().isEmpty(),
		check('carNumber').not().isEmpty(),
		check('raceClass').not().isEmpty(),
		check('answer').not().isEmpty()),
		check('disclaimer').not().equals(true)
	],
	entriesController.createEntry
);

// router.delete('/:eid', eventsController.deleteEvent);

module.exports = router;
