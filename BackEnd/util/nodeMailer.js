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
				'<p style="color:black;">Your registration for ' +
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

const sendAddToEntryListEmail = async (
	recipientName,
	recipientEmail,
	clubName,
	clubEmail,
	eventName,
	eventId,
	startDate,
	runGroups,
	waitlist,
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
	let newStatus = '';
	for (let i = 0; i < waitlist.length; ++i) {
		if (waitlist[i]) {
			if (newStatus === '') {
				newStatus +=
					moment(startDate).add(i, 'd').format('L') +
					': ' +
					runGroups[i] +
					'- waitlist';
			} else {
				newStatus +=
					', ' +
					moment(startDate).add(i, 'd').format('L') +
					': ' +
					runGroups[i] +
					'- waitlist';
			}
		} else {
			// entry list
			if (newStatus === '') {
				if (runGroups[i] === NOT_ATTENDING) {
					newStatus +=
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i] +
						'.';
				} else {
					newStatus +=
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i] +
						'- entry confirmed';
				}
			} else {
				if (runGroups[i] === NOT_ATTENDING) {
					newStatus +=
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i];
				} else {
					newStatus +=
						', ' +
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i] +
						'- entry confirmed';
				}
			}
		}
	}

	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;
	let method = paymentMethod === 'onSite' ? 'On Site' : 'Stripe';
	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: from,
			to: recipientEmail,
			subject:
				clubName +
				' ' +
				eventName +
				' waitlist status update - Important',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'Your entry for ' +
				clubName +
				' ' +
				eventName +
				' has been updated by event organizer.\n' +
				'Here is the new entry status.\n' +
				`Status: ` +
				newStatus +
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
				'<p style="color:black;">Your entry for ' +
				clubName +
				' ' +
				eventName +
				' has been updated by event organizer.</p>' +
				'<p>Here is the new entry status.</p>' +
				'<p style="color:black;">Status: ' +
				newStatus +
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

const sendChangeRunGroupEmail = async (
	recipientName,
	recipientEmail,
	clubName,
	clubEmail,
	eventName,
	eventId,
	startDate,
	runGroups,
	waitlist,
	oldGroupName,
	newGroupName,
	daySelected
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
	let groupChangeDay = moment(startDate)
		.add(daySelected, 'd')
		.format('L');
	let newStatus = '';
	for (let i = 0; i < waitlist.length; ++i) {
		if (waitlist[i]) {
			if (newStatus === '') {
				newStatus +=
					moment(startDate).add(i, 'd').format('L') +
					': ' +
					runGroups[i] +
					'- waitlist';
			} else {
				newStatus +=
					', ' +
					moment(startDate).add(i, 'd').format('L') +
					': ' +
					runGroups[i] +
					'- waitlist';
			}
		} else {
			// entry list
			if (newStatus === '') {
				if (runGroups[i] === NOT_ATTENDING) {
					newStatus +=
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i] +
						'.';
				} else {
					newStatus +=
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i] +
						'- entry confirmed';
				}
			} else {
				if (runGroups[i] === NOT_ATTENDING) {
					newStatus +=
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i];
				} else {
					newStatus +=
						', ' +
						moment(startDate).add(i, 'd').format('L') +
						': ' +
						runGroups[i] +
						'- entry confirmed';
				}
			}
		}
	}

	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;

	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: from,
			to: recipientEmail,
			subject:
				clubName + ' ' + eventName + ' run group update - Important',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'Your entry for ' +
				clubName +
				' ' +
				eventName +
				' has been updated by event organizer.\n' +
				groupChangeDay +
				' original run group ' +
				oldGroupName +
				' has been changed to ' +
				newGroupName +
				'.\n' +
				'Here is the new entry status.\n' +
				`Status: ` +
				newStatus +
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
				'<p style="color:black;">Your entry for ' +
				clubName +
				' ' +
				eventName +
				' has been updated by event organizer.</p>' +
				'<p>' +
				groupChangeDay +
				' original run group ' +
				oldGroupName +
				' has been changed to ' +
				newGroupName +
				'.</p>' +
				'<p>Here is the new entry status.</p>' +
				'<p style="color:black;">Status: ' +
				newStatus +
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
	sendRegistrationConfirmationEmail,
	sendAddToEntryListEmail,
	sendChangeRunGroupEmail
};
