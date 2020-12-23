const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubAccountSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		ref: 'Club'
	},
	onSitePayment: { type: Boolean, required: true },
	stripePayment: { type: Boolean, required: true },
	hostPrivateEvent: { type: Boolean, required: true, default: false },

	// stripeAccountId is encrypted
	stripeAccountId: {
		type: Object,
		required: true,
		default: {}
	}
});

module.exports = mongoose.model('ClubAccount', clubAccountSchema);
