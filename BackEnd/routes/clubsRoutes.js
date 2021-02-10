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

router.get(
	'/clubProfile/:cid',
	clubsController.getClubProfileForUsers
);

// GET,  club requst to resend verification link by clicking the link on the email
router.get(
	'/confirmationRequest/:email/',
	clubsController.resendClubConfirmationEmail
);

// GET,  club email account confirmation, when club click on verification link
router.get(
	'/confirmation/:email/:token',
	clubsController.confirmClubEmail
);

// GET,  club requst to resend verification link by clicking the link on Frontend <ClubVerification /> page
router.get(
	'/verificationRequest/:email/',
	clubsController.resendClubConfirmationEmail
);

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

router.patch(
	'/clubSettings',
	[
		check('memberSystem').not().isEmpty(),
		check('hostPrivateEvent').not().isEmpty()
	],
	clubsController.updateClubSettings
);

// update club info
router.patch(
	'/credential',
	[
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

router.get('/sesEmail/:cid', clubsController.getClubSesEmail);

router.patch('/sesEmail/:cid', clubsController.updateClubSesEmail);

router.get('/clubSettings/:cid', clubsController.getClubSettings);

router.get(
	'/stripeAccount/:cid',
	clubsController.getClubStripeAccount
);

router.get('/memberList/:cid', clubsController.getClubMemberList);

router.get(
	'/commsMemberList/:cid',
	clubsController.getClubCommsMemberList
);

router.get(
	'/commsEmailArchive/:cid',
	clubsController.getClubCommsEmailArchive
);

router.post(
	'/sendEmail/:cid',
	[
		check('recipients').not().isEmpty(),
		check('subject').not().isEmpty(),
		check('content').not().isEmpty()
	],
	clubsController.sendEmail
);

router.post(
	'/uploadMemberList/:cid',
	fileUpload.single('memberList'),
	clubsController.uploadMemberList
);

router.post(
	'/member/:cid',
	[
		check('lastName').not().isEmpty(),
		check('firstName').not().isEmpty(),
		check('email').normalizeEmail().isEmail()
	],
	clubsController.addMember
);

router.patch(
	'/member/:cid',
	[
		check('lastNameNew').not().isEmpty(),
		check('firstNameNew').not().isEmpty(),
		check('emailNew').normalizeEmail().isEmail(),
		check('lastNameOld').not().isEmpty(),
		check('firstNameOld').not().isEmpty(),
		check('emailOld').normalizeEmail().isEmail()
	],
	clubsController.updateMember
);

router.delete(
	'/member/:cid',
	[
		check('lastName').not().isEmpty(),
		check('firstName').not().isEmpty(),
		check('email').normalizeEmail().isEmail()
	],
	clubsController.deleteMember
);

module.exports = router;
