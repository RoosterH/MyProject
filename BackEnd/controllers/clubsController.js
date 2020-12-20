const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const HttpError = require('../models/httpError');
const Club = require('../models/club');
const ClubProfile = require('../models/clubProfile');
const ClubAccount = require('../models/clubAccount');
const Event = require('../models/event');
const { Encrypt, Decrypt } = require('../util/crypto');
const e = require('express');

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const Stripe = require('./stripeController.js');
const { request } = require('express');

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

	let originalImageLocation;
	let cloudFrontImageLocation;
	if (req.file) {
		originalImageLocation = req.file.location;
		cloudFrontImageLocation = originalImageLocation.replace(
			process.env.S3_URL,
			process.env.CLOUDFRONT_URL
		);
	}

	// req.file.location = https://myseattime-dev.s3.us-west-1.amazonaws.com/clubs/d20e6020-1e70-11eb-96c0-19998090542e.png
	// create club profile
	// default value cannot use emptry string
	const newClubProfile = new ClubProfile({
		webPage: 'undefined',
		faceBook: 'undefined',
		youTube: 'undefined',
		contactEmail: 'undefined',
		description: 'undefined',
		schedule: 'undefined',
		originalProfileImage: 'undefined',
		profileImage: 'undefined'
	});

	// create club account
	const newClubAccount = new ClubAccount({
		onSitePayment: false,
		stripePayment: true,
		stripeAccountId: undefined
	});

	// ! DO NOT REMOVE
	// ! Intentionally leave this outside of transaction.
	// ! Once the new collection been created, comment this section of codes
	// ! Workaround is to create the new collection from Atlas
	// Because Mongoose has a bug not able to create a new DB collection during transaction,
	// even the problem only happens at a fresh DB, we still want to leave this outside.
	// try {
	// 	await newClubProfile.save();
	// } catch (err) {
	// 	console.log('154 err = ', err);
	// 	const error = new HttpError(
	// 		'Create club failed when saving newClubProfile. Please try again later.',
	// 		500
	// 	);
	// 	return next(error);
	// }

	let newClub = new Club({
		name,
		email,
		originalImage: originalImageLocation,
		image: cloudFrontImageLocation,
		password: hashedPassword,
		events: []
	});

	let token;
	let counter = 0;
	try {
		// using transaction here to make sure all the operations are done
		const session = await mongoose.startSession();
		session.startTransaction();
		await newClub.save({ session: session });
		// jwt section
		// use ClubId and email as the payload
		// private key
		token = jwt.sign(
			{ clubId: newClub.id, email: newClub.email },
			JWT_PRIVATE_KEY,
			{ expiresIn: '1h' }
		);
		newClubProfile.clubId = newClub.id;
		let profile = await newClubProfile.save({ session: session });
		newClubAccount.clubId = newClub.id;
		let account = await newClubAccount.save({ session: session });
		console.log('account = ', account);
		newClub.profileId = profile.id;
		newClub.accountId = account.id;
		await newClub.save({ session: session });
		await session.commitTransaction();
	} catch (err) {
		console.log('193 err = ', err);
		const error = new HttpError(
			'Faied to create a new club. Please try again later.',
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

// PATCH '/api/clubs/credential'
const updateClubCredential = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update club credential process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const { oldPassword, newPassword, passwordValidation } = req.body;
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

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(
			oldPassword,
			club.password
		);
	} catch (err) {
		const error = new HttpError(
			'Change club password internal failure. Please try again later',
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
			'Faied to create a new club. Please try again later.',
			500
		);
		return next(error);
	}

	// update club info
	club.password = hashedPassword;

	try {
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

// PATCH '/api/clubs/:cid'
const updateClubProfile = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update club profile process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const {
		webPage,
		faceBook,
		youTube,
		contactEmail,
		description,
		schedule
	} = req.body;

	// use clubId from token instead of getting it from url to avoid hacking
	// req.userData is added in check-clubAuth middleware, information comes from front end
	// req.header.authorization
	const clubId = req.userData;
	let clubProfile;
	try {
		clubProfile = await ClubProfile.findOne({ clubId });
	} catch (err) {
		const error = new HttpError(
			'Update club profile process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!clubProfile) {
		const error = new HttpError(
			'Update club profile failed finding profile.',
			404
		);
		console.log('cannot find profile');
		return next(error);
	}

	let club;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Update club profile process internal failure @ finding club, please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Update club profile failed finding club.',
			404
		);
		console.log('cannot find club');
		return next(error);
	}

	// update club info
	if (webPage) {
		clubProfile.webPage = webPage;
	}
	if (faceBook) {
		clubProfile.faceBook = faceBook;
	}
	if (youTube) {
		clubProfile.youTube = youTube;
	}
	if (contactEmail) {
		clubProfile.contactEmail = contactEmail;
	}
	if (description) {
		clubProfile.description = description;
	}
	if (schedule) {
		clubProfile.schedule = schedule;
	}

	// check whether image or profile image been changed or not
	if (req.files) {
		if (req.files.clubImage) {
			let image = req.files.clubImage[0];
			if (image) {
				let originalImageLocation = image.location;
				club.originamImage = originalImageLocation;
				club.image = originalImageLocation.replace(
					process.env.S3_URL,
					process.env.CLOUDFRONT_URL
				);
			}
		}
		// we do not resize courseMap to small size
		if (req.files.clubProfileImage) {
			let clubProfileImage = req.files.clubProfileImage[0];
			if (clubProfileImage) {
				let profileImageLocation = clubProfileImage.location;
				clubProfile.originalCourseMap = profileImageLocation;
				clubProfile.profileImage = profileImageLocation.replace(
					process.env.S3_URL,
					process.env.CLOUDFRONT_URL
				);
			}
		}
	}

	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		await clubProfile.save({ session: session });
		await club.save({ session: session });
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Update club profile process failed to save, please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({
		clubProfile: clubProfile.toObject({
			getters: true
		})
	});
};

