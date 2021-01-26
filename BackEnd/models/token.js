const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user email account verification token, we will purge it after verification and a resend request
const tokenSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	token: { type: String, required: true },
	expireAt: {
		type: Date,
		default: Date.now,
		index: { expires: 86400 }
	}
});

module.exports = mongoose.model('Token', tokenSchema);
