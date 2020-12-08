/**
 * This route is for /api/stripe
 */
const express = require('express');
const { check } = require('express-validator');

const stripeController = require('../controllers/stripeController');

const checkClubAuth = require('../middleware/check-clubAuth');
const checkUserAuth = require('../middleware/check-userAuth');

const router = express.Router();

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

// get original setupIntent from payment
router.get('/setupIntent/:entryId', stripeController.getSetupIntent);

module.exports = router;
