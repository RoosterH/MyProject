const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const { Encrypt, Decrypt } = require('../util/crypto');

const clubSchema = new Schema({
	// uniquie: true meaning create an index for this property for fast query
	name: { type: String, required: true },
	email: {
		type: String,
		required: true,
		unique: true,
		set: v => v.toLowerCase()
	},
	password: { type: String, required: true, minlength: 6 },
	// there is no resized image for club, originalImage is uploaded from clubs
	originalImage: { type: String, require: true },
	// image points to CloudFront
	image: { type: String, require: true },
	// because a club could have multiple events so we need to use array. [] means array
	// using ref as a foreing key referring to Event
	events: [
		{
			type: mongoose.Types.ObjectId,
			required: true,
			ref: 'Event'
		}
	],
	entryFormTemplate: { type: Array },
	accountId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'ClubAccount',
		default: '000000000000'
	},
	eventSettingsId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'ClubEventSettings',
		default: '000000000000'
	},
	profileId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'ClubProfile',
		default: '000000000000'
	},
	numberTableId: {
		type: mongoose.Types.ObjectId,
		ref: 'NumberTable'
	},
	verified: { type: Boolean, required: true, default: false }
});

// uniqueValidator is to make sure the email is unique in MongoDB
clubSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Club', clubSchema);
