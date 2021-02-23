/**
 * This file defines Mongoose schema for "event"
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// each club has multiple events and each event is owned by a club
const eventSchema = new Schema({
	name: { type: String, required: true },
	originalImage: { type: String, required: true },
	smallImage: { type: String, required: true },
	image: { type: String, required: true },
	type: { type: String, required: true },
	// flag for multi-day events to generate entry report for each day. Mainly for run group/lunch
	multiDayEvent: { type: Boolean, required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	priorityRegEndDate: { type: Date, required: true },
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
	originalCourseMap: { type: String },
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
	entryReportId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'EntryReport'
	},
	closed: { type: Boolean, requried: true },
	// ** The following section will not be returned to front end unless from specific requests **
	// event entry form
	entryFormData: { type: Array, required: true },
	// event total capacity
	totalCap: { type: Number },
	// Number of run groups in an event
	numGroups: { type: Number, required: true },
	// if true, we will create an array runGroupNumEntries with numGroup elements. Each element value cannot exceed totalCap / numGroups.
	capDistribution: { type: Boolean, required: true },
	//! registrationOption is required
	// Registration options defined by club in the event entry form such as member or non-member
	// this is initialized in club.createEventForm
	registrationOptions: [{ type: String, requird: true }],
	//! raceClass is optional
	// Race class options defined by club in the event entry form
	raceClassOptions: [{ type: String, requird: true }],
	//! runGroup is required
	// Run group options defined by club in the event entry form such as morning session 1, morning session 2 ... etc.
	// this is initialized in club.createEventForm
	runGroupOptions: [[{ type: String, requird: true }]],
	//! workerAssignment is optional
	// Worker group options defined by club in the event entry form. No need to define workGroupEntries.
	workerAssignments: [[{ type: String, required: true }]],
	//! lunchOptions is optional
	// Lunch options, becasue most of cases events don't provide lunches so we will make it optional
	lunchOptions: [{ type: String }],
	insuranceWaiver: { type: String, required: true },
	privateEvent: { type: Boolean, require: true, default: false }
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('Event', eventSchema);
