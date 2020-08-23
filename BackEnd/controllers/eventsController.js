const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

// for Google Geocode API that converts address to coordinates
const getCoordinatesForAddress = require('../util/location');
const Event = require('../models/event');
const Club = require('../models/club');
// const mongooseUniqueValidator = require('mongoose-unique-validator');
const fileUpload = require('../middleware/file-upload');
const { min } = require('moment');

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

// GET /api/events/
const getAllEvents = async (req, res, next) => {
	const cId = req.params.cid;
	let events;
	try {
		events = await Event.find({}).sort({
			startDate: -1,
			endDate: -1
		});
	} catch (err) {
		const error = new HttpError(
			'Get all events process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!events || events.length === 0) {
		const error = new HttpError('No event available.', 404);

		return next(error);
	}

	res.status(200).json({
		events: events.map(event => event.toObject({ getters: true }))
	});
};

// GET /api/events/:eid
const getEventById = async (req, res, next) => {
	// req.params is getting the eid from url, such as /api/events/:id
	const eventId = req.params.eid;

	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'Get event by ID process failed. Please try again later.',
			500
		);
		return next(error);
	}

	// this error is for DB not be able to find the event with provided ID
	if (!event) {
		const error = new HttpError(
			'Could not find the event with the provided id',
			404
		);
		return next(error);
	}

	// convert Mongoose object to a normal js object and get rid of _ of _id using getters: true
	res.status(200).json({ event: event.toObject({ getters: true }) }); // { event } => { event: event }
};

// GET /api/events/club/:cid
const getEventsByClubId = async (req, res, next) => {
	const cId = req.params.cid;

	let club;
	try {
		club = await Club.findById(cId).populate({
			path: 'events',
			options: { sort: { startDate: -1, endDate: -1 } }
		});
	} catch (err) {
		const error = new HttpError(
			'Get events by club ID process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!club || club.events.length === 0) {
		const error = new HttpError('Could not find any event.', 404);

		return next(error);
	}

	res.status(200).json({
		events: club.events.map(event =>
			event.toObject({
				getters: true
			})
		)
	});
};

// POST /api/events/date/
const getEventsByDate = async (req, res, next) => {
	const { eventType, startDate, endDate, distance, zip } = req.body;
	let events;
	// index {type: 1, startDate: 1}, covered query {type, startDate} is indexed
	try {
		events = await Event.find({
			type: eventType,
			startDate: { $gte: startDate, $lte: endDate },
			published: true
		}).sort({
			endDate: 1
		});
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Get event by date process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!events || events.length === 0) {
		const error = new HttpError(
			'Could not find any event with the date range',
			404
		);

		return next(error);
	}

	res.status(200).json({
		events: events.map(event => event.toObject({ getters: true }))
	});
};

// POST /api/events/
const createEvent = async (req, res, next) => {
	// validate request, req checks are defined in eventRoutes.js using
	// express-validator
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		return next(
			new HttpError(
				`Create event process failed. Please check your data: ${result.array()}`,
				422
			)
		);
	}

	// we need to get the data from body
	const {
		name,
		type,
		startDate,
		endDate,
		regStartDate,
		regEndDate,
		venue,
		address,
		description,
		instruction
	} = req.body;

	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData.clubId;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Create event process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Create event failure. Unauthorized request.',
			404
		);
		return next(error);
	}

	let coordinate;
	try {
		coordinate = await getCoordinatesForAddress(address);
	} catch (error) {
		return next(error);
	}

	let imagePath = req.files.image[0].path;
	let courseMapPath;
	if (req.files.courseMapPath) {
		courseMapPath = req.files.courseMap[0].path;
	}

	const newEvent = new Event({
		name,
		type,
		startDate,
		endDate,
		regStartDate,
		regEndDate: moment(regEndDate)
			.add(23, 'h')
			.add(59, 'm')
			.add(59, 's'),
		venue,
		address,
		coordinate,
		description,
		instruction,
		// instead of getting the clubId from body that could be faked, we will get
		// it from the token
		clubId: clubId,
		clubName: club.name,
		clubImage: club.image,
		image: imagePath,
		courseMap: courseMapPath,
		published: false,
		formData: [],
		entries: []
	});

	try {
		/**
		 * 2 operations here: 1. save the event to DB. 2. store the event ID to club
		 * create a session for transaction, transaction is atomic meaning a logical unit
		 * of work must be either completed with all of its data modifications, or none
		 * of them is performed. Also it's isolated, modifications of data must be independent
		 * of another transaction.
		 **/
		const session = await mongoose.startSession();
		session.startTransaction();
		await newEvent.save({ session: session });
		/**
		 * push here is not an array push method. Instead it's a Mongoose method that
		 * establishes connection between two models which are club and event in this case.
		 * Behind the scence, Mongo DB grabs newEvent ID and adds it to events field of the
		 * club.
		 **/
		club.events.push(newEvent);
		await club.save({ session: session });
		// only both tasks succeed, we commit the transaction
		await session.commitTransaction();
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Create event failed. Please try again later.',
			500
		);
		return next(error);
	}

	res
		.status(201)
		.json({ event: newEvent.toObject({ getters: true }) });
};

