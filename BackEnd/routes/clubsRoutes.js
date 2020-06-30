/**
 * This route is for /api/clubs
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

const Club = require('../models/club');
const HttpError = require('../models/httpError');
const clubsController = require('../controllers/clubsController');
const { ensureAuthenticated } = require('../util/auth');
const fileUpload = require('../middleware/file-upload');

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
		check('password').isLength({ min: 6 })
	],
	clubsController.createClub
);

// passport http://www.passportjs.org/docs/configure/
passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password'
		},
		async (username, password, next) => {
			try {
				let club;
				try {
					club = await Club.findOne({
						email: username.toLowerCase()
					});
				} catch (err) {
					const error = new HttpError(
						'Logging in failed.  Please try agin later.',
						500
					);
					// internal error returns next(error)
					return next(error);
				}
				if (!club) {
					const error = new HttpError(
						'Logging in failed.  Please check your email/password',
						401
					);
					// authentication error returns next(error, false) since we are not using
					// flash message so we don't want to use next(null, fasle, {message: })
					return next(error, false);
				}
				// match hashed password
				bcrypt.compare(password, club.password, (err, isMatch) => {
					if (err) {
						const error = new HttpError(
							'Login club internal failure.  Please try again later',
							401
						);
						return next(error);
					}
					if (isMatch) {
						// Succeeded returns next(null, club)
						return next(null, club);
					} else {
						const error = new HttpError(
							'Logging in failed.  Please check your email/password',
							401
						);
						return next(error, false);
					}
				});
			} catch (err) {
				const error = new HttpError(
					'Login club process failed.  Please try again later',
					500
				);
				return next(error);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	Club.findById(id, (err, user) => {
		done(err, user);
	});
});

// Login, due to security reasons, we don't want to do express-validator for the input data
// because that will provide hints to hackers
router.post('/login', passport.authenticate('local'), (req, res) => {
	/** http://www.passportjs.org/docs/authenticate/
	 * If this function gets called, authentication was successful.
	 * `req.user` contains the authenticated user which is "club" in our case.
	 * What happens is the original request was sent to LocalStrategy. LocalStrategy authenticates
	 * the original request then sends a new request to passport.  This new request is the "req"
	 * in this callback so "req" now contains user information.
	 */
	res.status(200).json({
		message: `Club ${req.user.name} logged in.`,
		club: req.user.toObject({ getters: true })
	});
});

router.post('/logout', clubsController.logoutClub);

router.patch(
	'/:cid',
	ensureAuthenticated,
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	clubsController.updateClub
);

router.delete(
	'/:cid',
	ensureAuthenticated,
	clubsController.deleteClub
);

module.exports = router;
