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
		// check('raceClass').not().isEmpty(),
		check('answer').not().isEmpty(),
		check('disclaimer').not().equals(true),
		check('paymentMethod').not().isEmpty(),
		check('entryFee').not().isEmpty(),
		check('paymentMethod')
			.exists()
			.custom((value, { req }) => {
				if (value === 'onSite') {
					return true;
				} else if (
					// check stripePaymentMethodId and stripeSetupIntentId only if paymentMethod is 'stripe'
					(value === 'strip' &&
						req.body.stripePaymentMethodId === undefined) ||
					req.body.stripePaymentMethodId === '' ||
					req.body.stripeSetupIntentId === undefined ||
					req.body.stripeSetupIntentId === ''
				) {
					return false;
				} else {
					return true;
				}
			})
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
		check('carNumber').not().isEmpty()
		// check('raceClass').not().isEmpty()
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

router.post(
	'/updateRefundFee/:entryId',
	entriesController.updateRefundFee
);

router.post('/refund/:entryId', entriesController.refund);

module.exports = router;
