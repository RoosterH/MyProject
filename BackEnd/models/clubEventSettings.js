const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubEventSettingsSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		ref: 'Club'
	},

	hostPrivateEvent: { type: Boolean, required: true, default: false },
	memberSystem: { type: Boolean, require: true, default: false }
});

module.exports = mongoose.model(
	'ClubEventSettings',
	clubEventSettingsSchema
);
