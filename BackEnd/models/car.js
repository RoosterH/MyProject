/**
 * This file defines Mongoose schema for "car"
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// each user has one or more cars and each car is owned by a user
const carSchema = new Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	userName: { type: String, required: true },
	active: { type: Boolean, required: true },
	originalImage: { type: String, required: true },
	image: { type: String, required: true },
	year: { type: String, required: true },
	make: { type: String, required: true },
	model: { type: String, required: true },
	trimLevel: { type: String },
	// tire section
	tireBrand: { type: String, required: true },
	tireName: { type: String, required: true },
	tireFrontWidth: { type: String, required: true },
	tireFrontDiameter: { type: String, required: true },
	tireFrontRatio: { type: String, required: true },
	tireRearWidth: { type: String, required: true },
	tireRearDiameter: { type: String, required: true },
	tireRearRatio: { type: String, required: true },

	// share the following sections to other users
	share: { type: Boolean, required: true },

	// tire pressure
	frontPressure: { type: String },
	rearPressure: { type: String },

	/*** alignment section  ***/
	// camber
	LFCamber: { type: String },
	RFCamber: { type: String },
	LRCamber: { type: String },
	RRCamber: { type: String },
	// caster
	LFCaster: { type: String },
	RFCaster: { type: String },
	// toe
	LFToe: { type: String },
	RFToe: { type: String },
	frontToe: { type: String },
	LRToe: { type: String },
	RRToe: { type: String },
	rearToe: { type: String },

	// sawy bar
	FBar: { type: String },
	RBar: { type: String },

	// suspension
	FRebound: { type: String },
	RRebound: { type: String },
	FCompression: { type: String },
	RCompression: { type: String },

	note: { type: String }
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Car' will be converted to 'cars' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('Car', carSchema);
