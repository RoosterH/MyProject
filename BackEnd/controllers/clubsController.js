const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const csvtojson = require('csvtojson');
const moment = require('moment');

const HttpError = require('../models/httpError');
const Club = require('../models/club');
const ClubProfile = require('../models/clubProfile');
const ClubAccount = require('../models/clubAccount');
const ClubEventSettings = require('../models/clubEventSettings');
const ClubMember = require('../models/clubMember');
const User = require('../models/user');
const UserAccount = require('../models/userAccount');
const crypto = require('crypto');
const Event = require('../models/event');
const Email = require('../models/email');
const { Encrypt, Decrypt } = require('../util/crypto');
const {
	sendVerificationEmail,
	sendAccountActivationEmail,
	sendClubEmail
} = require('../util/nodeMailer');
const Token = require('../models/token');

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const Stripe = require('./stripeController.js');
const { request } = require('express');
const { CostExplorer } = require('aws-sdk');
const AWS = require('aws-sdk');
const club = require('../models/club');

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

// GET /api/clubs/clubProfile/:cid
const getClubProfileForUsers = async (req, res, next) => {
	const clubId = req.params.cid;
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
	// club logo
	let image;
	try {
		const club = await Club.findById(clubId);
		image = process.env.CLOUDFRONT_URL + club.image;
	} catch (err) {
		const error = new HttpError(
			'Get club profile process failed. Please try again later.',
			500
		);
		return next(error);
	}

	clubProfile.set(
		'profileImage',
		process.env.CLOUDFRONT_URL + clubProfile.profileImage,
		{ strict: true }
	);
	res.status(200).json({ clubProfile: clubProfile, image: image });
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
		originalImageLocation = req.file.location.replace(
			process.env.S3_URL,
			''
		);
		cloudFrontImageLocation = originalImageLocation;
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

	// create club event settings
	const newClubEventSettings = new ClubEventSettings({
		hostPrivateEvent: false,
		memberSystem: false
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
		sesEmail: email,
		originalImage: originalImageLocation,
		image: cloudFrontImageLocation,
		password: hashedPassword,
		events: []
	});

	try {
		var jwttoken;
		// using transaction here to make sure all the operations are done
		const session = await mongoose.startSession();
		session.startTransaction();
		await newClub.save({ session: session });
		// jwt section
		// use ClubId and email as the payload
		// private key
		jwttoken = jwt.sign(
			{ clubId: newClub.id, email: newClub.email },
			JWT_PRIVATE_KEY,
			{ expiresIn: '1h' }
		);
		newClubProfile.clubId = newClub.id;
		let profile = await newClubProfile.save({ session: session });
		newClubAccount.clubId = newClub.id;
		let account = await newClubAccount.save({ session: session });
		newClubEventSettings.clubId = newClub.id;
		let eventSettings = await newClubEventSettings.save({
			session: session
		});
		newClub.profileId = profile.id;
		newClub.accountId = account.id;
		newClub.eventSettingsId = eventSettings.id;
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

	// prepare verification email
	// generate token and save
	let token = new Token({
		userId: newClub.id,
		token: crypto.randomBytes(128).toString('hex')
	});

	try {
		await token.save();
	} catch (err) {
		console.log('create club err @ saving token = ', err);
		const error = new HttpError(
			'Faied to issue an email verification token to club. Please login and request system to send it again.',
			500
		);
		return next(error);
	}

	try {
		// send verification email
		sendVerificationEmail(false, name, email, token);
	} catch (err) {
		console.log('Create club send verification email failure ', err);
		const error = new HttpError(
			'Faied to send a verification email to club. Please login and request to re-send verification email.',
			500
		);
		return next(error);
	}

	res.status(201).json({
		clubId: newClub.id,
		name: newClub.name,
		email: newClub.email,
		token: jwttoken
	});
};

// GET /clubs/confirmation/:email/:token
const confirmClubEmail = async (req, res, next) => {
	let email = req.params.email;
	let clubToken = req.params.token;

	try {
		var club = await Club.findOne({
			id: clubToken.clubId,
			email: email
		});
	} catch (err) {
		console.log('confirmClubEmail err @ finding club = ', err);
		const error = new HttpError(
			'confirmClubEmail error @ finding club.',
			500
		);

		return next(error);
	}
	if (!club) {
		console.log('no club found');
		return res.status(400).json({
			club: false,
			token: false,
			verified: false,
			hideErrorPopup: true
		});
	}

	if (club.verified) {
		return res
			.status(200)
			.json({ club: true, token: true, verified: true });
	}

	let token;
	try {
		token = await Token.findOne({
			userId: club.id,
			token: clubToken
		});
	} catch (err) {
		console.log('confirmClubEmail err @ finding token = ', err);
		const error = new HttpError(
			'confirmClubEmail error @ finding token',
			500
		);

		return next(error);
	}

	// token is not found into database i.e. token may have expired
	if (!token) {
		return res.status(400).json({
			club: true,
			token: false,
			verified: false,
			hideErrorPopup: true
		});
	}

	// verify club
	// change verified to true
	club.verified = true;
	try {
		await club.save();
	} catch (err) {
		console.log('confirmClubEmail err @ saving club = ', err);
		const error = new HttpError(
			'confirmClubEmail error @ saving club',
			500
		);

		return next(error);
	}

	// find all tokens belonging to this club and purge them all
	let tokens;
	try {
		tokens = await Token.find({ userId: club.id });
	} catch (err) {
		console.log(
			'resendClubConfirmationEmail error @ finding old tokens.'
		);
	}

	for (let i = 0; i < tokens.length; ++i) {
		try {
			await tokens[i].delete();
		} catch (err) {
			console.log(
				'resendClubConfirmationEmail error @ deleting old tokens.'
			);
		}
	}

	// send successful account activation email
	try {
		console.log('sending account activation email = ', club.email);
		sendAccountActivationEmail(false, club.name, club.email);
	} catch (err) {
		// DO NOT return HttpError
		console.log('confirmClubEmail err = ', err);
	}

	return res
		.status(200)
		.json({ club: true, token: true, verified: true });
};

// GET /clubs/sendConfirmationEmail/:email
const resendClubConfirmationEmail = async (req, res, next) => {
	const email = req.params.email;
	try {
		var club = await Club.findOne({ email: email.toLowerCase() });
	} catch (err) {
		console.log(
			'resendClubConfirmationEmail err @ finding club = ',
			err
		);
		const error = new HttpError(
			'resendClubConfirmationEmail error @ finding club.',
			500
		);

		return next(error);
	}
	if (!club) {
		console.log('no club');
		return res.status(400).json({
			club: false,
			resendStatus: false,
			hideErrorPopup: true
		});
	}

	if (club.verified) {
		return res
			.status(200)
			.json({ club: true, verified: true, resendStatus: false });
	}

	// find old tokens purge them
	let oldTokens;
	try {
		oldTokens = await Token.find({ userId: club.id });
	} catch (err) {
		console.log(
			'resendClubConfirmationEmail error @ finding old tokens.'
		);
	}

	for (let i = 0; i < oldTokens.length; ++i) {
		try {
			await oldTokens[i].delete();
		} catch (err) {
			console.log(
				'resendClubConfirmationEmail error @ deleting old tokens.'
			);
		}
	}

	// resend link,  prepare verification email
	// generate token and save
	let token = new Token({
		userId: club.id,
		token: crypto.randomBytes(128).toString('hex')
	});

	try {
		await token.save();
	} catch (err) {
		console.log('createClub err = ', err);
		const error = new HttpError(
			'Faied to issue an email verification token. Please request the verification link again.',
			500
		);
		return next(error);
	}

	try {
		// send verification email
		sendVerificationEmail(
			false,
			club.name,
			email.toLowerCase(),
			token
		);
	} catch (err) {
		console.log('Create club send verification email failure ', err);
		const error = new HttpError(
			'Faied to send a verification email. Please login and request to re-send verification email.',
			500
		);
		return next(error);
	}

	res
		.status(200)
		.json({ club: true, verified: false, resendStatus: true });
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

	// check email has been verified or not
	if (!existingClub.verified) {
		return res.status(400).json({
			hideErrorPopup: true,
			verified: false
		});
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
		token: token,
		verified: true
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

// PATCH '/api/clubs/profile'
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
				club.originalImage = originalImageLocation.replace(
					process.env.S3_URL,
					''
				);
				club.image = originalImageLocation.replace(
					process.env.S3_URL,
					''
				);
			}
		}
		// we do not resize courseMap to small size
		if (req.files.clubProfileImage) {
			let clubProfileImage = req.files.clubProfileImage[0];
			if (clubProfileImage) {
				let profileImageLocation = clubProfileImage.location;
				clubProfile.originalProfileImage = profileImageLocation.replace(
					process.env.S3_URL,
					''
				);
				clubProfile.profileImage = profileImageLocation.replace(
					process.env.S3_URL,
					''
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

	// add CLOUDFRONT_URL for profileImage
	clubProfile.set(
		'profileImage',
		process.env.CLOUDFRONT_URL + clubProfile.image,
		{ strict: true }
	);
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

	// club logo
	let image;
	try {
		const club = await Club.findById(clubId);
		image = process.env.CLOUDFRONT_URL + club.image;
	} catch (err) {
		const error = new HttpError(
			'Get club profile process failed. Please try again later.',
			500
		);
		return next(error);
	}

	clubProfile.set(
		'profileImage',
		process.env.CLOUDFRONT_URL + clubProfile.profileImage,
		{ strict: true }
	);
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

// PATCH '/api/clubs/:cid'
const updateClubEventSettings = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Update club event settings process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	const { hostPrivateEvent, memberSystem } = req.body;
	// use clubId from token instead of getting it from url to avoid hacking
	// req.userData is added in check-clubAuth middleware, information comes from front end
	// req.header.authorization
	const clubId = req.userData;
	let clubEventSettings;
	try {
		clubEventSettings = await ClubEventSettings.findOne({ clubId });
	} catch (err) {
		console.log('updateClubEventSettings find club err = ', err);
		const error = new HttpError(
			'Update club event settings process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!clubEventSettings) {
		const error = new HttpError(
			'Update club event settings failed finding account.',
			404
		);
		console.log('cannot find event settings');
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

	clubEventSettings.hostPrivateEvent = hostPrivateEvent;
	clubEventSettings.memberSystem = memberSystem;
	try {
		await clubEventSettings.save();
	} catch (err) {
		const error = new HttpError(
			'Update club event settings process failed to save, please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({
		clubEventSettings: clubEventSettings.toObject({
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

// GET /api/clubs/sesEmail/:cid
const getClubSesEmail = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'getClubSesEmail process failed.  You are not allowed to get club account.',
			403
		);
		return next(error);
	}

	try {
		var club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'getClubSesEmail process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError('No club in the DB.', 404);
		return next(error);
	}

	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESSKEYID,
		secretAccessKey: process.env.AWS_SECRETACCESSKEY,
		region: process.env.S3_REGION
	});

	// create Nodemailer SES transporter
	const SES = new AWS.SES({
		apiVersion: '2010-12-01'
	});

	// check to see if email has been verified
	let sesEmail = club.sesEmail;
	var params = {
		Identities: [sesEmail]
	};

	try {
		const callBack = (err, data) => {
			verificationAttributes = data.VerificationAttributes;
			// verificationAttributes returns a map { 'myseattime@gmail.com': { VerificationStatus: 'Pending' } }
			// VerificationStatus: "Pending", "Success", "Failed", "TemporaryFailure", "NotStarted"
			let emailFound = verificationAttributes[sesEmail];
			if (!emailFound) {
				// email not yet sent to AWS for verifiation
				return res.status(200).json({
					sesEmail: sesEmail,
					verificationStatus: 'NOTFOUND'
				});
			} else {
				let verificationStatus =
					verificationAttributes[sesEmail].VerificationStatus;
				if (verificationStatus === 'Success') {
					return res.status(200).json({
						sesEmail: sesEmail,
						verificationStatus: 'SUCCESS'
					});
				} else {
					return res.status(200).json({
						sesEmail: sesEmail,
						verificationStatus: 'RESEND'
					});
				}
			}
		};
		await SES.getIdentityVerificationAttributes(params, callBack);
	} catch (err) {
		console.log('getIdentityVerificationAttributes err = ', err);
		const error = new HttpError(
			'getClubSesEmail getIdentityVerificationAttributes process failed. Please try again later.',
			500
		);
		return next(error);
	}
};

// PATCH /api/clubs/sesEmail/:cid
const updateClubSesEmail = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'updateClubSesEmail process failed.  You are not allowed to get club account.',
			403
		);
		return next(error);
	}

	try {
		var club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'updateClubSesEmail process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError('No club in the DB.', 404);
		return next(error);
	}

	const { email, resend } = req.body;

	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESSKEYID,
		secretAccessKey: process.env.AWS_SECRETACCESSKEY,
		region: process.env.S3_REGION
	});

	// create Nodemailer SES transporter
	const SES = new AWS.SES({
		apiVersion: '2010-12-01'
	});

	let oldSesEmail = club.sesEmail;
	// delete old verified email
	var deleteParams = {
		Identity: oldSesEmail
	};

	if (!resend) {
		SES.deleteIdentity(deleteParams, function (err, data) {
			if (err) {
				console.log('deleteIdentity err = ', err.stack);
			} else {
				console.log('deleteIdentity data = ', data);
			}
		});
	}

	var params = {
		EmailAddress: email /* required */,
		TemplateName: 'SESVerificationTemplate' /* required */,
		ConfigurationSetName: ''
	};

	SES.sendCustomVerificationEmail(params, function (err, data) {
		if (err) {
			// an error occurred
			console.log('sendCustomVerificationEmail err = ', err.stack);
		} else {
			// successful response
			console.log('sendCustomVerificationEmail data = ', data);
		}
	});

	try {
		club.sesEmail = email;
		await club.save();
	} catch (err) {
		console.log(
			'updateClubSesEmail process failed @ saving sesEmail. = ',
			err
		);
		const error = new HttpError(
			'updateClubSesEmail process failed @ saving sesEmail. Please try again later.',
			500
		);
		return next(error);
	}

	// setup with AWS SES

	res.status(200).json({
		sesEmail: email
	});
};

