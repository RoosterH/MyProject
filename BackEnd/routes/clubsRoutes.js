/**
 * This route is for /api/clubs
 */
const express = require('express');
const { check } = require('express-validator');

const clubsController = require('../controllers/clubsController');
const fileUpload = require('../middleware/file-upload');
const checkClubAuth = require('../middleware/check-clubAuth');

const router = express.Router();

// /api/clubs
router.get('/', clubsController.getAllClubs);

router.get('/:cid', clubsController.getClubById);

router.post(
	'/signup',
	// single file, 'image' is the key name in the request body
	// that is associated with the uploading file
	fileUpload.single('clubImage'),
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }),
		check('passwordValidation').isLength({ min: 6 })
	],
	clubsController.createClub
);

// Login, due to security reasons, we don't want to do express-validator for the input data
// because that will provide hints to hackers
router.post('/login', clubsController.loginClub);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkClubAuth);

// club logout
router.post('/logout', clubsController.logoutClub);

router.patch(
	'/profile',
	fileUpload.fields([
		{ name: 'clubImage', maxCount: 1 },
		{ name: 'clubProfileImage', maxCount: 1 }
	]),
	[
		check('webPage').not().isEmpty(),
		check('faceBook').not().isEmpty(),
		check('contactEmail').normalizeEmail().isEmail(),
		check('description').not().isEmpty()
	],
	clubsController.updateClubProfile
);

router.patch(
	'/account',
	[
		check('onSitePayment').not().isEmpty(),
		check('stripePayment').not().isEmpty()
	],
	clubsController.updateClubAccount
);

// update club info
router.patch(
	'/credential',
	[
		//check('email').normalizeEmail().isEmail(),
		check('oldPassword').isLength({ min: 6 }),
		check('newPassword').isLength({ min: 6 }),
		check('passwordValidation').isLength({ min: 6 })
	],
	clubsController.updateClubCredential
);

// delete club
router.delete('/:cid', clubsController.deleteClub);

// /api/clubs/form/:eid
router.get('/form/:eid', clubsController.getEventForm);

// create event entry form
router.post('/form/:eid', clubsController.createEventForm);

router.patch('/publish/:eid', clubsController.publishEvent);

router.get('/profile/:cid', clubsController.getClubProfile);

router.get('/credential/:cid', clubsController.getClubCredential);

router.get('/account/:cid', clubsController.getClubAccount);

router.get(
	'/stripeAccount/:cid',
	clubsController.getClubStripeAccount
);

module.exports = router;
