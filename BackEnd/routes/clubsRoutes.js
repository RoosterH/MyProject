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
const e = require('express');

const router = express.Router();

// /api/clubs
router.get('/', clubsController.getAllClubs);

router.get('/:cid', clubsController.getClubById);

router.post(
	'/signup',
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	clubsController.createClub
);

// login, due to security reasons, we don't want to do a check for the input data
// router.post('/login', clubsController.loginClub);

// passport
passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password'
		},
		async (username, password, next) => {
			try {
				let club = await Club.findOne({
					email: username.toLowerCase()
				});
				if (!club) {
					const error = new HttpError(
						'Logging in failed.  Please check your email/password',
						401
					);
					return next(error);
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
						return next(null, club);
					} else {
						const error = new HttpError(
							'Logging in failed.  Please check your email/password',
							401
						);
						return next(error);
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

router.post('/login', passport.authenticate('local'), (req, res) => {
	// If this function gets called, authentication was successful.
	// `req.user` contains the authenticated user which is the club in our case.
	res.status(200).json({
		message: `Club ${req.user.name} logged in.`,
		club: req.user.toObject({ getters: true })
	});
});

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