// GET /api/clubs/eventSettings/:cid
const getClubEventSettings = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'Get club event settings process failed.  You are not allowed to get club account.',
			403
		);
		return next(error);
	}

	try {
		var clubEventSettings = await ClubEventSettings.findOne({
			clubId: clubId
		});
	} catch (err) {
		const error = new HttpError(
			'Get club event settings process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!clubEventSettings) {
		const error = new HttpError(
			'No club event settings in the DB.',
			404
		);
		return next(error);
	}

	res.status(200).json({
		clubEventSettings: clubEventSettings.toObject({
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
		stripeAccountId = '';
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

// GET /api/clubs/member/:cid
const getClubMemberList = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to get club member list.',
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
			'getClubMemberList failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'getClubMemberList club process failed no club found.',
			404
		);
		return next(error);
	}

	// find all the clubMemberList that are associated with this club
	try {
		var memberList = await ClubMember.find({ clubId: clubId });
	} catch (err) {
		const error = new HttpError(
			'Get club member list process failed. Please try again later.',
			500
		);
		return next(error);
	}

	let clubEventSettings;
	try {
		// we don't want to return password field
		clubEventSettings = await ClubEventSettings.findOne({
			clubId: clubId
		});
	} catch (err) {
		const error = new HttpError(
			'getClubMemberList failed finding club event settings. Please try again later.',
			500
		);
		return next(error);
	}
	if (!clubEventSettings) {
		const error = new HttpError(
			'getClubMemberList cannot find club event settings',
			500
		);
		return next(error);
	}

	let memberSystem = clubEventSettings.memberSystem;

	// compose responseData
	// lastName, firstName, email, memberNumber, memberStatus, memberExp, address, city, state, zip,
	// phone, emergency, emergencyPhone
	let responseData = [];

	for (let i = 0; i < memberList.length; ++i) {
		let member = memberList[i];
		let lastName = member.lastName;
		let firstName = member.firstName;
		var email = member.email;
		let userId = undefined;

		// check club has memberSystem
		if (memberSystem) {
			var memberNumber = member.memberNumber;
			var memberExp = moment(member.memberExp).format('MM/DD/YYYY');
		}
		// retrieve user info from userAccount if exists
		if (member.userId) {
			try {
				var user = await User.findById(member.userId);
			} catch (err) {
				console.log('getClubMemberList failed @ finding user');
			}
			if (user) {
				// if user is signed up, use user's email
				email = user.email;
				userId = user.id;
				// get userAccount
				try {
					var userAccount = await UserAccount.findById(
						user.accountId
					);
				} catch (err) {
					console.log(
						'getClubMemberList failed @ finding userAccout'
					);
				}
				if (userAccount) {
					var address = Decrypt(userAccount.address);
					var city = Decrypt(userAccount.city);
					var state = userAccount.state;
					var zip = userAccount.zip;
					var phone = Decrypt(userAccount.phone);
					var emergency = userAccount.emergency;
					var emergencyPhone = Decrypt(userAccount.emergencyPhone);
				}
			}
		}
		if (memberSystem) {
			if (member.userId) {
				var newMember = {
					userId: userId,
					lastName: lastName,
					firstName: firstName,
					memberNumber: memberNumber,
					memberExp: memberExp,
					email: email,
					address: address,
					city: city,
					state: state,
					zip: zip,
					phone: phone,
					emergency: emergency,
					emergencyPhone: emergencyPhone
				};
			} else {
				var newMember = {
					lastName: lastName,
					firstName: firstName,
					memberNumber: memberNumber,
					memberExp: memberExp,
					email: email
				};
			}
		} else {
			if (member.userId) {
				var nweMember = {
					userId: userId,
					lastName: lastName,
					firstName: firstName,
					email: email,
					address: address,
					city: city,
					state: state,
					zip: zip,
					phone: phone,
					emergency: emergency,
					emergencyPhone: emergencyPhone
				};
			} else {
				var newMember = {
					lastName: lastName,
					firstName: firstName,
					email: email
				};
			}
		}
		responseData.push(newMember);
	}
	res.status(200).json({
		memberSystem: memberSystem,
		memberList: responseData
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

// POST '/api/clubs/uploadMemberList/:cid'
const uploadMemberList = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	let clubId = req.userData;

	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to upload club member list.',
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
			'uploadMemberList failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'uploadMemberList club process failed no club found.',
			404
		);
		return next(error);
	}

	let clubEventSettings;
	try {
		clubEventSettings = await ClubEventSettings.findOne({
			clubId: clubId
		});
	} catch (err) {
		const error = new HttpError(
			'uploadMemberList failed finding club event settings. Please try again later.',
			500
		);
		return next(error);
	}
	if (!clubEventSettings) {
		const error = new HttpError(
			'uploadMemberList cannot find club event settings',
			500
		);
		return next(error);
	}
	let memberSystem = clubEventSettings.memberSystem;

	// check the uploaded file
	// file: {
	// 	fieldname: 'memberList',
	// 	originalname: 'GGLC.csv',
	// 	encoding: '7bit',
	// 	mimetype: 'text/csv',
	// 	size: 526,
	// 	bucket: 'myseattime-dev',
	// 	key: 'memberList/22d81090-6152-11eb-ae33-f76350259af4.csv',
	// 	acl: 'public-read',
	// 	contentType: 'application/octet-stream',
	// 	metadata: { fieldName: 'memberList' },
	// 	location: 'https://myseattime-dev.s3.us-west-1.amazonaws.com/memberList/22d81090-6152-11eb-ae33-f76350259af4.csv',
	// 	etag: '"b44ea3289e85d612f5a835e1ae5741bf"'
	//   },
	if (req.file) {
		let bucket = req.file.bucket;
		let res = req.file.location.split('/');
		// res[3]: memberList, res[4]: 22d81090-6152-11eb-ae33-f76350259af4.csv
		let key = res[3] + '/' + res[4];
		const params = {
			Bucket: bucket,
			Key: key
		};

		const S3 = new AWS.S3();
		try {
			// get csv file and create stream
			const stream = S3.getObject(params).createReadStream();
			// convert csv file (stream) to JSON format data
			var jsonResult = await csvtojson().fromStream(stream);
		} catch (err) {
			console.log('uploadMemberList S3 object ');
			const error = new HttpError(
				'uploadMemberList cannot find club account',
				500
			);
			return next(error);
		}

		try {
			let versions;
			let listObjectParams = {
				Bucket: bucket,
				Prefix: key
			};
			const previousVersion = await S3.listObjectVersions(
				listObjectParams
			)
				.promise()
				.then(result => {
					versions = result.Versions;
				});
			let version = versions[0].VersionId;
			const deleteParams = {
				Bucket: bucket,
				Delete: {
					Objects: [
						{
							Key: key,
							VersionId: version
						}
					],
					Quiet: false
				}
			};

			// delete file from S3 versioned bucket
			S3.deleteObjects(deleteParams, (err, data) => {
				if (err) {
					console.log('');
					const error = new HttpError(
						'uploadMemberList cannot find club account',
						500
					);
					return next(error);
				}
			});
		} catch (err) {
			console.log('uploadMemberList S3 delete object error = ', err);
			const error = new HttpError(
				'uploadMemberList cannot delete S3 object',
				500
			);
			return next(error);
		}
	}

	let memberList = [];
	try {
		const session = await mongoose.startSession();
		session.startTransaction();

		for (let i = 0; i < jsonResult.length; ++i) {
			let newClubMember = new ClubMember({
				clubId: clubId,
				lastName: jsonResult[i].LastName,
				firstName: jsonResult[i].FirstName,
				memberNumber: jsonResult[i].MemberNumber,
				memberExp: jsonResult[i].Expires,
				email: jsonResult[i].Email
			});
			await newClubMember.save({ session: session });
			let member = {
				lastName: jsonResult[i].LastName,
				firstName: jsonResult[i].FirstName,
				memberNumber: jsonResult[i].MemberNumber,
				memberExp: jsonResult[i].Expires,
				email: jsonResult[i].Email
			};
			memberList.push(member);
		}
		await session.commitTransaction();
	} catch (err) {
		console.log(
			'Upload club member list failed to save, please try again later. err = ',
			err
		);
		const error = new HttpError(
			'Upload club member list failed to save, please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		memberSystem: memberSystem,
		memberList: memberList
	});
};

// POST /clubs/member/:cid
const addMember = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`addMember process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}
	console.log('3');
	let clubIdParam = req.params.cid;
	let clubId = req.userData;

	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to add club member.',
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
			'addMember failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'addMember club process failed no club found.',
			404
		);
		return next(error);
	}

	const {
		lastName,
		firstName,
		email,
		memberNumber,
		memberExp
	} = req.body;

	let normLastName =
		lastName.charAt(0).toUpperCase() +
		lastName.slice(1).toLowerCase();

	let normFirstName =
		firstName.charAt(0).toUpperCase() +
		firstName.slice(1).toLowerCase();

	let newMember = new ClubMember({
		clubId: clubId,
		lastName: normLastName,
		firstName: normFirstName,
		email: email,
		memberNumber: memberNumber,
		memberExp: memberExp
	});
	console.log('newMember = ', newMember);
	try {
		await newMember.save();
	} catch (err) {
		console.log('add member failed @ saving newMember = ', err);
		const error = new HttpError(
			'addMember club process failed @ saving member.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		member: newMember
	});
};

// PATCH /clubs/member/:cid
const updateMember = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`updateMember process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	let clubIdParam = req.params.cid;
	let clubId = req.userData;

	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to update club member.',
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
			'updateMember failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'updateMember club process failed no club found.',
			404
		);
		return next(error);
	}

	const {
		userId,
		lastNameNew,
		firstNameNew,
		emailNew,
		memberNumberNew,
		memberExpNew,
		lastNameOld,
		firstNameOld,
		emailOld,
		memberNumberOld,
		memberExpOld
	} = req.body;

	let normLastName =
		lastNameNew.charAt(0).toUpperCase() +
		lastNameNew.slice(1).toLowerCase();

	let normFirstName =
		firstNameNew.charAt(0).toUpperCase() +
		firstNameNew.slice(1).toLowerCase();

	var member = null;
	try {
		member = await ClubMember.findOne({
			userId: userId,
			clubId: clubId,
			lastName: lastNameOld,
			firstName: firstNameOld,
			email: emailOld,
			memberNumber: memberNumberOld,
			memberExp: memberExpOld
		});
	} catch (err) {
		const error = new HttpError(
			'updateMember failed @ finding member using userId. Please try again later.',
			500
		);
		return next(error);
	}

	// if still member not found
	if (!member) {
		const error = new HttpError(
			'updateMember failed @ finding member. Please try again later.',
			500
		);
		return next(error);
	}

	if (member) {
		member.lastName = normLastName;
		member.fisrtName = normFirstName;
		member.email = emailNew;
		member.memberNumber = memberNumberNew;
		member.memberExp = memberExpNew;
	}

	try {
		await member.save();
	} catch (err) {
		console.log('update member failed @ saving member = ', err);
		const error = new HttpError(
			'updateMember club process failed @ saving member.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		member: member
	});
};

