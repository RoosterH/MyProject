/**
 * This file defines Mongoose schema for "entry" (event entry)
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// each club has multiple events and each event is owned by a club
const entrySchema = new Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	userLastName: { type: String, required: true },
	userFirstName: { type: String, required: true },
	clubId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Club'
	},
	clubName: { type: String, required: true },
	eventId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Event'
	},
	eventName: { type: String, required: true },
	// event entry answer
	answer: { type: Array, required: true },
	time: { type: Date, required: true },
	published: { type: Boolean, required: true }
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('Entry', entrySchema);
