const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const HttpError = require('../models/httpError');
const Club = require('../models/club');
const Event = require('../models/event');

const config = require('../Config/Config');
const e = require('express');
const JWT_PRIVATE_KEY = config.JWT_PRIVATE_KEY;

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
			{ expiresIn: '168h' }
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
	const clubId = req.userData; // use clubId from token instead of getting it from url to avoid hacking
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
	const clubId = req.userData; // use clubId in the jwt instaed of getting it from url

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

		const dummyClubId = mongoose.Types.ObjectId(
			process.env.DUMMY_CLUBID
		);
		// transfer all the events to dummy club so the events won't be deleted
		await club.events.map(async event => {
			// assign the event clubId to dummyClub since we are deleting the original club
			event.clubId = dummyClubId;
			await event.save({
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

const getEventForm = async (req, res, next) => {
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Create event form process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Create event form process faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	// Validate eventId belonging to the found club. If not, sends back an error
	let event;
	const eventId = req.params.eid;
	// if club does not own the eventId, return error
	if (!club.events.includes(eventId)) {
		// Not found in clubs events
		const error = new HttpError(
			'Create event form process faied with unauthorized request.  Your club does not own this event.',
			404
		);
		return next(error);
	}

	try {
		event = await Event.findById(eventId);
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'Get EventForm for club process failed. Please try again later.',
			500
		);
		return next(error);
	}

	// this error is for DB not be able to find the event with provided ID
	if (!event) {
		const error = new HttpError(
			'Could not complete retrieving event form with provided event id',
			404
		);
		return next(error);
	}

	// 1. get eventFormData from DB,
	// 2. if not available check if club has entryFormTemplate
	// 3. return initialized db if nothing found
	let entryFormData = event.entryFormData;
	if (!entryFormData || entryFormData.length === 0) {
		if (club.entryFormTemplate.length > 0) {
			entryFormData = club.entryFormTemplate;
		} else {
			res.status(200).json({ entryFormData: '[]' });
		}
	}

	res.status(200).json(entryFormData);
};

// this includes create and update event form
const createEventForm = async (req, res, next) => {
	// we need to get entryFormData from body
	const { entryFormData, saveTemplate } = req.body;

	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Create event form process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Create event form process faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	// Validate eventId belonging to the found club. If not, sends back an error
	let event;
	const eventId = req.params.eid;
	// if club does not own the eventId, return error
	if (!club.events.includes(eventId)) {
		// Not found in clubs events
		const error = new HttpError(
			'Create event form process faied with unauthorized request.  Your club does not own this event.',
			404
		);
		return next(error);
	}

	event = await Event.findById(eventId);
	if (!event) {
		const error = new HttpError(
			'Create event form process internal failure',
			404
		);
		return next(error);
	}

	// overwrite the old formData, reason for it because to figure out what to/not to replace
	// is tidious and error prone, we are not going to have a form with a lot of data so hopefully
	// it won't impact performace by much.
	if (entryFormData && entryFormData.length > 0) {
		event.entryFormData = [];
		entryFormData.map(data => {
			event.entryFormData.push(data);
			// form analysis here
			let [fieldName, choices] = formAnalysis(data);
			if (fieldName === 'RunGroupSingle') {
				event.runGroupOptions = choices;
			} else if (fieldName === 'RaceClass') {
				event.raceClassOptions = choices;
			} else if (fieldName === 'WorkerAssignment') {
				event.workerAssignments = choices;
			}
		});
		// whenever entry form gets changed, always set published to false
		event.published = false;

		// save to template if flag is true
		if (saveTemplate) {
			club.entryFormTemplate = [];
			entryFormData.map(data => club.entryFormTemplate.push(data));
		}
	}

	try {
		if (saveTemplate) {
			await club.save();
		}
		await event.save();
		res
			.status(200)
			.json({ event: event.toObject({ getters: true }) });
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Create event form connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
};

const publishEvent = async (req, res, next) => {
	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Create event form process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Create event form process faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	// Validate eventId belonging to the found club. If not, sends back an error
	let event;
	const eventId = req.params.eid;
	// if club does not own the eventId, return error
	if (!club.events.includes(eventId)) {
		// Not found in clubs events
		const error = new HttpError(
			'Create event form process faied with unauthorized request.  Your club does not own this event.',
			404
		);
		return next(error);
	}

	event = await Event.findById(eventId);
	if (!event) {
		const error = new HttpError(
			'Create event form process internal failure',
			404
		);
		return next(error);
	}

	// event validation
	if (!event.entryFormData || event.entryFormData.length === 0) {
		const error = new HttpError(
			'Submit event failed. Please provide event entry form',
			500
		);
		return next(error);
	}

	event.published = true;

	try {
		await event.save();
		res
			.status(200)
			.json({ event: event.toObject({ getters: true }) });
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Submit event with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
};

// Form analysis
const formAnalysis = data => {
	// Form field name is defined in frontend FormBuilder.js
	// "RunGroupSingle-" Race Group prefix for Single Choice Radiobutton
	// field_name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	let parseName = data.field_name.split('-');
	console.log('parseName = ', parseName);
	let fieldPrefix = parseName[0];
	console.log('fieldPrefix = ', fieldPrefix);
	let choices = [];
	if (parseName[0] === 'RunGroupSingle') {
		// get the options
		// format of the
		// options: Array
		//    0: Object
		//       value: "0"
		//       text: "Morning Session 1"
		//       key: "raceRadioOption_0"
		// we will use {value: text} to compose our map
		// ex: {0: "Morning Session 1"}
		let options = data.options;
		for (var i = 0; i < options.length; ++i) {
			let option = options[i];
			// build up option map
			let value = option['text'];
			choices.push(value);
		}
	} else if (parseName[0] === 'RaceClass') {
		let options = data.options;
		for (var i = 0; i < options.length; ++i) {
			let option = options[i];
			// build up option map
			let value = option['text'];
			choices.push(value);
		}
	} else if (parseName[0] === 'WorkerAssignment') {
		let options = data.options;
		for (var i = 0; i < options.length; ++i) {
			let option = options[i];
			// build up option map
			let value = option['text'];
			choices.push(value);
		}
	}
	return [fieldPrefix, choices];
};

exports.getAllClubs = getAllClubs;
exports.getClubById = getClubById;
exports.createClub = createClub;
exports.loginClub = loginClub;
exports.updateClub = updateClub;
exports.deleteClub = deleteClub;
exports.logoutClub = logoutClub;
exports.getEventForm = getEventForm;
exports.createEventForm = createEventForm;
exports.publishEvent = publishEvent;
