const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const moment = require('moment');

const crypto = require('crypto');
const { Encrypt, Decrypt } = require('../util/crypto');
const {
	sendVerificationEmail,
	sendAccountActivationEmail
} = require('../util/nodeMailer');
const Entry = require('../models/entry');
const Event = require('../models/event');
const HttpError = require('../models/httpError');
const Payment = require('../models/payment');
const Stripe = require('./stripeController');
const User = require('../models/user');
const UserAccount = require('../models/userAccount');
const Token = require('../models/token');

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

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
		existingUser = await User.findOne({ email: email.toLowerCase() });
	} catch (err) {
		const error = new HttpError(
			'Sign up email validation failed. Please try again later',
			500
		);
		return next(error);
	}
	if (existingUser) {
		const error = new HttpError(
			'Signup failed. Email has been used to sign up.',
			422
		);
		return next(error);
	}

	try {
		existingUser = await User.findOne({ userName: userName });
	} catch (err) {
		const error = new HttpError(
			'Sign up username validation failed. Please try again later',
			500
		);
		return next(error);
	}
	if (existingUser) {
		const error = new HttpError(
			'UserName has been taken, please choose a different one.',
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

	let originalImageLocation;
	let smallImageLocation;
	let cloudFrontImageLocation;
	if (req.file) {
		let transformArray = req.file.transforms;
		transformArray.map(transform => {
			if (transform.id === 'original') {
				originalImageLocation = transform.location.replace(
					process.env.S3_URL,
					''
				);
			} else if (transform.id === 'small') {
				smallImageLocation = transform.location.replace(
					process.env.S3_URL,
					''
				);
				cloudFrontImageLocation = smallImageLocation.replace(
					process.env.S3_URL,
					''
				);
			}
		});
	}

	let normUserName = userName.toLowerCase();
	let normLastName =
		lastName.charAt(0).toUpperCase() +
		lastName.slice(1).toLowerCase();
	let normFirstName =
		firstName.charAt(0).toUpperCase() +
		firstName.slice(1).toLowerCase();
	let normEmail = email.toLowerCase();

	const newUser = new User({
		userName: normUserName,
		lastName: normLastName,
		firstName: normFirstName,
		email: normEmail,
		originalImage: originalImageLocation,
		smallImage: smallImageLocation,
		image: cloudFrontImageLocation,
		password: hashedPassword,
		entries: []
	});

	// create Stripe customer obj
	let customer;
	try {
		customer = await Stripe.createCustomer(
			normLastName + ', ' + normFirstName,
			normEmail
		);
	} catch (err) {
		const error = new HttpError(
			'createUser failed @ Stripe createCustomer, please try again.',
			500
		);
		return next(error);
	}
	// save stripe customer id
	newUser.stripeCustomerId = customer.id;

	// create userAccount table
	let userAccount = new UserAccount({
		// initialize encrpted objects
		address: undefined,
		city: undefined,
		state: '.',
		zip: '.',
		phone: undefined,
		emergency: '.',
		emergencyPhone: undefined
	});
	try {
		await userAccount.save();
	} catch (err) {
		console.log(' userController creat userAccount failed = ', err);
		const error = new HttpError(
			'Faied to create a new user account. Please try again later.',
			500
		);
		return next(error);
	}
	try {
		newUser.accountId = userAccount.id;
		await newUser.save();
		// await is slow. need to send res outside not here; otherwise in case of
		// an error res will be sent first then back to catch(err) here
	} catch (err) {
		console.log('createUser err = ', err);
		const error = new HttpError(
			'Faied to create a new user. Please try again later.',
			500
		);
		return next(error);
	}
	// add userId to userAccount
	try {
		userAccount.userId = newUser.id;
		await userAccount.save();
	} catch (err) {
		console.log(
			' userController saving userId to userAccount failed = ',
			err
		);
		const error = new HttpError(
			'Internal error. Faied to save userId to account. Please try again later.',
			500
		);
		return next(error);
	}

	// prepare verification email
	// generate token and save
	let token = new Token({
		userId: newUser.id,
		token: crypto.randomBytes(128).toString('hex')
	});

	try {
		await token.save();
	} catch (err) {
		console.log('createUser err = ', err);
		const error = new HttpError(
			'Faied to issue an email verification token. Please login and request system to send it again.',
			500
		);
		return next(error);
	}

	try {
		// send verification email
		sendVerificationEmail(true, normFirstName, normEmail, token);
	} catch (err) {
		console.log('Create user send verification email failure ', err);
		const error = new HttpError(
			'Faied to send a verification email. Please login and request to re-send verification email.',
			500
		);
		return next(error);
	}

	// jwt section
	let jwttoken;
	// use UserId and email as the payload
	// private key
	try {
		jwttoken = jwt.sign(
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
		token: jwttoken,
		entries: [],
		garage: []
	});
};

// GET /users/confirmation/:email/:token
const confirmUserEmail = async (req, res, next) => {
	let email = req.params.email;
	let userToken = req.params.token;

	let user;
	try {
		user = await User.findOne({ id: userToken.userId, email: email });
	} catch (err) {
		console.log('confirmUserEmail err @ finding user = ', err);
		const error = new HttpError(
			'confirmUserEmail error @ finding user.',
			500
		);

		return next(error);
	}
	if (!user) {
		console.log('no user');
		return res.status(400).json({
			user: false,
			token: false,
			verified: false,
			hideErrorPopup: true
		});
	}

	if (user.verified) {
		return res
			.status(200)
			.json({ user: true, token: true, verified: true });
	}

	let token;
	try {
		token = await Token.findOne({
			userId: user.id,
			token: userToken
		});
	} catch (err) {
		console.log('confirmUserEmail err @ finding token = ', err);
		const error = new HttpError(
			'confirmUserEmail error @ finding token',
			500
		);

		return next(error);
	}

	// token is not found into database i.e. token may have expired
	if (!token) {
		return res.status(400).json({
			user: true,
			token: false,
			verified: false,
			hideErrorPopup: true
		});
	}

	// verify user
	// change verified to true
	user.verified = true;
	try {
		await user.save();
	} catch (err) {
		console.log('confirmUserEmail err @ saving user = ', err);
		const error = new HttpError(
			'confirmUserEmail error @ saving user',
			500
		);

		return next(error);
	}

	// find all tokens belonging to this user and purge them all
	let tokens;
	try {
		tokens = await Token.find({ userId: user.id });
	} catch (err) {
		// DO NOT return HttpError
		console.log(
			'resendUserConfirmationEmail error @ finding old tokens.'
		);
	}

	for (let i = 0; i < tokens.length; ++i) {
		try {
			await tokens[i].delete();
		} catch (err) {
			// DO NOT return HttpError
			console.log(
				'resendUserConfirmationEmail error @ deleting old tokens.'
			);
		}
	}

	// send successfully signup email
	try {
		sendAccountActivationEmail(true, user.firstName, user.email);
	} catch (err) {
		// DO NOT return HttpError
		console.log('confirmUserEmail err = ', err);
	}

	return res
		.status(200)
		.json({ user: true, token: true, verified: true });
};

// GET /users/sendConfirmationEmail/:email
const resendUserConfirmationEmail = async (req, res, next) => {
	const email = req.params.email;
	let user;
	try {
		user = await User.findOne({ email: email.toLowerCase() });
	} catch (err) {
		console.log(
			'resendUserConfirmationEmail err @ finding user = ',
			err
		);
		const error = new HttpError(
			'resendUserConfirmationEmail error @ finding user.',
			500
		);

		return next(error);
	}
	if (!user) {
		console.log('no user');
		return res.status(400).json({
			user: false,
			resendStatus: false,
			hideErrorPopup: true
		});
	}

	if (user.verified) {
		return res
			.status(200)
			.json({ user: true, verified: true, resendStatus: false });
	}

	// find old tokens purge them
	let oldTokens;
	try {
		oldTokens = await Token.find({ userId: user.id });
	} catch (err) {
		console.log(
			'resendUserConfirmationEmail error @ finding old tokens.'
		);
	}

	for (let i = 0; i < oldTokens.length; ++i) {
		try {
			await oldTokens[i].delete();
		} catch (err) {
			console.log(
				'resendUserConfirmationEmail error @ deleting old tokens.'
			);
		}
	}

	// resend link,  prepare verification email
	// generate token and save
	let token = new Token({
		userId: user.id,
		token: crypto.randomBytes(128).toString('hex')
	});

	try {
		await token.save();
	} catch (err) {
		console.log('createUser err = ', err);
		const error = new HttpError(
			'Faied to issue an email verification token. Please request the verification link again.',
			500
		);
		return next(error);
	}

	try {
		// send verification email
		sendVerificationEmail(
			true,
			user.firstName,
			email.toLowerCase(),
			token
		);
	} catch (err) {
		console.log('Create user send verification email failure ', err);
		const error = new HttpError(
			'Faied to send a verification email. Please login and request to re-send verification email.',
			500
		);
		return next(error);
	}

	res
		.status(200)
		.json({ user: true, verified: false, resendStatus: true });
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

	// check email has been verified or not
	if (!existingUser.verified) {
		return res.status(400).json({
			hideErrorPopup: true,
			verified: false
		});
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

	let cloudFrontImage =
		process.env.CLOUDFRONT_URL + existingUser.image;

	try {
		var userAccount = await UserAccount.findOne({
			userId: existingUser.id
		});
	} catch (err) {
		console.log('loginUser finding userAccout failed err = ', err);
		const error = new HttpError(
			'loginUser finding userAccout failed err, please try again. '
		);
		return next(error);
	}

	// we do not want to return all the entries to FrontEnd
	// we only need to return ongoing events
	let ongoingEntries = [];
	let entries = existingUser.entries;
	let today = moment();
	for (let i = 0; i < entries.length; ++i) {
		// check event end date if it's same or before today
		try {
			var event = await Event.findById(entries[i].eventId);
		} catch (err) {
			console.log(
				'loginUser finding user entries failed err = ',
				err
			);
			const error = new HttpError(
				'loginUser finding user entries failed err, please try again. '
			);
			return next(error);
		}
		if (moment(event.endDate).isSameOrBefore(today)) {
			continue;
		}
		ongoingEntries.push(entries[i]);
	}

	res.status(200).json({
		userId: existingUser.id,
		userName: existingUser.userName,
		email: existingUser.email,
		token: token,
		entries: ongoingEntries,
		image: cloudFrontImage,
		verified: true,
		completed: userAccount.completed
	});
};

// GET /api/users/account/:uid
const getUserAccount = async (req, res, next) => {
	let userIdParam = req.params.uid;
	const userId = req.userData;
	if (userIdParam !== userId) {
		const error = new HttpError(
			'You are not allowed to get this user account info.',
			403
		);
		return next(error);
	}

	let user;
	try {
		// we don't want to return password field
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'getUserAccount get user process failed. Please try again later.',
			500
		);
		return next(error);
	}

	let accountId = user.accountId;
	let account;
	try {
		account = await UserAccount.findById(accountId);
	} catch (err) {
		const error = new HttpError(
			'getUserAccount get user account process failed. Please try again later.',
			500
		);
		return next(error);
	}

	let address;
	if (!account.address || Object.keys(account.address).length === 0) {
		address = '';
	} else {
		address = Decrypt(account.address);
	}

	let city;
	if (!account.city || Object.keys(account.city).length === 0) {
		city = '';
	} else {
		city = Decrypt(account.city);
	}
	let phone;
	if (!account.phone || Object.keys(account.phone).length === 0) {
		phone = '';
	} else {
		phone = Decrypt(account.phone);
	}
	let emergencyPhone;
	if (
		!account.emergencyPhone ||
		Object.keys(account.emergencyPhone).length === 0
	) {
		emergencyPhone = '';
	} else {
		emergencyPhone = Decrypt(account.emergencyPhone);
	}

	res.status(200).json({
		userName: user.userName,
		lastName: user.lastName,
		firstName: user.firstName,
		address: address,
		city: city,
		state: account.state,
		zip: account.zip,
		phone: phone,
		emergency: account.emergency,
		emergencyPhone: emergencyPhone,
		validDriver: account.validDriver,
		disclaimer: account.disclaimer,
		completed: account.completed
	});
};

// PATCH '/api/users/account/:uid'
const updateUserAccount = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update user account process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const {
		address,
		city,
		state,
		zip,
		phone,
		emergency,
		emergencyPhone,
		validDriver,
		disclaimer
	} = req.body;

	const userId = req.userData; // use userId from token instead of getting it from url to avoid hacking

	let user;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'Update user account process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Update user account failed finding the user.',
			404
		);
		return next(error);
	}

	let accountId = user.accountId;
	let userAccount;
	try {
		userAccount = await UserAccount.findById(accountId);
	} catch (err) {
		const error = new HttpError(
			'Update user account process failed @ finding user accout, please try again later.',
			500
		);
		return next(error);
	}
	if (!userAccount) {
		const error = new HttpError(
			'Update user account failed finding the account.',
			404
		);
		return next(error);
	}

	// update user info
	userAccount.address = Encrypt(address);
	userAccount.city = Encrypt(city);
	userAccount.state = state;
	userAccount.zip = zip;
	userAccount.phone = Encrypt(phone);
	userAccount.emergency = emergency;
	userAccount.emergencyPhone = Encrypt(emergencyPhone);
	userAccount.validDriver = validDriver;
	userAccount.disclaimer = disclaimer;
	userAccount.completed = validDriver && disclaimer;

	try {
		await userAccount.save();
	} catch (err) {
		const error = new HttpError(
			'Update user account internal failure. Please try again later',
			500
		);
		return next(error);
	}

	res.status(200).json({
		userName: user.userName,
		lastName: user.lastName,
		firstName: user.firstName,
		address: address,
		city: city,
		state: state,
		zip: zip,
		phone: phone,
		emergency: emergency,
		emergencyPhone: emergencyPhone,
		validDriver: validDriver,
		disclaimer: disclaimer,
		completed: userAccount.completed
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
		return res.status(200).json({
			events: []
		});
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

	events.map(event => {
		// set path for all images
		event.set('image', process.env.CLOUDFRONT_URL + event.image, {
			strict: false
		});
		event.set(
			'clubImage',
			process.env.CLOUDFRONT_URL + event.clubImage,
			{ strict: false }
		);
		event.set(
			'courseMap',
			process.env.CLOUDFRONT_URL + event.courseMap,
			{ strict: false }
		);
	});

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

	let payment;
	try {
		payment = await Payment.findById(entry.paymentId);
	} catch (err) {
		const error = new HttpError(
			'Get user entry process failed @ getting payment. Please try again later',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'Could not find payment for this entry.',
			404
		);
		return next(error);
	}

	res.status(200).json({
		entry: entry.toObject({
			getters: true
		}),
		paymentStatus: payment.paymentStatus
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

// GET /api/users/credential/:uid
const getUserCredential = async (req, res, next) => {
	let userIdParam = req.params.uid;
	const userId = req.userData;
	if (userIdParam !== userId) {
		const error = new HttpError(
			'You are not allowed to get this user credential.',
			403
		);
		return next(error);
	}

	let user;
	try {
		// we don't want to return password field
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'Get user credential process failed. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		userCredential: user.toObject({
			getters: true,
			transform: (doc, ret, opt) => {
				delete ret['name'];
				delete ret['password'];
				delete ret['originalImage'];
				delete ret['image'];
				delete ret['events'];
				delete ret['entryFormTemplate'];
				return ret;
			}
		})
	});
};

// PATCH '/api/users/credential'
const updateUserCredential = async (req, res, next) => {
	let userIdParam = req.params.uid;
	// use userId from token instead of getting it from url to avoid hacking
	const userId = req.userData;
	if (userIdParam !== userId) {
		const error = new HttpError(
			'You are not allowed to get this user credential.',
			403
		);
		return next(error);
	}

	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update user credential process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const { oldPassword, newPassword, passwordValidation } = req.body;
	let user;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'Update user credential process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Update user credential failed finding the user.',
			404
		);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(
			oldPassword,
			user.password
		);
	} catch (err) {
		const error = new HttpError(
			'Change user password internal failure. Please try again later',
			500
		);
		return next(error);
	}
	if (!isValidPassword) {
		const error = new HttpError(
			'Please provide correct old password',
			403
		);
		return next(error, false);
	}

	if (newPassword === oldPassword) {
		const error = new HttpError(
			'New password needs to be different from old password.',
			403
		);
		return next(error);
	}

	if (newPassword !== passwordValidation) {
		const error = new HttpError('New passwords do not match!', 403);
		return next(error);
	}

	let hashedPassword;
	try {
		// set password to hashed password. genSalt = 12
		hashedPassword = await bcrypt.hash(newPassword, 12);
	} catch (err) {
		const error = new HttpError(
			'Faied to create a new user password. Please try again later.',
			500
		);
		return next(error);
	}

	// update user credential
	user.password = hashedPassword;

	try {
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
				delete ret['name'];
				delete ret['password'];
				delete ret['originalImage'];
				delete ret['image'];
				delete ret['events'];
				delete ret['entryFormTemplagte'];
				return ret;
			}
		})
	});
};

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.confirmUserEmail = confirmUserEmail;
exports.resendUserConfirmationEmail = resendUserConfirmationEmail;
exports.loginUser = loginUser;
exports.getUserAccount = getUserAccount;
exports.updateUserAccount = updateUserAccount;
exports.getUserCredential = getUserCredential;
exports.updateUserCredential = updateUserCredential;
exports.deleteUser = deleteUser;
exports.logoutUser = logoutUser;
exports.getEvents = getEvents;
exports.getEntry = getEntry;
exports.getEventEntryForm = getEventEntryForm;
exports.getEventEntryFormWithAnswer = getEventEntryFormWithAnswer;