// GET /api/clubs/profile/
const getClubProfile = async (req, res, next) => {
	const clubId = req.userData;
	let clubProfile;
	try {
		// we don't want to return password field
		clubProfile = await ClubProfile.findOne({ clubId: clubId });
	} catch (err) {
		const error = new HttpError(
			'Get club profile process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!clubProfile) {
		const error = new HttpError('No club profile in the DB.', 404);
		return next(error);
	}

	if (clubProfile.webPage === 'undefined') {
		clubProfile.webPage = '';
	}
	if (clubProfile.faceBook === 'undefined') {
		clubProfile.faceBook = '';
	}
	if (clubProfile.youTube === 'undefined') {
		clubProfile.youTube = '';
	}
	// beacuse we chage email to all lower case
	if (clubProfile.contactEmail === 'undefined') {
		clubProfile.contactEmail = '';
	}
	if (clubProfile.description === 'undefined') {
		clubProfile.description = '';
	}
	if (clubProfile.schedule === 'undefined') {
		clubProfile.schedule = '';
	}
	if (clubProfile.profileImage === 'undefined') {
		clubProfile.profileImage = '';
	}

	let image;
	try {
		const club = await Club.findById(clubId);
		image = club.image;
	} catch (err) {
		const error = new HttpError(
			'Get club profile process failed. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({ clubProfile: clubProfile, image: image });
};

// PATCH '/api/clubs/:cid'
const updateClubAccount = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update club account process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const { onSitePayment, stripePayment } = req.body;

	// use clubId from token instead of getting it from url to avoid hacking
	// req.userData is added in check-clubAuth middleware, information comes from front end
	// req.header.authorization
	const clubId = req.userData;
	let clubAccount;
	try {
		clubAccount = await ClubAccount.findOne({ clubId });
	} catch (err) {
		const error = new HttpError(
			'Update club account process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!clubAccount) {
		const error = new HttpError(
			'Update club account failed finding account.',
			404
		);
		console.log('cannot find account');
		return next(error);
	}

	let club;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Update club account process internal failure @ finding club, please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Update club account failed finding club.',
			404
		);
		console.log('Update club account cannot find club');
		return next(error);
	}

	clubAccount.onSitePayment = onSitePayment;
	clubAccount.stripePayment = stripePayment;

	try {
		await clubAccount.save();
	} catch (err) {
		const error = new HttpError(
			'Update club account process failed to save, please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({
		clubAccount: clubAccount.toObject({
			getters: true
		})
	});
};

// GET /api/clubs/account/:cid
const getClubAccount = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'Get club account process failed.  You are not allowed to get club account.',
			403
		);
		return next(error);
	}

	let clubAccount;
	try {
		clubAccount = await ClubAccount.findOne({ clubId: clubId });
	} catch (err) {
		const error = new HttpError(
			'Get club account process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!clubAccount) {
		const error = new HttpError('No club account in the DB.', 404);
		return next(error);
	}

	res.status(200).json({
		clubAccount: clubAccount.toObject({
			getters: true
		})
	});
};

