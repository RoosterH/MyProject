const mongoose = require('mongoose');
const { stringify } = require('uuid');
const Schema = mongoose.Schema;
const { Encrypt, Decrypt } = require('../util/crypto');

const clubMemberSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Club'
	},
	// userId is optional because we are importing the list from a file
	// we do not attach to a userId until user first registers an event with the club
	userId: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	lastName: { type: String, required: true },
	firstName: { type: String, required: true },
	email: {
		type: String,
		set: v => v.toLowerCase()
	},
	memberNumber: { type: String, default: '0000' },
	memberExp: { type: Date },
	carNumber: { type: String }
});

module.exports = mongoose.model('ClubMember', clubMemberSchema);
