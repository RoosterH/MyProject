/**
 * This file defines Mongoose schema for "event"
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// each club has multiple events and each event is owned by a club
const eventSchema = new Schema({
	name: { type: String, required: true },
	image: { type: String, required: true },
	type: { type: String, required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	regStartDate: { type: Date, required: true },
	regEndDate: { type: Date, required: true },
	venue: { type: String, required: true },
	address: { type: String, require: true },
	coordinate: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true }
	},
	description: { type: String, requried: true },
	instruction: { type: String, requried: true },
	courseMap: { type: String },
	// using ref as foreign key pointing to Club
	clubId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Club'
	},
	clubName: { type: String, required: true },
	clubImage: { type: String, required: true },
	published: { type: Boolean, required: true },

	// ** The following section will not be returned to front end unless from specific requests **
	// event entry form
	entryFormData: { type: Array, required: true },
	entries: [
		{ type: mongoose.Types.ObjectId, required: true, ref: 'Entry' }
	],
	waitlist: [
		{ type: mongoose.Types.ObjectId, required: true, ref: 'Entry' }
	],
	// Total entries allowed in an event
	totalCap: { type: Number },
	// Number of entries
	totalEntries: { type: Number, required: true },
	// Number of run groups in an event
	numGroups: { type: Number, required: true },
	// if true, we will create an array groupEntries with numGroup elements. Each element value cannot exceed totalCap / numGroups.
	capDistribution: { type: Boolean, required: true },
	// Run group options defined by club in the event entry form
	runGroupOptions: [{ type: String, requird: true }],
	// Users per run group
	runGroupEntries: [
		[
			{
				type: mongoose.Types.ObjectId,
				ref: 'User',
				require: true
			}
		]
	],
	// Worker group options defined by club in the event entry form. No need to define workGroupEntries.
	WorkerOptions: { type: [String], required: true },
	// Lunction
	LunchOptions: { type: [String] }
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('Event', eventSchema);
