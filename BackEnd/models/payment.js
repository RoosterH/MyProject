const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DEFAULT_STRIPE_ID = '0000';

const paymentSchema = new Schema({
	entryId: {
		type: mongoose.Types.ObjectId,
		ref: 'Entry'
	},
	entryFee: { type: String, required: true, default: '0' },
	refundFee: { type: String, required: true, default: '0' },
	// record stripe processing fee so we can display it in refund center
	stripeFee: { type: String, required: true, default: '0' },
	paymentMethod: { type: String, required: true, default: 'stripe' },
	// paymentStatus: "Unpaid", "Paid", "Authentication", "Declined", "Refunded"
	paymentStatus: {
		type: String,
		required: true,
		default: 'Unpaid'
	},
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
	stripeRefundId: {
		type: String
	}
});

module.exports = mongoose.model('Payment', paymentSchema);