// GET /api/clubs/credential/:cid
const getClubCredential = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'Get club credential process failed.  You are not allowed to get club credential.',
			403
		);
		return next(error);
	}

	let club;
	try {
		// we don't want to return password field
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Get club credential process failed. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		clubCredential: club.toObject({
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

// GET /api/clubs/stripeAccount/:cid
const getClubStripeAccount = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'Get club stripe account process failed.  You are not allowed to get club stripe account.',
			403
		);
		return next(error);
	}

	let clubAccount;
	try {
		// we don't want to return password field
		clubAccount = await ClubAccount.findOne({ clubId: clubId });
	} catch (err) {
		const error = new HttpError(
			'Get club stripe account process failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!clubAccount) {
		const error = new HttpError(
			'Get club stripe account process failed. Please report it to admin.',
			500
		);
		return next(error);
	}

	let stripeAccountId;
	// check wheather Stripe AccountId been created or not, if it's default {} length is 0
	if (
		!clubAccount.stripeAccountId ||
		Object.keys(clubAccount.stripeAccountId).length === 0
	) {
		stripeAccountId === '';
	} else {
		stripeAccountId = Decrypt(clubAccount.stripeAccountId);
	}

	let stripeAccount = null;
	try {
		if (stripeAccountId !== '' && stripeAccountId !== undefined) {
			stripeAccount = await Stripe.getAccount(stripeAccountId);
		}
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Get club stripe account process failed. Unable to retrieve account from Stripe. Please try again.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		stripeAccount: stripeAccount
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
			res.status(200).json(entryFormData);
		} else {
			res.status(200).json({ entryFormData: '[]' });
		}
	} else {
		res.status(200).json(entryFormData);
	}
};

// this includes create and update event form
const createEventForm = async (req, res, next) => {
	// we need to get entryFormData from body
	const { entryFormData, saveTemplate } = req.body;

	// Validate clubId exists. If not, sends back an error
	let club;
	// req.userData is added in check-clubAuth middleware, information comes from front end
	// req.header.authorization
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
			' Your club does not own this event.',
			404
		);
		return next(error);
	}

	try {
		event = await Event.findById(eventId);
	} catch (err) {
		const error = new HttpError(
			'Internal failure in createEventForm when retriving event.',
			500
		);
		return next(error);
	}
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
			if (data.element === 'MultipleRadioButtonGroup') {
				data.options.map(option => {
					// loop through opt.options
					let [fieldName, choices] = formAnalysis(option);
					if (fieldName.startsWith('RunGroup')) {
						let optionChoices = [];
						optionChoices.push(choices);
						event.runGroupOptions.push(choices);
					}
				});
			} else {
				// form analysis here
				let [fieldName, choices] = formAnalysis(data);

				if (fieldName === 'RunGroupSingle') {
					// event.runGroupOptions = choices;
					// runGroupOptions is [[]]
					let optionChoices = [];
					optionChoices.push(choices);
					event.runGroupOptions.push(choices);
				} else if (fieldName === 'RaceClass') {
					event.raceClassOptions = choices;
				} else if (fieldName === 'WorkerAssignment') {
					event.workerAssignments = choices;
				}
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

	try {
		event = await Event.findById(eventId);
	} catch (err) {
		const error = new HttpError(
			'Internal failre in publishEvent when retriving event',
			500
		);
		return next(error);
	}
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
	//! @todo Multiple Day MultipleRadioButtonGroup
	// maybe for lunch options, race group and worker assignment should stay the same across the event
	if (!data.field_name) {
		return [null, null];
	}

	// Form field name is defined in frontend FormBuilder.js
	// "RunGroupSingle-" Race Group prefix for Single Choice Radiobutton
	// field_name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	let parseName = data.field_name.split('-');
	let fieldPrefix = parseName[0];
	let choices = [];

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
	return [fieldPrefix, choices];
};

exports.getAllClubs = getAllClubs;
exports.getClubById = getClubById;
exports.createClub = createClub;
exports.loginClub = loginClub;
exports.updateClubCredential = updateClubCredential;
exports.updateClubProfile = updateClubProfile;
exports.getClubProfile = getClubProfile;
exports.updateClubAccount = updateClubAccount;
exports.getClubAccount = getClubAccount;
exports.getClubCredential = getClubCredential;
exports.getClubStripeAccount = getClubStripeAccount;
exports.deleteClub = deleteClub;
exports.logoutClub = logoutClub;
exports.getEventForm = getEventForm;
exports.createEventForm = createEventForm;
exports.publishEvent = publishEvent;
