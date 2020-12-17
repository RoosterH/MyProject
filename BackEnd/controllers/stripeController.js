const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const Club = require('../models/club.js');
const ClubAccount = require('../models/clubAccount.js');
const Entry = require('../models/entry');
const Event = require('../models/event');
const Payment = require('../models/payment');
const User = require('../models/user');
const { Encrypt, Decrypt } = require('../util/crypto');
const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};
// use lowercase for external stripe and uppercase for stripeController
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const DEFAULT_STRIPE_ID = '0000';

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
	let stripeAccountId;
	try {
		let event = await Event.findById(eventId);
		let clubId = event.clubId;
		let club = await Club.findById(clubId);
		let accountId = club.accountId;
		let account = await ClubAccount.findById(accountId);
		stripeAccountId = Decrypt(account.stripeAccountId);
		console.log('stripe 58 stripeAccountId = ', stripeAccountId);
	} catch (err) {
		console.log('stripeController 59 err = ', err);
		const error = new HttpError(
			'getNewSetupIntent process failed during stripeAccountId retrieval. Please try again later.',
			500
		);
		return next(error);
	}

	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData;
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
			payment_method_types: ['card'],
			on_behalf_of: stripeAccountId
		});
	} catch (err) {
		console.log('Stripe createSetupIntent error = ', err);
		const error = new HttpError(
			'Stripe createSession failed, please try again.',
			500
		);
		return next(error);
	}
	console.log('stripe 105 setupIntent = ', setupIntent);
	res.status(200).json({
		setupIntent: setupIntent,
		email: user.email
	});
};

// ! NOT USED
// This route is not used beacuse re-using SetupIntent with new PaymentMethod will be causing SetupIntent state isssue
// route GET /stripe/setupIntent
const getSetupIntent = async (req, res, next) => {
	const entryId = req.params.entryId;

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

	let setupIntent;
	// payment does not guarantee have stripeSetupIntentId
	// If previous paymentMethod was On-Site, there won't be any stripeSetupIntentId
	// In this case, we need to create a new one
	if (payment.stripeSetupIntentId === DEFAULT_STRIPE_ID) {
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
		try {
			setupIntent = await stripe.setupIntents.retrieve(
				payment.stripeSetupIntentId
			);
		} catch (err) {
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

	res.status(200).json({
		setupIntent: setupIntent,
		email: user.email
	});
};

// route GET /stripe/connect, redirect clubs to stripe to setup connect account
const getConnect = async (req, res, next) => {
	// req.userData is inserted in check-auth.js
	let clubId = req.userData;
	let club;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		console.log('stripeController 229 err = ', err);
		const error = new HttpError(
			'getConnect process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}
	if (!club) {
		const error = new HttpError(
			'getConnect faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	try {
		// create stripe standard account. For standard type, cannot supply capablities
		const account = await stripe.accounts.create({
			type: 'standard',
			email: club.email
		});
		// origin is our end point
		const origin = `${req.headers.origin}`;

		// get account link, we will re-direct user to this link to setup account
		const accountLinkURL = await generateAccountLink(
			account.id,
			origin,
			club.id
		);
		let clubAccount;
		try {
			clubAccount = await ClubAccount.findOne({ clubId: club.id });
		} catch (err) {
			const error = new HttpError(
				'getConnect faied @ finding club account.  Please try again later.',
				500
			);
			return next(error);
		}
		if (!clubAccount) {
			const error = new HttpError(
				'getConnect clubAccount not found.',
				500
			);
			return next(error);
		}
		// save encrypted stripeAccountId
		clubAccount.stripeAccountId = Encrypt(account.id);
		try {
			await clubAccount.save();
		} catch (err) {
			const error = new HttpError(
				'getConnect clubAccount not saved.',
				500
			);
			return next(error);
		}
		res.status(200).json({ url: accountLinkURL });
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'getConnect process failed during stripe account creation. Please try again later.',
			500
		);
		return next(error);
	}
};

const generateAccountLink = (accountID, origin, clubId) => {
	return stripe.accountLinks
		.create({
			type: 'account_onboarding',
			account: accountID,
			refresh_url: `${origin}/clubs/accountManager/${clubId}`,
			return_url: `${origin}/clubs/accountManager/${clubId}`
		})
		.then(link => link.url);
};

// ***************** Utility Functions ****************************** //
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

const getAccount = async accountId => {
	let account;
	try {
		account = await stripe.accounts.retrieve(accountId);
	} catch (err) {
		// Error code will be authentication_required if authentication is needed
		console.log('Error code is: ', err.code);
		const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(
			err.raw.payment_intent.id
		);
		console.log('PI retrieved: ', paymentIntentRetrieved.id);
		throw err;
	}
	return account;
};

const createPaymentIntent = async (
	customerId,
	paymentMethodId,
	amount,
	stripeAccountId
) => {
	let paymentIntent;
	console.log('amount = ', amount);
	let error;
	try {
		paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100,
			currency: 'usd',
			customer: customerId,
			payment_method: paymentMethodId,
			off_session: true,
			confirm: true,
			on_behalf_of: stripeAccountId
		});
	} catch (err) {
		paymentIntent = await stripe.paymentIntents.retrieve(
			err.raw.payment_intent.id
		);
		error = err;
	}
	return [paymentIntent, error];
};

exports.createSession = createSession;
exports.createCustomer = createCustomer;
exports.getNewSetupIntent = getNewSetupIntent;
exports.getSetupIntent = getSetupIntent;
exports.getConnect = getConnect;
exports.getAccount = getAccount;
exports.createPaymentIntent = createPaymentIntent;
