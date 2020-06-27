const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const HttpError = require('../models/httpError');
const Club = require('../models/club');
const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

// GET /api/clubs/
const getAllClubs = async (req, res, next) => {
	let clubs;
	try {
		// we don't want to display password field when querying clubs
		clubs = await Club.find({}, '-password').sort({ name: 1 });
	} catch (err) {
		const error = new HttpError(
			'Get all clubs process failed.  Please try again later.',
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
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Get club process failed.  Please try again later.',
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

	const { name, password, email } = req.body;

	// validation to make sure email does not exist in our DB
	let existingClub;
	try {
		existingClub = await Club.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			'Signed up email validation failed.  Please try again later',
			500
		);
		return next(error);
	}

	if (existingClub) {
		const error = new HttpError(
			'Signup failed.  Please contact our administrator if you continue to have the same issue.',
			422
		);
		return next(error);
	}

	const newClub = new Club({
		name,
		email,
		image:
			'http://www.americanautox.com/wp-content/uploads/2015/02/header_v2.png',
		password,
		events: []
	});

	// Hash password
	bcrypt.genSalt(10, (err, salt) =>
		bcrypt.hash(newClub.password, salt, (err, hash) => {
			if (err) {
				const error = new HttpError(
					'Signed up internal failure.  Please try again later',
					500
				);
				return next(error);
			}
			// set password to hash
			newClub.password = hash;
		})
	);

	try {
		await newClub.save();
	} catch (err) {
		const error = new HttpError(
			'Faied to create a new club.  Please try again later.',
			500
		);
		return next(error);
	}
	res.status(201).json({ club: newClub.toObject({ getters: true }) });
};

// POST '/api/clubs/login'
const loginClub = async (req, res, next) => {
	const { password, email } = req.body;

	// validation to make sure email does not exist in our DB
	let existingClub;
	try {
		existingClub = await Club.findOne({ email: email.toLowerCase() });
	} catch (err) {
		const error = new HttpError(
			'Login club process failed.  Please try again later',
			500
		);
		return next(error);
	}

	if (!existingClub || existingClub.password !== password) {
		const error = new HttpError(
			'Logging in failed.  Invalid club Name/email and password',
			401
		);
		return next(error);
	}

	console.log('res = ', res);
	res.status(200).json({
		message: `Club ${existingClub.name} logged in.`,
		club: existingClub.toObject({ getters: true })
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
	const clubId = req.params.cid;
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

	try {
		await club.save();
	} catch (err) {
		const error = new HttpError(
			`Updating club failed with the following error: ${err}`,
			500
		);
		return next(error);
	}

	res.status(200).json({ club: club.toObject({ getters: true }) });
};

// DELETE '/api/clubs/:cid'
const deleteClub = async (req, res, next) => {
	const clubId = req.params.cid;

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
	const dummyClubId = mongoose.Types.ObjectId(
		'5ef4f30cbaea80121c04c710'
	);
	try {
		// using transaction here to make sure all the operations are done
		const session = await mongoose.startSession();
		session.startTransaction();

		// transfer all the events to dummy club so the events won't be deleted
		await club.events.map(async event => {
			// assign the event clubId to dummyClub since we are deleting the original club
			event.clubId = dummyClubId;
			event.save({
				session: session
			});

			/**
			 * push the event to dummyClub events list
			 * We need to use await, otherwise, it won't work.
			 * In order to use await, we need to make the callback as async
			 */
			let dummyClub = await Club.findById(dummyClubId).populate(
				'events'
			);
			dummyClub.events.push(event);
			dummyClub.save({ session: session });
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

exports.getAllClubs = getAllClubs;
exports.getClubById = getClubById;

exports.createClub = createClub;
exports.loginClub = loginClub;
exports.updateClub = updateClub;
exports.deleteClub = deleteClub;
