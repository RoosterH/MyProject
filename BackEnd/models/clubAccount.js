const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubAccountSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		ref: 'Club'
	},
	onSitePayment: { type: String, required: true },
	stripePayment: { type: String, required: true },
	stripePublicKey: { type: Object, require: true, default: {} },
	stripeSecretKey: { type: Object, required: true, default: {} }
});

module.exports = mongoose.model('ClubAccount', clubAccountSchema);
