const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const moment = require('moment');

const event = require('../models/event');
const NOT_ATTENDING = 'Not Attending';
const PAID = 'Paid';
const AUTHENTICATION = 'Require Authentication';
const DECLINED = 'Declined';

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
	entryFee,
	payMembership,
	membershipFee,
	memberExp
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
	let actualEntryFee = entryFee;
	if (payMembership) {
		actualEntryFee = (
			parseFloat(entryFee) - parseFloat(membershipFee)
		).toString();
	}
	let MSG =
		fullMSG !== ''
			? fullMSG +
			  ' You are on the waitlist. Event club will notify you if there is a spot available.'
			: 'You have successfully registered for the event.';
	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;
	let method = paymentMethod === 'onSite' ? 'On Site' : 'Stripe';
	let membershipMSG = payMembership
		? 'New membership expiration date: ' +
		  moment(memberExp).format('L') +
		  '\n' +
		  'Membership Fee: $' +
		  membershipFee +
		  '\n'
		: '';
	let membershipMSGHtml = payMembership
		? '<p style="color:black;"> New membership expiration date: ' +
		  moment(memberExp).format('L') +
		  '</p>' +
		  '<p style="color:black;"> Membership Fee: $' +
		  membershipFee +
		  '</p>'
		: '';
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
				membershipMSG +
				'Payment Method: ' +
				method +
				'\n' +
				'Entry Fee: $' +
				actualEntryFee +
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
				membershipMSGHtml +
				'<p style="color:black;">Payment Method: ' +
				method +
				'</p>' +
				'<p style="color:black;">Entry Fee: $' +
				actualEntryFee +
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

const sendRegistrationNotificationEmail = async (
	recipientName,
	recipientEmail,
	userLastName,
	userFirstName,
	eventName,
	eventId,
	startDate,
	runGroups,
	fullMSG,
	paymentMethod,
	entryFee,
	payMembership,
	membershipFee,
	memberExp
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

	let from = '"MYSeatTime.com " ' + '<admin@myseattime.com>';
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
	let actualEntryFee = entryFee;
	if (payMembership) {
		actualEntryFee = (
			parseFloat(entryFee) - parseFloat(membershipFee)
		).toString();
	}
	let MSG =
		fullMSG !== ''
			? fullMSG +
			  ' Registrant is on the waitlist. Please notify the registrant if there is a spot available.'
			: 'Registrant has successfully registered for the event.';
	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;
	let method = paymentMethod === 'onSite' ? 'On Site' : 'Stripe';
	let membershipMSG = payMembership
		? 'Membership signup/renewal. New membership expiration date: ' +
		  moment(memberExp).format('L') +
		  '\n' +
		  'Membership Fee: $' +
		  membershipFee +
		  '\n'
		: '';
	let membershipMSGHtml = payMembership
		? '<p style="color:black;"> Membership signup/renewal. New expiration date: ' +
		  moment(memberExp).format('L') +
		  '</p>' +
		  '<p style="color:black;"> Membership Fee: $' +
		  membershipFee +
		  '</p>'
		: '';
	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: from,
			to: recipientEmail,
			subject:
				recipientName +
				' ' +
				eventName +
				' registration notification',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'A new registration for ' +
				recipientName +
				' ' +
				eventName +
				' has been submitted.\n' +
				'Driver Name: ' +
				userLastName +
				', ' +
				userFirstName +
				'/n' +
				`Date: ` +
				dateRunGroups +
				'\n' +
				'Status: ' +
				MSG +
				'\n' +
				membershipMSG +
				'Payment Method: ' +
				method +
				'\n' +
				'Entry Fee: $' +
				actualEntryFee +
				'\n' +
				'Event Link: ' +
				eventLink +
				'\n' +
				'Thanks for using MYSeatTime.\n',
			html:
				'<p style="color:black;">Hi ' +
				recipientName +
				', </p>' +
				'<p style="color:black;">A new registration for ' +
				recipientName +
				' ' +
				eventName +
				' has been submitted.</p>' +
				'<p>Driver Name: ' +
				userLastName +
				', ' +
				userFirstName +
				'</p>' +
				'<p style="color:black;">Date: ' +
				dateRunGroups +
				'</p>' +
				'<p style="color:black;">Status: ' +
				MSG +
				'</p>' +
				membershipMSGHtml +
				'<p style="color:black;">Payment Method: ' +
				method +
				'</p>' +
				'<p style="color:black;">Entry Fee: $' +
				actualEntryFee +
				'</p>' +
				'<p style="color:black;">Event Link: ' +
				eventLink +
				'</p>' +
				'<p style="color:black;">Thanks for using MYSeatTime.</p>',
			sender: 'admin@myseattime.com',
			replyTo: 'myseattime@gmail.com'
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

const sendChargeConfirmationEmail = async (
	recipientName,
	recipientEmail,
	clubName,
	clubEmail,
	eventName,
	eventId,
	paymentStatus,
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
	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;
	let MSG = '';
	if (paymentStatus === PAID) {
		MSG =
			'Your payment has been successfully charged. Thanks for attending the event. See you next time.';
	} else if (paymentStatus === AUTHENTICATION) {
		MSG =
			'You are required to authenticate your credit card.  Please log in to event using the following link ' +
			eventLink +
			'. Click on Modify Entry button => Registration to authenticate it.  Thank you!';
	} else if (paymentStatus === DECLINED) {
		MSG =
			'Your credit card was declined. Please log in to event using the following link ' +
			eventLink +
			'. Click on Modify Entry button => Registration to provide a new credit card.  Thank you!';
	}

	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: from,
			to: recipientEmail,
			subject: clubName + ' ' + eventName + ' payment status update',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				'Your payment for ' +
				clubName +
				' ' +
				eventName +
				' has been processed.\n' +
				'Here is the payment status.\n' +
				'Entry Fee: $' +
				entryFee +
				'\n' +
				`Payment Status: ` +
				MSG,
			html:
				'<p style="color:black;">Hi ' +
				recipientName +
				', </p>' +
				'<p style="color:black;">Your payment for ' +
				clubName +
				' ' +
				eventName +
				' has been processed.</p>' +
				'<p>Here is the payment status.</p>' +
				'<p style="color:black;">Entry Fee: $' +
				entryFee +
				'</p>' +
				'<p style="color:black;">Payment Status: ' +
				MSG +
				'</p>',
			sender: clubEmail,
			replyTo: clubEmail
		});
	} catch (err) {
		console.log('nodemailer err = ', err);
	}
};

