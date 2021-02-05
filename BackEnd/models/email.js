const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user email account verification token, we will purge it after verification and a resend request
const emailSchema = new mongoose.Schema({
	recipientIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		}
	],
	subject: { type: String, required: true },
	content: { type: String, required: true },
	timeStamp: { type: Date, required: true },
	clubId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Club'
	},
	eventId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event'
	}
});

module.exports = mongoose.model('Email', emailSchema);