// DELETE /clubs/member/:cid
const deleteMember = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`deleteMember process failed, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	let clubIdParam = req.params.cid;
	let clubId = req.userData;

	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to delete club member.',
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
			'deleteMember failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'deleteMember club process failed no club found.',
			404
		);
		return next(error);
	}

	const {
		userId,
		lastName,
		firstName,
		email,
		memberNumber,
		memberExp
	} = req.body;

	var member = null;
	try {
		member = await ClubMember.findOne({
			userId: userId,
			clubId: clubId,
			lastName: lastName,
			firstName: firstName,
			email: email,
			memberNumber: memberNumber,
			memberExp: memberExp
		});
	} catch (err) {
		const error = new HttpError(
			'deleteMember failed @ finding member using userId. Please try again later.',
			500
		);
		return next(error);
	}

	// if still member not found
	if (!member) {
		const error = new HttpError(
			'deleteMember failed @ finding member. Please try again later.',
			500
		);
		return next(error);
	}

	try {
		await member.delete();
	} catch (err) {
		console.log('delet club member failed @ deleting member = ', err);
		const error = new HttpError(
			'delete club member process failed @ deleting member.',
			500
		);
		return next(error);
	}

	res.status(200).json({});
};

// GET /api/clubs/commsMember/:cid
const getClubCommsMemberList = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to get club communicataion member list.',
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
			'getClubCommsMemberList failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'getClubCommsMemberList club process failed no club found.',
			404
		);
		return next(error);
	}

	// find all the clubMember that are associated with this club
	try {
		var members = await ClubMember.find({ clubId: clubId });
	} catch (err) {
		const error = new HttpError(
			'getClubCommsMemberList Get club member list process failed. Please try again later.',
			500
		);
		return next(error);
	}

	// compose responseData
	// lastName, firstName, email, phone,
	let memberList = [];

	for (let i = 0; i < members.length; ++i) {
		let member = members[i];
		let lastName = member.lastName;
		let firstName = member.firstName;
		var email = member.email;

		// retrieve user info from userAccount if exists
		if (member.userId) {
			try {
				var user = await User.findById(member.userId);
			} catch (err) {
				console.log('getClubMemberList failed @ finding user');
			}
			if (user) {
				// if user is signed up, use user's email
				email = user.email;
				// get userAccount
				try {
					var userAccount = await UserAccount.findById(
						user.accountId
					);
				} catch (err) {
					console.log(
						'getClubMemberList failed @ finding userAccout'
					);
				}
				if (userAccount) {
					var phone = Decrypt(userAccount.phone);
				}
			}
		}

		var newMember = {
			userId: member.userId,
			lastName: lastName,
			firstName: firstName,
			email: email,
			phone: phone
		};

		memberList.push(newMember);
	}
	res.status(200).json({
		memberList: memberList
	});
};

const sendEmail = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to send email.',
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
			'sendEmail failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'sendEmail club process failed no club found.',
			404
		);
		return next(error);
	}

	const { eventId, recipients, subject, content } = req.body;
	// not everyone has userId because people may not register yet
	let recipientIds = [];
	for (let i = 0; i < recipients.length; ++i) {
		if (recipients[i].userId) {
			recipientIds.push(recipients[i].userId);
		}
	}

	let email = new Email({
		recipientIds: recipientIds,
		recipientNum: recipients.length,
		subject: subject,
		content: content,
		clubId: club.id,
		eventId: eventId,
		timeStamp: moment()
	});

	try {
		sendClubEmail(
			recipients,
			subject,
			content,
			club.name,
			club.sesEmail
		);
		const mail = await email.save();
	} catch (err) {
		console.log('err = ', err);
	}
	res.status(200).json({
		status: 'OK'
	});
};

// GET /api/clubs/commsEmailArchive/:cid
const getClubCommsEmailArchive = async (req, res, next) => {
	let clubIdParam = req.params.cid;
	const clubId = req.userData;
	if (clubIdParam !== clubId) {
		const error = new HttpError(
			'You are not authorized to get club email archives.',
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
			'getClubCommsEmailArchive failed @ finding club. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'getClubCommsEmailArchive process failed no club found.',
			404
		);
		return next(error);
	}

	// find all the clubMember that are associated with this club
	try {
		var emails = await Email.find({ clubId: clubId });
	} catch (err) {
		const error = new HttpError(
			'getClubCommsEmailArchive get email archive process failed. Please try again later.',
			500
		);
		return next(error);
	}

	for (let i = 0; i < emails.length; ++i) {
		if (emails[i].eventId) {
			try {
				var event = await Event.findById(emails[i].eventId);
			} catch (err) {
				const error = new HttpError(
					'getClubCommsEmailArchive failed @ finding event. Please try again later.',
					500
				);
				return next(error);
			}
			if (!event) {
				const error = new HttpError(
					'getClubCommsEmailArchive process failed no event found.',
					404
				);
				return next(error);
			}
			emails[i].set('eventName', event.name, { strict: false });
		}
	}

	res.status(200).json({
		emailArchive: emails
	});
};

exports.getAllClubs = getAllClubs;
exports.getClubById = getClubById;
exports.getClubProfileForUsers = getClubProfileForUsers;
exports.createClub = createClub;
exports.confirmClubEmail = confirmClubEmail;
exports.resendClubConfirmationEmail = resendClubConfirmationEmail;
exports.loginClub = loginClub;
exports.updateClubCredential = updateClubCredential;
exports.updateClubProfile = updateClubProfile;
exports.getClubProfile = getClubProfile;
exports.updateClubAccount = updateClubAccount;
exports.updateClubEventSettings = updateClubEventSettings;
exports.getClubAccount = getClubAccount;
exports.getClubEventSettings = getClubEventSettings;
exports.getClubCredential = getClubCredential;
exports.getClubStripeAccount = getClubStripeAccount;
exports.getClubMemberList = getClubMemberList;
exports.getClubSesEmail = getClubSesEmail;
exports.updateClubSesEmail = updateClubSesEmail;
exports.deleteClub = deleteClub;
exports.logoutClub = logoutClub;
exports.getEventForm = getEventForm;
exports.createEventForm = createEventForm;
exports.publishEvent = publishEvent;
exports.uploadMemberList = uploadMemberList;
exports.addMember = addMember;
exports.updateMember = updateMember;
exports.deleteMember = deleteMember;
exports.getClubCommsMemberList = getClubCommsMemberList;
exports.sendEmail = sendEmail;
exports.getClubCommsEmailArchive = getClubCommsEmailArchive;
