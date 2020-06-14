const { v4: uuidv4 } = require('uuid');

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');

// for Google Geocode API that converts address to coordinates
const getCoordinatesForAddress = require('../util/location');
const Event = require('../models/event');

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
		events = await Event.find({}).sort({ startDate: 1 });
	} catch (err) {
		const error = new HttpError(
			'Fetching events failed, please try again later',
			500
		);
		return next(error);
	}

	if (!events || events.length === 0) {
		const error = new HttpError('Failed to fetch all events.', 404);

		return next(error);
	}

	res.json({
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
			'Something went wrong.  Could not connect to DB to retrieve the event.',
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
	res.json({ event: event.toObject({ getters: true }) }); // { event } => { event: event }
};

// GET /api/events/clubs/:cid
const getEventsByClubId = async (req, res, next) => {
	const cId = req.params.cid;

	let events;
	try {
		events = await Event.find({ clubId: cId }).sort({ startDate: 1 });
	} catch (err) {
		const error = new HttpError(
			'Fetching events failed, please try again later',
			500
		);
		return next(error);
	}

	if (!events || events.length === 0) {
		const error = new HttpError(
			'Could not find any event with provided ID',
			404
		);

		return next(error);
	}

	res.json({
		events: events.map(event => event.toObject({ getters: true }))
	});
};

const getEventByDate = async (req, res, next) => {
	let Dec31 = '12, 31';
	let today = moment().format('YYYY, MM, DD');
	let yearEnd = moment().format(`YYYY, ${Dec31}`);
	let events;
	try {
		events = await Event.find({
			startDate: { $gte: today },
			endDate: { $lte: yearEnd }
		}).sort({ startDate: 1 });
	} catch (err) {
		const error = new HttpError(
			'Fetching events failed, please try again later',
			500
		);
		return next(error);
	}

	if (!events || events.length === 0) {
		const error = new HttpError(
			'Could not find any event with provided ID',
			404
		);

		return next(error);
	}

	res.json({
		events: events.map(event => event.toObject({ getters: true }))
	});
};

// POST /api/events/
const createEvent = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		return next(
			new HttpError(
				`Invalid input, please check your data: ${result.array()}`,
				422
			)
		);
	}

	// we need to get the data from body
	const {
		name,
		startDate,
		endDate,
		image,
		venue,
		address,
		description,
		courseMap,
		clubId
	} = req.body;

	// for async error handling, we need to use try catch if the function returns error
	let coordinate;
	try {
		coordinate = await getCoordinatesForAddress(address);
	} catch (error) {
		return next(error);
	}

	const newEvent = new Event({
		name,
		startDate,
		endDate,
		venue,
		address,
		coordinate,
		description,
		clubId,
		image:
			'https://media.gettyimages.com/photos/san-jose-twilight-picture-id1058214402?s=2048x2048',
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	});

	try {
		// save to MongoDB, asynch call, since it may take take to access DB
		await newEvent.save();
	} catch (err) {
		const error = new HttpError(
			'Event creation failed, please try it later.',
			500
		);
		return next(error);
	}

	res.status(201).json({ event: newEvent });
};

// PATCH /api/events/:eid
const updateEvent = async (req, res, next) => {
	// validate request
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Invalid input, please check your data: ${result.array()}`,
			422
		);

		return next(error);
	}

	// we allow all the data to be updated except id and clubId
	const {
		name,
		startDate,
		endDate,
		eventImage,
		venue,
		address,
		description,
		courseMap
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
			'Something went wrong while updating event, the event cannot be found in DB',
			500
		);
		return next(error);
	}

	// update event info
	event.name = name;
	event.startDate = startDate;
	event.endDate = endDate;
	event.eventImage = eventImage;
	event.venue = venue;
	event.address = address;
	event.description = description;
	event.coordinate = coordinate;
	event.courseMap = courseMap;

	try {
		await event.save();
	} catch (err) {
		const error = new HttpError(
			'Something went wrong while updating event. Save to DB failed please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({ event: event.toObject({ getters: true }) });
};

// DELETE /api/events/:eid
const deleteEvent = async (req, res, next) => {
	const eventId = req.params.eid;

	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		const error = new HttpError(
			'Failed to delete the event while getting the event info, please try it later.',
			500
		);
		return next(error);
	}

	try {
		await event.remove();
	} catch (err) {
		const error = new HttpError(
			'Failed to delete the event.  Please try it later.',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: `Event: ${event.name} deleted` });
};

// export a pointer of the function
exports.getAllEvents = getAllEvents;
exports.getEventById = getEventById;
exports.getEventsByClubId = getEventsByClubId;
exports.getEventsByDate = getEventByDate;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
