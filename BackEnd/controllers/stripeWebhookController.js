const HttpError = require('../models/httpError');
const Club = require('../models/club.js');
const ClubAccount = require('../models/clubAccount.js');
const Entry = require('../models/entry');
const Payment = require('../models/payment');
const User = require('../models/user');
const { Encrypt, Decrypt } = require('../util/crypto');

// use lowercase for external stripe and uppercase for stripeController
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhook_secret = 'whsec_oaurDI365lzbrjHo7eW60hh3u5LqsJ5q';
const DEFAULT_STRIPE_ID = '0000';

const webhook = async (request, response, next) => {
	const signature = request.headers['stripe-signature'];
	console.log('sig = ', signature);

	let event;

	try {
		event = await stripe.webhooks.constructEvent(
			request.body,
			signature,
			webhook_secret
		);
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(err.message, 400);
		return next(error);
	}

	let received = false;
	let detailsSubmitted = false;
	if (event.type === 'account.updated') {
		received = true;
		const account = event.data.object;
		detailsSubmitted = account.details_submitted;
		console.log(JSON.stringify(account));
	}

	switch (event.type) {
		case 'account.updated':
			const update = event.data.object;
			detailsSubmitted = account.details_submitted;
			console.log(JSON.stringify(account));
			console.log('Account was updated!');
		case 'charge.succeeded':
			const charge = event.data.object;
			console.log('Charge was successful!');
			break;
		case 'payment_intent.succeeded':
			const paymentIntent = event.data.object;
			console.log('PaymentIntent was successful!');
			break;
		case 'payment_intent.created':
			const paymentIntentCreated = event.data.object;
			console.log('PaymentIntent created was successful!');
			break;
		case 'payment_method.attached':
			const paymentMethod = event.data.object;
			console.log('PaymentMethod was attached to a Customer!');
			break;
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}
};

exports.webhook = webhook;
