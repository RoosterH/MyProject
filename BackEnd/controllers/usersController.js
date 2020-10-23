const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Entry = require('../models/entry');
const Event = require('../models/event');
const HttpError = require('../models/httpError');
const User = require('../models/user');

const config = require('../Config/Config');
const JWT_PRIVATE_KEY = config.JWT_PRIVATE_KEY;

// GET /api/users/
const getAllUsers = async (req, res, next) => {
	let users;
	try {
		// we don't want to return password field
		users = await User.find({}, '-password').sort({ userName: 1 });
	} catch (err) {
		const error = new HttpError(
			'Get all users process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!users || users.length === 0) {
		const error = new HttpError('No users in the DB.', 404);
		return next(error);
	}

	res.status(200).json({
		users: users.map(user => user.toObject({ getters: true }))
	});
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
	userId = req.params.cid;
	let user;
	try {
		// we don't want to return password field
		user = await User.findById(userId, '-password');
	} catch (err) {
		const error = new HttpError(
			'Get user process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError('No users in the DB.', 404);
		return next(error);
	}

	res.status(200).json({ user: user });
};

// POST '/api/users/signup'
const createUser = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Create user process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}

	const {
		userName,
		lastName,
		firstName,
		email,
		password,
		passwordValidation
	} = req.body;

	if (password !== passwordValidation) {
		const error = new HttpError(
			'Sign up user. Passwords do not match!',
			403
		);
		return next(error);
	}
	// validation to make sure email does not exist in our DB
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			'Signed up email validation failed. Please try again later',
			500
		);
		return next(error);
	}

	if (existingUser) {
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
			'Faied to create a new user. Please try again later.',
			500
		);
		return next(error);
	}

	const newUser = new User({
		userName,
		lastName,
		firstName,
		email,
		image: req.file.path,
		password: hashedPassword,
		entries: []
	});

	try {
		await newUser.save();
		// await is slow. need to send res here not outside; otherwise in case of
		// an error res will be sent first then back to catch(err) here
	} catch (err) {
		const error = new HttpError(
			'Faied to create a new user. Please try again later.',
			500
		);
		return next(error);
	}

	// jwt section
	let token;
	// use UserId and email as the payload
	// private key
	try {
		token = jwt.sign(
			{ userId: newUser.id, email: newUser.email },
			JWT_PRIVATE_KEY,
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Internal error. Faied to create a new user. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(201).json({
		userId: newUser.id,
		userName: newUser.userName,
		lastName: newUser.lastName,
		firstName: newUser.firstName,
		email: newUser.email,
		token: token,
		entries: [],
		garage: []
	});
};

// POST '/api/users/login'
const loginUser = async (req, res, next) => {
	const { userName, email, password } = req.body;

	// validation to make sure email does not exist in our DB
	let existingUser;
	try {
		existingUser = await User.findOne({
			email: email.toLowerCase()
		}).populate('entries');
	} catch (err) {
		const error = new HttpError(
			'Login user process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!existingUser) {
		const error = new HttpError(
			'Login user failed. Invalid user Name/email and password',
			403
		);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(
			password,
			existingUser.password
		);
	} catch (err) {
		const error = new HttpError(
			'Login user internal failure. Please try again later',
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
	// use userId and email as the payload, when we decode the payload will be
	// returned along with the token
	try {
		// encoding
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			JWT_PRIVATE_KEY,
			{ expiresIn: '168h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Internal error. Faied to login user. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		userId: existingUser.id,
		userName: existingUser.userName,
		email: existingUser.email,
		token: token,
		entries: existingUser.entries,
		image: existingUser.image
	});
};

// PATCH '/api/users/:cid'
const updateUser = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update user process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const { userName, password, email } = req.body;
	const userId = req.userData; // use userId from token instead of getting it from url to avoid hacking

	let user;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'Update user process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Update user failed finding the user.',
			404
		);
		return next(error);
	}

	// update user info
	user.userName = userName;
	user.password = password;
	user.email = email;

	let hashedPassword;
	try {
		// set password to hashed password. genSalt = 12
		user.password = await bcrypt.hash(password, 12);

		await user.save();
	} catch (err) {
		const error = new HttpError(
			'Update user internal failure. Please try again later',
			500
		);
		return next(error);
	}

	res.status(200).json({
		user: user.toObject({
			getters: true,
			// use transform to filter out password
			transform: (doc, ret, opt) => {
				delete ret['password'];
				return ret;
			}
		})
	});
};

// DELETE '/api/users/:cid'
const deleteUser = async (req, res, next) => {
	const userId = req.userData; // use userId in the jwt instaed of getting it from url

	let user;
	try {
		// we need to populate events for the deleting user
		// so we could re-assign those events to dummy user and add them to
		// dummy user(MySeatTime) events list
		user = await User.findById(userId).populate('events');
	} catch (err) {
		const error = new HttpError(
			'Delete user process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Delete user process failed finding user.',
			404
		);
		return next(error);
	}

	let userName = user.userName;
	// We do not want to delete all the associated events with users.
	// Instead we will be assiging the associated userId to our dummy user (MySeatTime).
	try {
		// using transaction here to make sure all the operations are done
		const session = await mongoose.startSession();
		session.startTransaction();

		const dummyUserId = mongoose.Types.ObjectId(
			process.env.DUMMY_CLUBID
		);
		// transfer all the events to dummy user so the events won't be deleted
		// user has fewer requests than event so we want to execute it first to avoid locking event for longer time
		await user.remove({ session: session });
		await user.events.map(async event => {
			// assign the event userId to dummyUser since we are deleting the original user
			event.userId = dummyUserId;
			await event.save({
				session: session
			});

			/**
			 * push the event to dummyUser events list
			 * We need to use await, otherwise, it won't work.
			 * In order to use await, we need to make the callback as async
			 */
			let dummyUser = await User.findById(dummyUserId).populate(
				'events'
			);
			dummyUser.events.push(event);
			await dummyUser.save({ session: session });
		});
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Delete user failed, please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: `User ${userName} is deleted.` });
};

