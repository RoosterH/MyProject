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

// submit entry
router.post(
	'/submit/:eid',
	[
		check('carId').not().isEmpty(),
		check('carNumber').not().isEmpty(),
		check('raceClass').not().isEmpty(),
		check('answer').not().isEmpty(),
		check('disclaimer').not().equals(true)
	],
	entriesController.createEntry
);

router.post(
	'/entryFee/:eid',
	[check('answer').not().isEmpty()],
	entriesController.getEntryFee
);

router.patch(
	'/car/:entryId',
	[check('carId').not().isEmpty()],
	entriesController.updateCar
);

router.patch(
	'/classNumber/:entryId',
	[
		check('carNumber').not().isEmpty(),
		check('raceClass').not().isEmpty()
	],
	entriesController.updateClassNumber
);

router.patch(
	'/formAnswer/:entryId',
	[check('formAnswer').not().isEmpty()],
	entriesController.updateFormAnswer
);

router.delete('/:entryId', entriesController.deleteEntry);

module.exports = router;
