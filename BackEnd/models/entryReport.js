/**
 * This file defines Mongoose schema for "event"
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Entry Report for each event. Decoupling from event table.
const entryReportSchema = new Schema({
	// using ref as foreign key pointing to Club
	eventId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Event'
	},

	// ** The following section will not be returned to front end unless from specific requests **
	// event entry form
	entryFormData: { type: Array, required: true },
	// ! array
	entries: [
		[
			{
				type: mongoose.Types.ObjectId,
				required: true,
				ref: 'Entry'
			}
		]
	],
	// ! array
	waitlist: [
		[
			{
				type: mongoose.Types.ObjectId,
				required: true,
				ref: 'Entry'
			}
		]
	],
	// ! array
	full: [{ type: Boolean }],
	// Number of entries
	// ! array
	totalEntries: [{ type: Number, required: true }],
	// Run Group number of entries
	// ! array
	// we use index number to represent each run group for example if there are 5 run groups,
	// we will have 5 elements in the array runGroupNumEntries[0] => first run group entries
	// runGroupNumEntries: [[{ type: Number, required: true }]],
	runGroupNumEntries: [[{ type: Number, require: true }]]
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('EntryReport', entryReportSchema);