const logoutUser = (req, res) => {
	res.status(200).json({ message: `You are logged out.` });
};

// GET /api/users/events/:uid
const getEvents = async (req, res, next) => {
	const uId = req.params.uid;

	let entries;
	try {
		// populate allows us to access a document in another collection
		// and to work with data in that existing document
		entries = await Entry.find({ userId: uId }).populate({
			path: 'events',
			options: { sort: { startDate: -1, endDate: -1 } }
		}); //({ endDate: 1 });
	} catch (err) {
		const error = new HttpError(
			'Get user events process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entries || entries.length === 0) {
		const error = new HttpError('Could not find any event.', 404);
		return next(error);
	}

	let events;
	try {
		// If you use await in a map, map will always return an array of promises.
		// This is because asynchronous functions always return promises.
		const promises = entries.map(async entry => {
			let eventId = entry.eventId;
			const event = await Event.findById(eventId);
			return event;
		});
		// Since map always return promises (if you use await), you have to wait for the array of promises to get resolved.
		// You can do this with await Promise.all(arrayOfPromises).
		events = await Promise.all(promises);
	} catch {
		const error = new HttpError(
			'Retrieving user events process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!events || events.length === 0) {
		const error = new HttpError(
			'Retrieving events from DB failed. Please try again later',
			500
		);
		return next(error);
	}

	res.status(200).json({
		events: events.map(event =>
			event.toObject({
				getters: true
			})
		)
	});
};

const getEntry = async (req, res, next) => {
	const eId = req.params.eid;
	let uId = req.userData;

	let entry;
	try {
		// populate allows us to access a document in another collection
		// and to work with data in that existing document
		entry = await Entry.findOne({
			userId: uId,
			eventId: eId
		});
	} catch (err) {
		const error = new HttpError(
			'Get user entry process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		const error = new HttpError(
			'Could not find entry for this user.',
			404
		);
		return next(error);
	}

	res.status(200).json({
		entry: entry.toObject({
			getters: true
		})
	});
};

// /api/users/form/:eid
const getEventEntryForm = async (req, res, next) => {
	// Validate eventId belonging to the found club. If not, sends back an error
	const eventId = req.params.eid;

	let event;
	try {
		event = await Event.findById(eventId).populate('entries');
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'getEventEntryFormAnswerprocess failed. Please try again later.',
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

	let entryFormData = event.entryFormData;
	if (!entryFormData || entryFormData.length === 0) {
		const error = new HttpError(
			'Could not find the entry form. Please report to club.',
			404
		);
		return next(error);
	}

	res.status(200).json({
		eventName: event.name,
		entryFormData: entryFormData
	});
};

// /api/users/formWithAnswer/:eid
const getEventEntryFormWithAnswer = async (req, res, next) => {
	// Validate eventId belonging to the found club. If not, sends back an error
	const eventId = req.params.eid;
	const userId = req.userData;

	let event;
	try {
		event = await Event.findById(eventId).populate('entries');
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'getEventEntryFormAnswerprocess failed. Please try again later.',
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

	let entryFormData = event.entryFormData;
	if (!entryFormData || entryFormData.length === 0) {
		const error = new HttpError(
			'Could not find the entry form. Please report to club.',
			404
		);
		return next(error);
	}

	// look for user's entries
	let entry;
	try {
		entry = await Entry.findOne({ userId: userId, eventId: eventId });
	} catch (err) {
		const error = new HttpError(
			'getEventEntryFormAnswer entry process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		console.log('entry not found');
		const error = new HttpError(
			'Could not find entry in getEventEntryFormWithAnswer.',
			404
		);
		return next(error);
	}

	res.status(200).json({
		eventName: event.name,
		entryFormData: entryFormData,
		entry: entry.toObject({
			getters: true
		})
	});
};

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.logoutUser = logoutUser;
exports.getEvents = getEvents;
exports.getEntry = getEntry;
exports.getEventEntryForm = getEventEntryForm;
exports.getEventEntryFormWithAnswer = getEventEntryFormWithAnswer;
