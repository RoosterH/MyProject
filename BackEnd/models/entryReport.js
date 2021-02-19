/**
 * This file defines Mongoose schema for "event"
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Entry Report for each event. Decoupling from event table.
const entryReportSchema = new Schema({
	// using ref as foreign key pointing to Club
	// due to programming challenge, we will not set required: true here
	// but it should be.  We will always set in our code so it's safe.
	eventId: {
		type: mongoose.Types.ObjectId,
		ref: 'Event'
	},

	// ** The following section will not be returned to front end unless from specific requests **
	// ! nested array
	entries: [
		[
			{
				type: mongoose.Types.ObjectId,
				required: true,
				ref: 'Entry'
			}
		]
	],
	// ! nested array
	waitlist: [
		[
			{
				type: mongoose.Types.ObjectId,
				required: true,
				ref: 'Entry'
			}
		]
	],
	// ! nested array
	// Run Group number of entries
	// we use index number to represent each run group for example if there are 5 run groups,
	// we will have 5 elements in the array runGroupNumEntries[0] => first run group entries
	// runGroupNumEntries: [[{ type: Number, required: true }]],
	runGroupNumEntries: [[{ type: Number, require: true }]],

	// ! nested array
	// Run Group Registration Status: true - open to register, false - closed
	runGroupRegistrationStatus: [
		[{ type: Boolean, require: true, default: true }]
	],

	// definition of full
	// 1. event.capDistribution true, each group must already meet group cap to consider event is full
	// 2. event.capDistribution false, total entries >= event.totalCap
	full: [{ type: Boolean, require: true }],
	// Number of entries
	totalEntries: [{ type: Number, required: true }]
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('EntryReport', entryReportSchema);