const sendChargeAllConfirmationEmail = async (
	clubName,
	clubEmail,
	eventName,
	eventId,
	emailContents
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
	let eventLink = process.env.MYSEATTIME + '/events/' + eventId;

	// DO NOT USE Throttling here as it is going to send emails infinitely
	for (let i = 0; i < emailContents.length; ++i) {
		const {
			recipientName,
			recipientEmail,
			paymentStatus,
			entryFee
		} = emailContents[i];
		let MSG = '';
		if (paymentStatus === PAID) {
			MSG =
				'Your payment has been successfully charged. Thanks for attending the event. See you next time.';
		} else if (paymentStatus === AUTHENTICATION) {
			MSG =
				'You are required to authenticate your credit card.  Please log in to event using the following link ' +
				eventLink +
				'. Click on Modify Entry button => Registration to authenticate it.  Thank you!';
		} else if (paymentStatus === DECLINED) {
			MSG =
				'Your credit card was declined. Please log in to event using the following link ' +
				eventLink +
				'. Click on Modify Entry button => Registration to provide a new credit card.  Thank you!';
		}

		// send email
		let info;
		try {
			info = transporter.sendMail({
				from: from,
				to: recipientEmail,
				subject:
					clubName + ' ' + eventName + ' payment status update',
				text:
					'Hi ' +
					recipientName +
					',\n\n' +
					'Your payment for ' +
					clubName +
					' ' +
					eventName +
					' has been processed.\n' +
					'Here is the payment status.\n' +
					'Entry Fee: $' +
					entryFee +
					'\n' +
					`Payment Status: ` +
					MSG,
				html:
					'<p style="color:black;">Hi ' +
					recipientName +
					', </p>' +
					'<p style="color:black;">Your payment for ' +
					clubName +
					' ' +
					eventName +
					' has been processed.</p>' +
					'<p>Here is the payment status.</p>' +
					'<p style="color:black;">Entry Fee: $' +
					entryFee +
					'</p>' +
					'<p style="color:black;">Payment Status: ' +
					MSG +
					'</p>',
				sender: clubEmail,
				replyTo: clubEmail
			});
		} catch (err) {
			console.log('nodemailer err = ', err);
		}
	}
};

const sendRefundEmail = async (
	recipientName,
	recipientEmail,
	clubName,
	clubEmail,
	eventName,
	eventId,
	refundFee
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

	// send email
	let info;
	try {
		info = await transporter.sendMail({
			from: from,
			to: recipientEmail,
			subject:
				clubName + ' ' + eventName + ' payment refund notification',
			text:
				'Hi ' +
				recipientName +
				',\n\n' +
				clubName +
				' has issued a refund for event ' +
				eventName +
				' in the amount of $' +
				refundFee +
				'.\n' +
				'It usually takes 7-10 business days to refund the money back to your credit card.\n\n' +
				'Thanks you!',
			html:
				'<p style="color:black;">Hi ' +
				recipientName +
				', </p>' +
				'<p style="color:black;">' +
				clubName +
				' has issued a refund for event ' +
				eventName +
				' in the amount of $' +
				refundFee +
				'.</p>' +
				'<p>It usually takes 7-10 business days to refund the money back to your credit card.</p>' +
				'<p style="color:black;">Thank you! </p>',
			sender: clubEmail,
			replyTo: clubEmail
		});
	} catch (err) {
		console.log('nodemailer err = ', err);
	}
};

const sendClubEmail = async (
	recipients,
	subject,
	content,
	clubName,
	clubEmail
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

	// DO NOT USE Throttling here as it is going to send emails infinitely
	for (let i = 0; i < recipients.length; ++i) {
		const recipientName = recipients[i].firstName;
		const recipientEmail = recipients[i].email;
		// send email
		let info;
		try {
			info = transporter.sendMail({
				from: from,
				to: recipientEmail,
				subject: subject,
				text: content,
				html: content,
				sender: clubEmail,
				replyTo: clubEmail
			});
		} catch (err) {
			console.log('nodemailer err = ', err);
		}
	}
};

module.exports = {
	sendVerificationEmail,
	sendAccountActivationEmail,
	sendRegistrationConfirmationEmail,
	sendRegistrationNotificationEmail,
	sendAddToEntryListEmail,
	sendChangeRunGroupEmail,
	sendChargeConfirmationEmail,
	sendChargeAllConfirmationEmail,
	sendRefundEmail,
	sendClubEmail
};
