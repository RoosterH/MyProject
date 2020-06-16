/**
 * This file defines Mongoose schema for "event"
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// each club has multiple events and each event is owned by a club
const eventSchema = new Schema({
	name: { type: String, required: true },
	image: { type: String },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	venue: { type: String, required: true },
	address: { type: String, require: true },
	coordinate: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true }
	},
	description: { type: String, requried: true },
	courseMap: { type: String },
	clubId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Club'
	}
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('Event', eventSchema);