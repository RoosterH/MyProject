const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
		default: '0000'
	},
	stripePaymentMethodId: {
		type: String,
		required: true,
		default: '0000'
	}
	// creditCard: { type: Object, required: true, default: {} },
	// expDate: { type: Object, required: true, default: {} },
	// cvc: { type: Object, required: true, default: {} }
});

module.exports = mongoose.model('Payment', paymentSchema);
