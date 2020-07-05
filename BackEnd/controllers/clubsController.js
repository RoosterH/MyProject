const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/httpError');
const Club = require('../models/club');
const mongoose = require('mongoose');

const config = require('../Config/Config');
const JWT_PRIVATE_KEY = config.JWT_PRIVATE_KEY;
const DUMMY_CLUBID = config.DUMMY_CLUBID;

// GET /api/clubs/
const getAllClubs = async (req, res, next) => {
	let clubs;
	try {
		// we don't want to return password field
		clubs = await Club.find({}, '-password').sort({ name: 1 });
	} catch (err) {
		const error = new HttpError(
			'Get all clubs process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!clubs || clubs.length === 0) {
		const error = new HttpError('No clubs in the DB.', 404);
		return next(error);
	}

	res.status(200).json({
		clubs: clubs.map(club => club.toObject({ getters: true }))
	});
};

// GET /api/clubs/:id
const getClubById = async (req, res, next) => {
	clubId = req.params.cid;
	let club;
	try {
		// we don't want to return password field
		club = await Club.findById(clubId, '-password');
	} catch (err) {
		const error = new HttpError(
			'Get club process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError('No clubs in the DB.', 404);
		return next(error);
	}

	res.status(200).json({ club: club });
};

// POST '/api/clubs/signup'
const createClub = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Create club process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}

	const { name, email, password, passwordValidation } = req.body;

	if (password !== passwordValidation) {
		const error = new HttpError(
			'Sign up club. Passwords do not match!',
			403
		);
		return next(error);
	}
	// validation to make sure email does not exist in our DB
	let existingClub;
	try {
		existingClub = await Club.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			'Signed up email validation failed. Please try again later',
			500
		);
		return next(error);
	}

	if (existingClub) {
		const error = new HttpError(
			'Signup failed. Please contact our administrator if you continue to have the same issue.',
			422
		);
		return next(error);
	}

	let hashedPassword;
	try {
		// genSalt = 12
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError(
			'Faied to create a new club. Please try again later.',
			500
		);
		return next(error);
	}

	const newClub = new Club({
		name,
		email,
		image: req.file.path,
		password: hashedPassword,
		events: []
	});

	try {
		await newClub.save();
		// await is slow. need to send res here not outside; otherwise in case of
		// an error res will be sent first then back to catch(err) here
	} catch (err) {
		const error = new HttpError(
			'Faied to create a new club. Please try again later.',
			500
		);
		return next(error);
	}

	// jwt section
	let token;
	// use ClubId and email as the payload
	// private key
	try {
		token = jwt.sign(
			{ clubId: newClub.id, email: newClub.email },
			JWT_PRIVATE_KEY,
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Internal error. Faied to create a new club. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(201).json({
		clubId: newClub.id,
		name: newClub.name,
		email: newClub.email,
		token: token
	});
};

// POST '/api/clubs/login'
const loginClub = async (req, res, next) => {
	const { name, password, email } = req.body;

	// validation to make sure email does not exist in our DB
	let existingClub;
	try {
		existingClub = await Club.findOne({ email: email.toLowerCase() });
	} catch (err) {
		const error = new HttpError(
			'Login club process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!existingClub) {
		const error = new HttpError(
			'Login club failed. Invalid club Name/email and password',
			403
		);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(
			password,
			existingClub.password
		);
	} catch (err) {
		const error = new HttpError(
			'Login club internal failure. Please try again later',
			500
		);
		return next(error);
	}
	if (!isValidPassword) {
		const error = new HttpError(
			'Logging in failed. Please check your email/password',
			403
		);
		return next(error, false);
	}

	// verify jwt
	// jwt section
	let token;
	// use clubId and email as the payload, when we decode the payload will be
	// returned along with the token
	try {
		// encoding
		token = jwt.sign(
			{ clubId: existingClub.id, email: existingClub.email },
			JWT_PRIVATE_KEY,
			{ expiresIn: '24h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Internal error. Faied to login club. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		clubId: existingClub.id,
		name: existingClub.name,
		email: existingClub.email,
		token: token
	});
};

// PATCH '/api/clubs/:cid'
const updateClub = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update club process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const { name, password, email } = req.body;
	const clubId = req.userData.clubId; // use clubId from token instead of getting it from url to avoid hacking
	console.log('clubId = ', clubId);
	let club;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Update club process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Update club failed finding the club.',
			404
		);
		return next(error);
	}

	// update club info
	club.name = name;
	club.password = password;
	club.email = email;

	let hashedPassword;
	try {
		// set password to hashed password. genSalt = 12
		club.password = await bcrypt.hash(password, 12);

		await club.save();
	} catch (err) {
		const error = new HttpError(
			'Update club internal failure. Please try again later',
			500
		);
		return next(error);
	}

	res.status(200).json({
		club: club.toObject({
			getters: true,
			// use transform to filter out password
			transform: (doc, ret, opt) => {
				delete ret['password'];
				return ret;
			}
		})
	});
};

// DELETE '/api/clubs/:cid'
const deleteClub = async (req, res, next) => {
	const clubId = req.userData.clubId; // use clubId in the jwt instaed of getting it from url

	let club;
	try {
		// we need to populate events for the deleting club
		// so we could re-assign those events to dummy club and add them to
		// dummy club(MySeatTime) events list
		club = await Club.findById(clubId).populate('events');
	} catch (err) {
		const error = new HttpError(
			'Delete club process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Delete club process failed finding club.',
			404
		);
		return next(error);
	}

	let clubName = club.name;
	// We do not want to delete all the associated events with clubs.
	// Instead we will be assiging the associated clubId to our dummy club (MySeatTime).
	try {
		// using transaction here to make sure all the operations are done
		const session = await mongoose.startSession();
		session.startTransaction();

		// transfer all the events to dummy club so the events won't be deleted
		await club.events.map(async event => {
			// assign the event clubId to dummyClub since we are deleting the original club
			event.clubId = DUMMY_CLUBID;
			await event.save({
				session: session
			});

			/**
			 * push the event to dummyClub events list
			 * We need to use await, otherwise, it won't work.
			 * In order to use await, we need to make the callback as async
			 */
			let dummyClub = await Club.findById(DUMMY_CLUBID).populate(
				'events'
			);
			dummyClub.events.push(event);
			await dummyClub.save({ session: session });
		});

		await club.remove({ session: session });
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Delete club failed, please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: `Club ${clubName} is deleted.` });
};

const logoutClub = (req, res) => {
	res.status(200).json({ message: `You are logged out.` });
};

exports.getAllClubs = getAllClubs;
exports.getClubById = getClubById;
exports.createClub = createClub;
exports.loginClub = loginClub;
exports.updateClub = updateClub;
exports.deleteClub = deleteClub;
exports.logoutClub = logoutClub;
