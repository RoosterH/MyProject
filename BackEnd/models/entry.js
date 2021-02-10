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
	paymentId: {
		type: mongoose.Types.ObjectId,
		ref: 'Payment'
	},
	userLastName: { type: String, required: true },
	userFirstName: { type: String, required: true },
	userName: { type: String, required: true },
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
	carId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Car'
	},
	carNumber: { type: String, required: true },
	// raceClass is optional
	// if raceClass is not defined for the event, set 'NA' as default to pass validation
	raceClass: { type: String, required: true, default: 'NA' },
	// event entry answer
	answer: { type: Array, required: true },
	disclaimer: { type: Boolean, require: true },
	time: { type: Date, required: true },
	// not used right now. this is intended for loading unfished-entry
	published: { type: Boolean, required: true },
	// ! array flag to indicate entry is on the event waitlist
	waitlist: [{ type: Boolean, required: true }],
	// ! array flag to indicate entry is on group waitlist,
	// if it's on group waitlis, it must be also on waitlist
	// however if event does not have cap set, entry can be on waitlist but not groupWaitlist
	groupWaitlist: [{ type: Boolean, require: true }],

	// the following section fields are parsed from answer
	// the value we store is the answer optoin value
	// such as: "raceRadioOption_1", we store 1
	// ! array the best way to use array is to define a static length
	// ! Issue with dynamic length, DB does not have a good planning for the storage block. If the array gets too big not
	// ! able to hold in a block, DB will need to relocate to a larger block for all the information.  This will be system
	// ! performance hit.
	runGroup: [{ type: String, required: true }],
	//runGroup: { type: String, required: true },
	workerAssignment: [{ type: String, required: true }],
	lunchOption: { type: String },
	payMembership: { type: Boolean, require: true, default: false }
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('Entry', entrySchema);
