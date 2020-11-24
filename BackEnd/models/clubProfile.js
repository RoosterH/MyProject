const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { stringify } = require('uuid');

const Schema = mongoose.Schema;

const clubProfileSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		ref: 'Club'
	},
	webPage: { type: String, required: true },
	faceBook: { type: String, required: true },
	youTube: { type: String },
	contactEmail: {
		type: String,
		required: true,
		set: v => v.toLowerCase()
	},
	description: { type: String, required: true },
	// there is no resized image for club, originalImage is uploaded from clubs
	originalProfileImage: { type: String, require: true },
	// image points to CloudFront
	profileImage: { type: String, require: true }
});

// uniqueValidator is to make sure the email is unique in MongoDB
clubProfileSchema.plugin(uniqueValidator);

module.exports = mongoose.model('ClubProfile', clubProfileSchema);
