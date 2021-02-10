const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSettingsSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		ref: 'Club'
	},
	hostPrivateEvent: { type: Boolean, required: true, default: false },
	memberSystem: { type: Boolean, require: true, default: false },
	collectMembershipFee: {
		type: Boolean,
		require: true,
		default: false
	},
	membershipFee: { type: String, require: true, default: '0' }
});

module.exports = mongoose.model('ClubSettings', clubSettingsSchema);
