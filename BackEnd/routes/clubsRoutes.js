/**
 * This route is for /api/clubs
 */
const express = require('express');
const { check } = require('express-validator');

const clubsController = require('../controllers/clubsController');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// /api/clubs
router.get('/', clubsController.getAllClubs);

router.get('/:cid', clubsController.getClubById);

router.post(
	'/signup',
	// single file, 'image' is the key name in the request body
	// that is associated with the uploading file
	fileUpload.single('image'),
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
router.post(
	'/login',
	/** http://www.passportjs.org/docs/authenticate/
	 * If this function gets called, authentication was successful.
	 * `req.user` contains the authenticated user which is "club" in our case.
	 * What happens is the original request was sent to LocalStrategy. LocalStrategy authenticates
	 * the original request then sends a new request to passport.  This new request is the "req"
	 * in this callback so "req" now contains user information.
	 */
	// res.status(200).json({
	// 	message: `Club ${req.user.name} logged in.`,
	// 	club: req.user.toObject({ getters: true })
	// });
	clubsController.loginClub
);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkAuth);

router.post('/logout', clubsController.logoutClub);

router.patch(
	'/:cid',
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	clubsController.updateClub
);

router.delete('/:cid', clubsController.deleteClub);

module.exports = router;
