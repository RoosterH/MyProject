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
		users = await User.find({}, '-password').sort({ name: 1 });
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

	const { name, email, password, passwordValidation } = req.body;

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
		name,
		email,
		image: req.file.path,
		password: hashedPassword,
		events: []
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
		name: newUser.name,
		email: newUser.email,
		token: token
	});
};

// POST '/api/users/login'
const loginUser = async (req, res, next) => {
	const { name, password, email } = req.body;

	// validation to make sure email does not exist in our DB
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email.toLowerCase() });
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
			{ expiresIn: '24h' }
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
		name: existingUser.name,
		email: existingUser.email,
		token: token
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

	const { name, password, email } = req.body;
	const userId = req.userData.userId; // use userId from token instead of getting it from url to avoid hacking
	console.log('userId = ', userId);
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
	user.name = name;
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
	const userId = req.userData.userId; // use userId in the jwt instaed of getting it from url

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

	let userName = user.name;
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

		await user.remove({ session: session });
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

// GET /api/events/club/:cid
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

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.logoutUser = logoutUser;
exports.getEvents = getEvents;
