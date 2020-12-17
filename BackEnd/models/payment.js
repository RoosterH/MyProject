const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DEFAULT_STRIPE_ID = '0000';

const paymentSchema = new Schema({
	entryId: {
		type: mongoose.Types.ObjectId,
		ref: 'Entry'
	},
	entryFee: { type: String, required: true, default: '0' },
	paymentMethod: { type: String, required: true, default: 'stripe' },
	stripeSetupIntentId: {
		type: String,
		required: true,
		default: DEFAULT_STRIPE_ID
	},
	stripePaymentMethodId: {
		type: String,
		required: true,
		default: DEFAULT_STRIPE_ID
	},
	stripePaymentIntentId: {
		type: String,
		required: true,
		default: DEFAULT_STRIPE_ID
	},
	// paymentStatus: "Unpaid", "Paid", "Authentication", "Declined"
	paymentStatus: {
		type: String,
		required: true,
		default: 'Unpaid'
	}
});

module.exports = mongoose.model('Payment', paymentSchema);
