const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	address: { type: Object, required: true, default: {} },
	city: { type: Object, required: true, default: {} },
	state: { type: String, required: true, default: '' },
	zip: { type: String, required: true, default: '' },
	phone: { type: Object, required: true, default: {} },
	emergency: { type: String, required: true, default: '' },
	emergencyPhone: {
		type: Object,
		required: true,
		default: {}
	},
	// flag indicate driver is at least 16 years old with a valid driver license
	validDriver: { type: Boolean, required: true, default: false },
	// flag indicate users agree to share information
	disclaimer: { type: Boolean, required: true, default: false },
	// complete = validDriver && disclaimer, we use it to determine whether users
	// are able to register events or not
	complete: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('UserAccount', userAccountSchema);
