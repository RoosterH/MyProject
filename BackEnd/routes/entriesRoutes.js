/**
 * This route is for /api/entries
 */
const express = require('express');
const { check } = require('express-validator');

const entriesController = require('../controllers/entriesController');
const checkUserAuth = require('../middleware/check-userAuth');
const checkClubAuth = require('../middleware/check-clubAuth');
const router = express.Router();

// *************** USER Section ****************************//
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
		check('disclaimer').not().equals(true),
		check('paymentMethod').not().isEmpty(),
		check('entryFee').not().isEmpty(),
		check('stripePaymentMethodId')
			.not()
			.isEmpty()
			.exists({ paymentMethod: 'stripe' }),
		check('stripeSetupIntentId')
			.not()
			.isEmpty()
			.exists({ paymentMethod: 'stripe' })
	],
	entriesController.createEntry
);

router.post(
	'/entryFee/:eid',
	[check('answer').not().isEmpty()],
	entriesController.getEntryFee
);

router.post(
	'/paymentStatus/:entryId',
	entriesController.updatePaymentStatus
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

router.patch(
	'/payment/:entryId',
	[check('paymentMethod').not().isEmpty()],
	entriesController.updatePayment
);

router.delete('/:entryId', entriesController.deleteEntry);

// get infromation before authorize charge
router.get(
	'/authentication/:entryId',
	entriesController.authentication
);

// *************** CLUB Section ****************************//
// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkClubAuth);

router.post('/charge/:entryId', entriesController.chargeEntry);

module.exports = router;
