/**
 * This route is for /api/stripe
 */
const express = require('express');
const { check } = require('express-validator');

const stripeController = require('../controllers/stripeController');

const checkClubAuth = require('../middleware/check-clubAuth');
const checkUserAuth = require('../middleware/check-userAuth');

const router = express.Router();

// ********* USER SECTION *******************//
// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkUserAuth);

// submit entry
router.post('/session/', stripeController.createSession);

// get setup intent to setup user stripe paymentMethod
router.get(
	'/newSetupIntent/:eventId',
	stripeController.getNewSetupIntent
);

// ! NOT USED
// This route is not used beacuse re-using SetupIntent with new PaymentMethod will be causing SetupIntent state isssue
// get original setupIntent from payment
router.get('/setupIntent/:entryId', stripeController.getSetupIntent);

// ********* CLUB SECTION *******************//
router.use(checkClubAuth);

router.get('/connect/', stripeController.getConnect);

module.exports = router;