// PATCH /api/events/:eid
const updateEvent = async (req, res, next) => {
	// validate request, req checks are defined in eventRoutes.js using
	// express-validator
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		return next(
			new HttpError(
				`Update2 event process failed. Please check your data: ${result.array()}`,
				422
			)
		);
	}

	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData.clubId;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Update event process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Update event failure. Unauthorized request.',
			404
		);
		return next(error);
	}

	// we allow all the data to be updated except id, and clubId
	const {
		name,
		type,
		startDate,
		endDate,
		regStartDate,
		regEndDate,
		venue,
		address,
		description,
		instruction
	} = req.body;

	// for async error handling, we need to use try catch if the function returns error
	let coordinate;
	try {
		coordinate = await getCoordinatesForAddress(address);
	} catch (error) {
		return next(error);
	}

	const eventId = req.params.eid;
	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		const error = new HttpError(
			'Update event process failed, please try again later.',
			500
		);
		return next(error);
	}

	if (!event) {
		return next(
			new HttpError('Update event failed finding the event.'),
			404
		);
	}

	// we added userData in check-auth after verifying jwt
	if (event.clubId.toString() !== req.userData.clubId) {
		const error = new HttpError('Unauthorized operation!!!', 401);
		return next(error);
	}

	// check whether image or courseMap been changed or not
	let imagePath, courseMapPath;
	if (req.files.image) {
		imagePath = req.files.image[0].path;
		if (event.image) {
			fs.unlink(event.image, err => {
				console.log(err);
			});
		}
	}
	if (req.files.courseMap) {
		courseMapPath = req.files.courseMap[0].path;
		if (event.courseMap) {
			fs.unlink(event.courseMap, err => {
				console.log(err);
			});
		}
	}

	// update event info
	event.name = name;
	event.type = type;
	event.startDate = moment(startDate);
	event.endDate = moment(endDate);
	event.regStartDate = moment(regStartDate);
	event.regEndDate = moment(regEndDate);
	if (imagePath) {
		event.image = imagePath;
	}
	event.venue = venue;
	event.address = address;
	event.description = description;
	event.instruction = instruction;
	event.coordinate = coordinate;
	event.published = false;
	if (courseMapPath) {
		event.courseMap = courseMapPath;
	}

	try {
		await event.save();
		res
			.status(200)
			.json({ event: event.toObject({ getters: true }) });
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Updating event failed. Please try again later.',
			500
		);
		return next(error);
	}
};

// DELETE /api/events/:eid
const deleteEvent = async (req, res, next) => {
	const eventId = req.params.eid;

	let event;
	try {
		// populate allows us to access a document in another collection
		// and to work with data in that existing document
		event = await Event.findById(eventId).populate('clubId');
	} catch (err) {
		const error = new HttpError(
			'Delete event process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!event) {
		const error = new HttpError(
			'Delete event failed finding the event.',
			404
		);
		return next(error);
	}

	// because we populate clubId already so we can now use the getter id
	// In updateEvent, there is no populate so we had to use clubId.toString()
	if (event.clubId.id !== req.userData.clubId) {
		const error = new HttpError('Unauthorized operation!!!', 401);
		return next(error);
	}

	if (event.published) {
		const error = new HttpError(
			'Unauthorized operation. This event has been published!!!',
			401
		);
		return next(error);
	}

	try {
		// we need to use populate('clubId') above to be able to modify data in
		// event.clubId.events
		const session = await mongoose.startSession();
		session.startTransaction();
		await event.remove({ session: session });
		/**
		 * pull the event out from the clubId events
		 **/
		event.clubId.events.pull(event);
		await event.clubId.save({ session: session });

		// only both tasks succeed, we commit the transaction
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Failed to delete the event.  Please try it later.',
			500
		);
		return next(error);
	}

	if (event.image) {
		fs.unlink(event.image, err => {
			console.log('unlink event image error = ', err);
		});
	}
	if (event.courseMap) {
		fs.unlink(event.courseMap, err => {
			console.log('unlink course map error = ', err);
		});
	}
	res.status(200).json({ message: `Event: ${event.name} deleted` });
};

// /api/events/form/:eid/:uid
const getEventEntryFormAnswer = async (req, res, next) => {
	// Validate eventId belonging to the found club. If not, sends back an error
	const eventId = req.params.eid;

	const userId = req.params.uid;
	let event;
	try {
		event = await Event.findById(eventId).populate('entries');
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'Get EventForm for club process failed. Please try again later.',
			500
		);
		return next(error);
	}

	// this error is for DB not be able to find the event with provided ID
	if (!event) {
		const error = new HttpError(
			'Could not complete retrieving event form with provided event id',
			404
		);
		return next(error);
	}

	let entryFormData = event.entryFormData;
	if (!entryFormData || entryFormData.length === 0) {
		const error = new HttpError(
			'Could not find the entry form. Please report to club.',
			404
		);
		return next(error);
	}

	// look for user's entries
	let answer = null;
	for (let i = 0; i < event.entries.length; ++i) {
		if (event.entries[i].userId.toString() === userId) {
			answer = event.entries[i].answer;
		}
	}

	res
		.status(200)
		.json({ entryFormData: entryFormData, entryFormAnswer: answer });
};

// export a pointer of the function
exports.getAllEvents = getAllEvents;
exports.getEventById = getEventById;
exports.getEventsByClubId = getEventsByClubId;
exports.getEventsByDate = getEventsByDate;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.getEventEntryFormAnswer = getEventEntryFormAnswer;
