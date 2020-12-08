const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const Entry = require('../models/entry');
const Payment = require('../models/payment');
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

// route GET /stripe/newSetupIntent
const getNewSetupIntent = async (req, res, next) => {
	// ! todo- get club stripe ID to setup on_behalf_of
	// use eventId to get club and its clubStripeId, so we can set on_behalf_of the hosting club
	const eventId = req.params.eventId;
	console.log('in getNewSetupIntent');

	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData;
	console.log('stripeController 59 userId = ', userId);
	try {
		user = await User.findById(userId);
	} catch (err) {
		console.log('stripeController 63 err = ', err);
		const error = new HttpError(
			'getNewSetupIntent process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'getNewSetupIntent faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

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

// route GET /stripe/setupIntent
const getSetupIntent = async (req, res, next) => {
	const entryId = req.params.entryId;
	console.log('in getSetupIntent');

	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData;
	try {
		user = await User.findById(userId);
	} catch (err) {
		console.log('stripeController 117 err = ', err);
		const error = new HttpError(
			'getSetupIntent process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}
	if (!user) {
		const error = new HttpError(
			'getSetupIntent faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}
	console.log('in getSetupIntent user = ', user);

	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('stripeController 138 err = ', err);
		const error = new HttpError(
			'getSetupIntent process failed @ retrieving entry. Please try again later.',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError(
			'getSetupIntent faied entry not found.',
			404
		);
		return next(error);
	}

	// get original SetupIntent from payment
	let payment;
	try {
		payment = await Payment.findById(entry.paymentId);
	} catch (err) {
		console.log('stripeController 159 err = ', err);
		const error = new HttpError(
			'getSetupIntent process failed @ retrieving payment. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'getSetupIntent faied payment not found.',
			404
		);
		return next(error);
	}
	console.log('in getSetupIntent payment = ', payment);

	let setupIntent;
	// payment does not guarantee have stripeSetupIntentId
	// If previous paymentMethod was On-Site, there won't be any stripeSetupIntentId
	// In this case, we need to create a new one
	if (payment.stripeSetupIntentId === '0000') {
		// ! to-do add on_behalf_of
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
	} else {
		console.log(
			'payment.stripeSetupIntentId = ',
			payment.stripeSetupIntentId
		);
		try {
			setupIntent = await stripe.setupIntents.retrieve(
				payment.stripeSetupIntentId
			);
			console.log('setupIntent = ', setupIntent);
		} catch (err) {
			console.log('stripe.setupIntent.retrieve error = ', err);
			const error = new HttpError(
				'Stripe setupIntents.retrieve failed, please try again.',
				500
			);
			return next(error);
		}
	}
	if (!setupIntent) {
		const error = new HttpError(
			'getSetupIntent faied setupIntent not found.',
			404
		);
		return next(error);
	}

	console.log('189 setupIntent  = ', setupIntent);
	res.status(200).json({
		setupIntent: setupIntent,
		email: user.email
	});
};

exports.createSession = createSession;
exports.createCustomer = createCustomer;
exports.getNewSetupIntent = getNewSetupIntent;
exports.getSetupIntent = getSetupIntent;
