const { v4: uuidv4 } = require('uuid');

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const getCoordinatesForAddress = require('../util/location');

let DUMMY_EVENTS = [
	{
		id: 'e1',
		clubId: 'c1',
		name: 'SCCA - San Francisco Region - Solo 1',
		title: 'SCCA - San Francisco Region - Solo 1',
		eventImage:
			'https://media.gettyimages.com/photos/san-jose-twilight-picture-id1058214402?s=2048x2048',
		startDate: '06/25/2020',
		endDate: '06/26/2020',
		venue: 'NASA Crows Landing Airport and Test Facility',
		address: 'Crows Landing, CA',
		coordinate: '37.4015069, -121.1059222',
		description:
			"SCCA - San Francisco Region - Solo1. Reminder: You have to work! We keep a running list of those of you have skipped out on work. Check it out HERE and make sure you aren't on it.",
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	},
	{
		id: 'e2',
		clubId: 'c1',
		name: 'SCCA - San Francisco Region - Solo 2',
		title: 'SCCA - San Francisco Region - Solo 2',
		eventImage:
			'https://media.gettyimages.com/photos/san-jose-twilight-picture-id1058214402?s=2048x2048',
		startDate: '07/25/2020',
		endDate: '07/26/2020',
		venue: 'NASA Crows Landing Airport and Test FacilityCrows Landing',
		address: 'Crows Landing, CA',
		coordinate: '37.4015069, -121.1059222',
		description: 'SCCA - San Francisco Region - Solo2',
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	},
	{
		id: 'e3',
		clubId: 'c2',
		name: 'SCCA - San Francisco Region - Solo 3',
		title: 'SCCA - San Francisco Region - Solo 3',
		startDate: '08/25/2020',
		endDate: '08/26/2020',
		eventImage: `${process.env.PUBLIC_URL}/event.jpg`, // public folder
		venue: 'NASA Crows Landing Airport and Test FacilityCrows Landing',
		address: 'Crows Landing',
		description: 'SCCA - San Francisco Region - Solo3',
		coordinate: '37.4015069, -121.1059222',
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	}
];

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

// GET /api/events/:eid
const getEventById = (req, res, next) => {
	// req.params is getting the eid from url, such as /api/events/:id
	const eventId = req.params.eid;
	const event = DUMMY_EVENTS.find(event => {
		return event.id === eventId;
	});

	if (!event) {
		throw new HttpError('Could not find the event with the provided id', 404);
	}

	res.json({ event }); // { event } => { event: event }
};

// GET /api/events/clubs/:cid
const getEventsByClubId = (req, res, next) => {
	const clubId = req.params.cid;
	const events = DUMMY_EVENTS.filter(event => {
		return event.clubId === clubId;
	});

	if (events.length === 0) {
		return next(
			new HttpError('Could not find any event with provided ID'),
			404
		);
	}

	res.json({ events });
};

// POST /api/events/
const createEvent = async (req, res, next) => {
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
		title,
		startDate,
		endDate,
		eventImage,
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
		console.log(error);
		return next(error);
	}

	const newEvent = {
		id: uuidv4(),
		name,
		title,
		startDate,
		endDate,
		eventImage,
		venue,
		address,
		description,
		coordinate,
		courseMap,
		clubId
	};

	if (!newEvent) {
		return next(
			new HttpError(
				'Server was not able to create a new event. Please try it again later.'
			),
			500
		);
	}

	DUMMY_EVENTS.push(newEvent); // use unshift(newEvent) if array is empty

	res.status(201).json({ event: newEvent });
};

// PATCH /api/events/:eid
const updateEvent = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		throw new HttpError(
			`Invalid input, please check your data: ${result.array()}`,
			422
		);
	}

	// we allow all the data to be updated except id and clubId
	const {
		name,
		title,
		startDate,
		endDate,
		eventImage,
		venue,
		address,
		description,
		coordinate,
		courseMap
	} = req.body;

	const eventId = req.params.eid;

	const eventExist = DUMMY_EVENTS.find(e => e.id === eventId);
	if (!eventExist) {
		return next(
			new HttpError('Could not find any event with provided ID'),
			404
		);
	}

	/** 
	 update in immutable way
	 we will create a new object and copy all key-value pairs of the old object as key-value
	 pairs into the new object 
	 To note: we cannot write it as e => {e.id === eventId}
	**/
	const updatedEvent = { ...DUMMY_EVENTS.find(e => e.id === eventId) };
	console.log('updatedEvent = ', updatedEvent);

	// update event info
	updatedEvent.name = name;
	updatedEvent.title = title;
	updatedEvent.startDate = startDate;
	updatedEvent.endDate = endDate;
	updatedEvent.eventImage = eventImage;
	updatedEvent.venue = venue;
	updatedEvent.address = address;
	updatedEvent.description = description;
	updatedEvent.coordinate = coordinate;
	updatedEvent.courseMap = courseMap;

	const eventIndex = DUMMY_EVENTS.findIndex(e => e.id === eventId);
	// Replace the old event with the new one.
	// The reason we want to do that instead of using the old object and update its property one by one
	// is to avoid sync up issue that only part of data been updated
	DUMMY_EVENTS[eventIndex] = updatedEvent;

	res.status(200).json({ event: updatedEvent });
};

// DELETE /api/events/:eid
const deleteEvent = (req, res, next) => {
	const eventId = req.params.eid;
	event = DUMMY_EVENTS.find(e => e.id === eventId);

	if (!event) {
		return next(
			new HttpError('Could not find the event with provided ID.'),
			404
		);
	}

	DUMMY_EVENTS = DUMMY_EVENTS.filter(e => e.id !== eventId);

	res.status(200).json({ message: `Deleted event: ${event.name}` });
};

// export a pointer of the function
exports.getEventById = getEventById;
exports.getEventsByClubId = getEventsByClubId;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
