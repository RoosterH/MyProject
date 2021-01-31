const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const moment = require('moment');

const event = require('../models/event');
const NOT_ATTENDING = 'Not Attending';

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
				'<p style="color:black;">Hi ' +
				recipientName +
				' </p>' +
				'<p style="color:black;">Thanks for signing up MYSeatTime.com.</p>' +
				'<p style="color:black;">Please verify your email account by clicking the link to finish registration:</p>' +
				'<p style="color:black;">' +
				process.env.MYSEATTIME +
				'/' +
				path +
				'Confirmation/' +
				recipientEmail +
				'/' +
				token.token +
				'</p>' +
				'<p style="color:black;">This link expires in 24 hours.</p>' +
				'<p style="color:black;">To request a new link, please click here:</p>' +
				'<p style="color:black;">' +
				process.env.MYSEATTIME +
				'/' +
				path +
				'VerificationRequest/' +
				recipientEmail +
				'</p>' +
				'<p style="color:black;">If you did not sign up, please discard this email.</p>' +
				'<p style="color:black;">Thank you!</p>',
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
				'<p style="color:black;">Hi ' +
				recipientName +
				' </p>' +
				'<p style="color:black;">Your MYSeatTime.com account is now successfully activated.</p>' +
				'<p style="color:black;">Thanks for signing up with us.</p>' +
				'<p style="color:black;">Enjoy Driving!</p>',
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
	startDate,
	runGroups,
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
	let dateRunGroups = '';
	for (let i = 0; i < runGroups.length; ++i) {
		if (runGroups[i] !== NOT_ATTENDING) {
			if (dateRunGroups === '') {
				dateRunGroups +=
					moment(startDate).add(i, 'd').format('L') +
					': ' +
					runGroups[i];
			} else {
				dateRunGroups +=
					', ' +
					moment(startDate).add(i, 'd').format('L') +
					': ' +
					runGroups[i];
			}
		}
	}
	let MSG =
		fullMSG !== ''
			? fullMSG +
			  ' You are on the waitlist. Event club will notify you if there is a spot available.'
			: 'You have successfully registered for the event.';
	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;
	let method = paymentMethod === 'onSite' ? 'On Site' : 'Stripe';
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
				' is successfully submitted.\n' +
				`Date: ` +
				dateRunGroups +
				'\n' +
				'Status: ' +
				MSG +
				'\n' +
				'Payment Method: ' +
				method +
				'\n' +
				'Entry Fee: $' +
				entryFee +
				'\n' +
				'Event Link: ' +
				eventLink +
				'\n' +
				'Thanks for registering the event.\n' +
				'Enjoy Driving!',
			html:
				'<p style="color:black;">Hi ' +
				recipientName +
				', </p>' +
				'<p style="color:black;">You registration for ' +
				clubName +
				' ' +
				eventName +
				' is successfully submitted.</p>' +
				'<p style="color:black;">Date: ' +
				dateRunGroups +
				'</p>' +
				'<p style="color:black;">Status: ' +
				MSG +
				'</p>' +
				'<p style="color:black;">Payment Method: ' +
				method +
				'</p>' +
				'<p style="color:black;">Entry Fee: $' +
				entryFee +
				'</p>' +
				'<p style="color:black;">Event Link: ' +
				eventLink +
				'</p>' +
				'<p style="color:black;">Thanks for registering the event.</p>' +
				'<p style="color:black;">Enjoy Driving!</p>',
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
