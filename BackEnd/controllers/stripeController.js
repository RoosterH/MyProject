const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const User = require('../models/user');
const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};
// use lowercase for external stripe and uppercase for stripeController
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// internal API, called upon creating a user
const createCustomer = async (name, email) => {
	let customer;
	try {
		customer = await stripe.customers.create({
			name: name,
			email: email,
			description: `${name}: ${email} Stripe Customer Object`
		});
	} catch (err) {
		console.log('Stripe createCustomer error = ', err);
		throw err;
	}
	return customer;
};

// route /stripe/session, create a session for later charge
const createSession = async (req, res, next) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'setup',
			// customer: 'cus_FOsk5sbh3ZQpAU',  Optional
			success_url: 'http://localhost:3000/',
			cancel_url: 'http://localhost:3000/error'
		});
	} catch (err) {
		console.log('Stripe createSession error = ', err);
		const error = new HttpError(
			'Stripe createSession failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		session: session.toObject({ getters: true })
	});
};

// route /stripe/session, create a session for later charge
const createSetupIntent = async (req, res, next) => {
	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData;
	console.log('stripeController 59 userId = ', userId);
	try {
		user = await User.findById(userId);
	} catch (err) {
		console.log('stripeController 63 err = ', err);
		const error = new HttpError(
			'Entry form submission process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Entry form submission faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	// ! todo- get club stripe ID to setup on_behalf_of
	// use eventId to get club and its clubStripeId, so we can set on_behalf_of the hosting club
	const { eventId } = req.body;

	let setupIntent;
	try {
		setupIntent = await stripe.setupIntents.create({
			customer: user.stripeCustomerId,
			payment_method_types: ['card']
			// on_behalf_of: {clubStripeID}
		});
	} catch (err) {
		console.log('Stripe createSetupIntent error = ', err);
		const error = new HttpError(
			'Stripe createSession failed, please try again.',
			500
		);
		return next(error);
	}

	console.log('97 setupIntent  = ', setupIntent);
	res.status(200).json({
		setupIntent: setupIntent,
		email: user.email
	});
};

exports.createSession = createSession;
exports.createCustomer = createCustomer;
exports.createSetupIntent = createSetupIntent;
