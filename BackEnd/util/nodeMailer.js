let nodemailer = require('nodemailer');
let AWS = require('aws-sdk');

const sendVerificationEmail = async (
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
				'/userConfirmtation/' +
				recipientEmail +
				'/' +
				token.token +
				'\n\nThis link expires in 24 hours.' +
				'\n\nTo request a new link, please click here: \n' +
				process.env.MYSEATTIME +
				'/userVerificationRequest/' +
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
				'/userConfirmation/' +
				recipientEmail +
				'/' +
				token.token +
				'</p>' +
				'<p>This link expires in 24 hours.</p>' +
				'<p>To request a new link, please click here:</p>' +
				'<p>' +
				process.env.MYSEATTIME +
				'/userVerificationRequest/' +
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

module.exports = {
	sendVerificationEmail
};
