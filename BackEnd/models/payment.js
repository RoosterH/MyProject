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
	}
	// creditCard: { type: Object, required: true, default: {} },
	// expDate: { type: Object, required: true, default: {} },
	// cvc: { type: Object, required: true, default: {} }
});

module.exports = mongoose.model('Payment', paymentSchema);
