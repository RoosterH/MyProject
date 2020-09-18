const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	// uniquie: true meaning create an index for this property for fast query
	username: { type: String, required: true },
	lastname: { type: String, required: true },
	firstname: { type: String, required: true },
	email: {
		type: String,
		required: true,
		unique: true,
		set: v => v.toLowerCase()
	},
	password: { type: String, required: true, minlength: 6 },
	passwordValidation: { type: String, minlength: 6 },
	image: { type: String, require: true },
	// because a user could have multiple events so we need to use array. [] means array
	// using ref as a foreing key referring to Event
	entries: [
		{ type: mongoose.Types.ObjectId, required: true, ref: 'Entry' }
	],
	garage: [
		{ type: mongoose.Types.ObjectId, required: true, ref: 'Car' }
	]
});

// uniqueValidator is to make sure the email is unique in MongoDB
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
