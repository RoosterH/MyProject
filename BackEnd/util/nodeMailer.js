let nodemailer = require('nodemailer');
let AWS = require('aws-sdk');
const event = require('../models/event');

const sendVerificationEmail = async (
	isUser,
	recipientName,
	recipientEmail,
	token
) => {
	// configure AWS SDK
	// AWS.config.loadFromPath('config.json');
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESSKEYID,
		secretAccessKey: process.env.AWS_SECRETACCESSKEY,
		region: process.env.S3_REGION
	});

	// create Nodemailer SES transporter
	let transporter = nodemailer.createTransport({
		SES: new AWS.SES({
			apiVersion: '2010-12-01'
		}),
		sendingRate: 14 // max 14 messages per second
	});

	let path = isUser ? 'user' : 'club';

	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: '"MYSeatTime" <admin@myseattime.com>',
			to: recipientEmail,
			subject: 'MYSeatTime.com Account Verification Link',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'Thanks for signing up MYSeatTime.com.\n' +
				'Please verify your email account by clicking the link to finish registration: \n' +
				process.env.MYSEATTIME +
				'/' +
				path +
				'Confirmtation/' +
				recipientEmail +
				'/' +
				token.token +
				'\n\nThis link expires in 24 hours.' +
				'\n\nTo request a new link, please click here: \n' +
				process.env.MYSEATTIME +
				'/' +
				path +
				'VerificationRequest/' +
				recipientEmail +
				'\n\nIf you did not sign up, please discard this email.' +
				'\nThank You!\n',
			html:
				'<p>Hi ' +
				recipientName +
				' </p>' +
				'<p>Thanks for signing up MYSeatTime.com.</p>' +
				'<p>Please verify your email account by clicking the link to finish registration:</p>' +
				'<p>' +
				process.env.MYSEATTIME +
				'/' +
				path +
				'Confirmation/' +
				recipientEmail +
				'/' +
				token.token +
				'</p>' +
				'<p>This link expires in 24 hours.</p>' +
				'<p>To request a new link, please click here:</p>' +
				'<p>' +
				process.env.MYSEATTIME +
				'/' +
				path +
				'VerificationRequest/' +
				recipientEmail +
				'</p>' +
				'<p>If you did not sign up, please discard this email.</p>' +
				'<p>Thank you!</p>',
			sender: 'admin@myseattime.com',
			replyTo: 'no-reply@myseattime.com'
		});
	} catch (err) {
		console.log('nodemailer err = ', err);
	}
};

const sendAccountActivationEmail = async (
	isUser,
	recipientName,
	recipientEmail
) => {
	// configure AWS SDK
	// AWS.config.loadFromPath('config.json');
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESSKEYID,
		secretAccessKey: process.env.AWS_SECRETACCESSKEY,
		region: process.env.S3_REGION
	});

	// create Nodemailer SES transporter
	let transporter = nodemailer.createTransport({
		SES: new AWS.SES({
			apiVersion: '2010-12-01'
		}),
		sendingRate: 14 // max 14 messages per second
	});

	let path = isUser ? 'user' : 'club';

	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: '"MYSeatTime" <admin@myseattime.com>',
			to: recipientEmail,
			subject: 'MYSeatTime.com Account Activation Succeeded',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'Your MYSeatTime.com account is now successfully activated.\n' +
				'Thanks for signing up with us.\n\n' +
				'Enjoy Driving!',
			html:
				'<p>Hi ' +
				recipientName +
				' </p>' +
				'<p>Your MYSeatTime.com account is now successfully activated.</p>' +
				'<p>Thanks for signing up with us.</p>' +
				'<p>Enjoy Driving!</p>',
			sender: 'admin@myseattime.com',
			replyTo: 'no-reply@myseattime.com'
		});
	} catch (err) {
		console.log('nodemailer err = ', err);
	}
};

const sendRegistrationConfirmationEmail = async (
	recipientName,
	recipientEmail,
	clubName,
	clubEmail,
	eventName,
	eventId,
	fullMSG,
	paymentMethod,
	entryFee
) => {
	// configure AWS SDK
	// AWS.config.loadFromPath('config.json');
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESSKEYID,
		secretAccessKey: process.env.AWS_SECRETACCESSKEY,
		region: process.env.S3_REGION
	});

	// create Nodemailer SES transporter
	let transporter = nodemailer.createTransport({
		SES: new AWS.SES({
			apiVersion: '2010-12-01'
		}),
		sendingRate: 14 // max 14 messages per second
	});

	let from = '"' + clubName + '" ' + '<' + clubEmail + '>';
	let MSG =
		fullMSG !== ''
			? fullMSG
			: 'Successfully registered for the event.';
	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;
	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: from,
			to: recipientEmail,
			subject:
				clubName + ' ' + eventName + ' registration confirmation',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'Your registration for ' +
				clubName +
				' ' +
				eventName +
				' has successfully submitted.\n' +
				'Status: ' +
				MSG +
				'\n' +
				'Payment Method: ' +
				paymentMethod +
				'\n' +
				'Entry Fee: $' +
				entryFee +
				'\n' +
				'Event Link: ' +
				eventLink +
				'\n' +
				'Thanks for registering the event.\n\n' +
				'Enjoy Driving!',
			html:
				'<p>Hi ' +
				recipientName +
				' </p>' +
				'<p>You registration for ' +
				clubName +
				' ' +
				eventName +
				' has successfully submitted.</p>' +
				'<p>Status: ' +
				MSG +
				'</p>' +
				'<p>Payment Method: ' +
				paymentMethod +
				'</p>' +
				'<p>Entry Fee: $' +
				entryFee +
				'</p>' +
				'<p>Event Link: ' +
				eventLink +
				'</p>' +
				'<p>Thanks for registering the event.</p><br>' +
				'<p>Enjoy Driving!</p>',
			sender: clubEmail,
			replyTo: clubEmail
		});
	} catch (err) {
		console.log('nodemailer err = ', err);
	}
};

module.exports = {
	sendVerificationEmail,
	sendAccountActivationEmail,
	sendRegistrationConfirmationEmail
};
