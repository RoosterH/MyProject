/**
 * This route is for /api/users
 */
const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');
const carsController = require('../controllers/carsController');
const fileUpload = require('../middleware/file-upload');
const checkUserAuth = require('../middleware/check-userAuth');
const { route } = require('./clubsRoutes');
const { Router } = require('express');
const router = express.Router();

// /api/users
router.get('/', usersController.getAllUsers);

router.get('/:uid', usersController.getUserById);

router.post(
	'/signup',
	fileUpload.single('userImage'),
	[
		check('userName').not().isEmpty(),
		check('lastName').not().isEmpty(),
		check('firstName').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }),
		check('passwordValidation').isLength({ min: 6 })
	],
	usersController.createUser
);

// login, due to security reasons, we don't want to do a check for the input data
router.post('/login', usersController.loginUser);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkUserAuth);

// get user credentials
router.get('/credential/:uid', usersController.getUserCredential);

// get event entry form
router.get('/form/:eid', usersController.getEventEntryForm);

// get event entry form and answer
router.get(
	'/formWithAnswer/:eid',
	usersController.getEventEntryFormWithAnswer
);

router.get('/garage/:uid', carsController.getCarsByUserId);

// GET user events
router.get('/events/:uid', usersController.getEvents);

// get event entry
router.get('/entry/:eid', usersController.getEntry);

router.post('/logout', usersController.logoutUser);

// router.patch(
// 	'/:uid',
// 	[
// 		check('userName').not().isEmpty(),
// 		check('email').normalizeEmail().isEmail(),
// 		check('password').isLength({ min: 6 })
// 	],
// 	usersController.updateUser
// );

// router.patch(
// 	'/profile',
// 	fileUpload.fields([
// 		{ name: 'userImage', maxCount: 1 },
// 		{ name: 'clubProfileImage', maxCount: 1 }
// 	]),
// 	[
// 		check('webPage').not().isEmpty(),
// 		check('faceBook').not().isEmpty(),
// 		check('contactEmail').normalizeEmail().isEmail(),
// 		check('description').not().isEmpty()
// 	],
// 	clubsController.updateClubProfile
// );

// router.patch(
// 	'/account',
// 	[
// 		check('onSitePayment').not().isEmpty(),
// 		check('stripePayment').not().isEmpty()
// 	],
// 	clubsController.updateClubAccount
// );

// update club info
router.patch(
	'/credential/:uid',
	[
		//check('email').normalizeEmail().isEmail(),
		check('oldPassword').isLength({ min: 6 }),
		check('newPassword').isLength({ min: 6 }),
		check('passwordValidation').isLength({ min: 6 })
	],
	usersController.updateUserCredential
);

router.delete('/:uid', usersController.deleteUser);

module.exports = router;
