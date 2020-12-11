const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubAccountSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		ref: 'Club'
	},
	onSitePayment: { type: Boolean, required: true },
	stripePayment: { type: Boolean, required: true },
	stripeAccountId: { type: Object, required: true, default: {} }
});

module.exports = mongoose.model('ClubAccount', clubAccountSchema);
