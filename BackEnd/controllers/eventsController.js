const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

// for Google Geocode API that converts address to coordinates
const getCoordinatesForAddress = require('../util/location');
const Entry = require('../models/entry');
const EntryReport = require('../models/entryReport');
const Event = require('../models/event');
const Club = require('../models/club');

// const mongooseUniqueValidator = require('mongoose-unique-validator');
const fileUpload = require('../middleware/file-upload');
const { min } = require('moment');
const entry = require('../models/entry');

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
		events = await Event.find(
			{},
			'-entryFormData -entries -waitlist -totalCap -totalEntries -numGroups -capDistribution -groupEntries'
		).sort({
			startDate: 1,
			endDate: 1
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
		event = await Event.findById(
			eventId,
			'-entryFormData -entries -waitlist -totalCap -totalEntries -numGroups -capDistribution -groupEntries'
		);
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		console.log('err = ', err);
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
	res.status(200).json({
		event: event.toObject({
			getters: true,
			transform: (doc, ret, opt) => {
				delete ret['entryFormData'];
				delete ret['entries'];
				delete ret['waitlist'];
				delete ret['totalCap'];
				delete ret['totalEntries'];
				delete ret['numGroups'];
				delete ret['capDistribution'];
				delete ret['groupEntries'];
				return ret;
			}
		})
	}); // { event } => { event: event }
};

// GET /api/ownerClubEvent/:eid
const getOwnerClubEvent = async (req, res, next) => {
	// req.params is getting the eid from url, such as /api/events/:id
	const eventId = req.params.eid;

	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		console.log('err = ', err);
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
			options: {
				sort: { startDate: -1, endDate: -1 },
				published: true
			}
		});
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Get events by club ID process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError('Could not find the club.', 404);
		return next(error);
	}

	if (!club.events || club.events.length === 0) {
		const error = new HttpError('Could not find any event.', 404);
		return next(error);
	}

	res.status(200).json({
		events: club.events.map(event =>
			event.toObject({
				getters: true,
				transform: (doc, ret, opt) => {
					delete ret['coordinate'];
					delete ret['description'];
					delete ret['instruction'];
					delete ret['courseMap'];
					delete ret['clubImage'];
					delete ret['entryFormData'];
					delete ret['entries'];
					delete ret['waitlist'];
					delete ret['full'];
					delete ret['totalCap'];
					delete ret['totalEntries'];
					delete ret['numGroups'];
					delete ret['capDistribution'];
					delete ret['groupEntries'];
					return ret;
				}
			})
		)
	});
};

const getEventsByOwnerClubId = async (req, res, next) => {
	const cId = req.params.cid;

	let club;
	try {
		club = await Club.findById(cId).populate({
			path: 'events',
			options: {
				sort: { startDate: -1, endDate: -1 }
			}
		});
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Get events by owner club ID process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Could not find the club owner.',
			404
		);
		return next(error);
	}

	if (!club.events || club.events.length === 0) {
		const error = new HttpError('Could not find any event.', 404);
		return next(error);
	}

	res.status(200).json({
		events: club.events.map(event =>
			event.toObject({
				getters: true,
				transform: (doc, ret, opt) => {
					delete ret['entryFormData'];
					delete ret['entries'];
					delete ret['waitlist'];
					delete ret['full'];
					delete ret['totalCap'];
					delete ret['totalEntries'];
					delete ret['numGroups'];
					delete ret['capDistribution'];
					delete ret['groupEntries'];
					return ret;
				}
			})
		)
	});
};

// GET /api/ownerClubPublishedEvent/:eid
const getPublishedEventsByOwnerClubId = async (req, res, next) => {
	const cId = req.params.cid;

	let club;
	try {
		club = await Club.findById(cId).populate({
			path: 'events',
			match: { published: true },
			options: {
				sort: { startDate: -1, endDate: -1 }
			}
		});
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Get events by owner club ID process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Could not find the club owner.',
			404
		);
		return next(error);
	}

	if (!club.events || club.events.length === 0) {
		const error = new HttpError('Could not find any event.', 404);
		return next(error);
	}

	res.status(200).json({
		events: club.events.map(event =>
			event.toObject({
				getters: true,
				transform: (doc, ret, opt) => {
					delete ret['entryFormData'];
					delete ret['entries'];
					delete ret['waitlist'];
					delete ret['totalCap'];
					delete ret['full'];
					delete ret['totalEntries'];
					delete ret['numGroups'];
					delete ret['capDistribution'];
					delete ret['groupEntries'];
					return ret;
				}
			})
		)
	});
};

// GET /api/events/entryreport/:eid - this is for Club
const getEntryReport = async (req, res, next) => {
	// req.params is getting the eid from url, such as /api/events/:id
	const eventId = req.params.eid;
	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		console.log('err = ', err);
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'Cannot find the event for the entry list. Please try again later.',
			500
		);
		return next(error);
	}

	// this error is for DB not be able to find the event with provided ID
	if (!event) {
		const error = new HttpError(
			'Could not find the event. Please try later.',
			404
		);
		return next(error);
	}

	// get entires
	let entries = event.entries;
	// if there is no entry, should not have a waitlist, either.
	if (entries.length === 0) {
		res.status(404).json({
			entryData: [],
			waitlist: []
		});
	}

	let days = entries.length;
	let mutipleDayEntryData = [];
	for (let i = 0; i < days; ++i) {
		let entryData = [];
		let eList = entries[i];
		for (let j = 0; j < eList.length; ++j) {
			let entry = await Entry.findById(eList[j]).populate('carId');
			// add car to entry
			let car =
				entry.carId.year +
				' ' +
				entry.carId.make +
				' ' +
				entry.carId.model;
			if (entry.carId.trimLevel != undefined) {
				car += ' ' + entry.carId.trimLevel;
			}
			// use {strict:false} to add undefined attribute in schema to existing json obj
			entry.set('car', car, { strict: false });
			entryData.push(entry);
		}
		mutipleDayEntryData.push(entryData);
	}

	// get waitlist
	let waitlist = event.waitlist;
	let mutipleDayWaitlistData = [];
	for (let i = 0; i < days; ++i) {
		let waitlistData = [];
		let wList = waitlist[i];
		for (let j = 0; j < wList.length; ++j) {
			let entry = await Entry.findById(wList[j]).populate('carId');
			// add car to entry
			let car =
				entry.carId.year +
				' ' +
				entry.carId.make +
				' ' +
				entry.carId.model;
			if (entry.carId.trimLevel != undefined) {
				car += ' ' + entry.carId.trimLevel;
			}
			// use {strict:false} to add undefined attribute in schema to existing json obj
			entry.set('car', car, { strict: false });
			waitlistData.push(entry);
		}
		mutipleDayWaitlistData.push(waitlistData);
	}

	res.status(200).json({
		eventName: event.name,
		entryData: mutipleDayEntryData.map(entryData =>
			entryData.map(data =>
				data.toObject({
					getters: true,
					transform: (doc, ret, opt) => {
						delete ret['userId'];
						// delete ret['userName'];
						delete ret['clubId'];
						delete ret['clubName'];
						delete ret['eventId'];
						delete ret['eventName'];
						delete ret['carId'];
						delete ret['disclaimer'];
						delete ret['time'];
						delete ret['published'];
						return ret;
					}
				})
			)
		),
		waitlistData: mutipleDayWaitlistData.map(waitlistData =>
			waitlistData.map(data =>
				data.toObject({
					getters: true,
					transform: (doc, ret, opt) => {
						delete ret['userId'];
						// delete ret['userName'];
						delete ret['clubId'];
						delete ret['clubName'];
						delete ret['eventId'];
						delete ret['eventName'];
						delete ret['carId'];
						delete ret['disclaimer'];
						delete ret['time'];
						delete ret['published'];
						return ret;
					}
				})
			)
		),
		raceClassOptions: event.raceClassOptions,
		runGroupOptions: event.runGroupOptions,
		workerAssignments: event.workerAssignments
	});
};

// POST /api/events/date/
const getEventsByDate = async (req, res, next) => {
	const { eventType, startDate, endDate, distance, zip } = req.body;
	let events;
	// index {type: 1, startDate: 1}, covered query {type, startDate} is indexed
	try {
		events = await Event.find(
			{
				type: eventType,
				startDate: { $gte: startDate, $lte: endDate },
				published: true
			},
			'-entryFormData -entries -waitlist -full -totalCap -totalEntries -numGroups -capDistribution -groupEntries -published'
		).sort({
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
	let clubId = req.userData;
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
			401
		);
		return next(error);
	}

	let coordinate;
	try {
		coordinate = await getCoordinatesForAddress(address);
	} catch (error) {
		return next(error);
	}

	const newEvent = new Event({
		name,
		type,
		multiDayEvent: false,
		startDate,
		endDate,
		regStartDate,
		regEndDate: moment(regEndDate)
			.add(23, 'h')
			.add(59, 'm')
			.add(59, 's')
			.format(),
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
		image: 'UNDEFINED',
		published: false,
		entryFormData: [],

		// ready to remove
		entries: [[]],
		waitlist: [[]],
		totalEntries: [],

		numGroups: 0,
		capDistribution: false,
		raceClassOptions: [],
		runGroupOptions: [],
		workerAssignments: []
	});

	const newEventEntryReport = new EntryReport({
		entries: [[]],
		waitlist: [[]],
		runGroupNumEntries: [[]],
		full: [],
		totalEntries: []
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
		// save event first, here we need to use the newEvent Id so no async await
		await newEvent.save({ session: session });

		// ! for very first time that DB collection not yet has newentryreports, we need to move
		// ! this section outside of transcation because a bug from Mongoose that does not create
		// ! a new collection for transaction tasks
		// create entryReport for the event
		newEventEntryReport.eventId = newEvent.id;
		await newEventEntryReport.save({ session: session });

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

	// ! for very first time that DB collection not yet has newentryreports, we need to enable this section
	// ! the best way is to create collection from Atlas
	// try {
	// 	// create entryReport for the event
	// 	newEventEntryReport.eventId = newEvent.id;
	// 	await newEventEntryReport.save();
	// } catch (err) {
	// 	console.log('err = ', err);
	// 	const error = new HttpError(
	// 		'Create event entryReport DB failed. Please try again later.',
	// 		500
	// 	);
	// 	return next(error);
	// }

	console.log('newEventEntryReport = ', newEventEntryReport);
	res
		.status(201)
		.json({ event: newEvent.toObject({ getters: true }) });
};

// PATCH /api/events/photos/:eid
const updateEventPhotos = async (req, res, next) => {
	const eventId = req.params.eid;

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
				`Update event photo process failed. Please check your data: ${result.array()}`,
				422
			)
		);
	}

	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Update event photos process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}
	if (!club) {
		const error = new HttpError(
			'Update event photos failure. Unauthorized request.',
			404
		);
		return next(error);
	}

	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		const error = new HttpError(
			'Update event photos process failed, please try again later.',
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
	if (event.clubId.toString() !== req.userData) {
		const error = new HttpError('Unauthorized operation!!!', 401);
		return next(error);
	}

	// check whether image or courseMap been changed or not
	let imagePath, courseMapPath;
	if (req.files.image) {
		imagePath = req.files.image[0].path;
		// default value is 'UNDEFINED' set in createEvent
		if (event.image !== 'UNDEFINED') {
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

	if (imagePath) {
		event.image = imagePath;
	}
	if (courseMapPath) {
		event.courseMap = courseMapPath;
	}

	// set published to false. User needs to re-publish the event
	event.published = false;
	try {
		await event.save();
		res.status(200).json({
			event: event.toObject({
				getters: true
			})
		});
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Updating event failed. Please try again later.',
			500
		);
		return next(error);
	}
};

// This is called on both new and update EventRegistration
// PATCH /api/events/registration/:eid
const updateEventRegistration = async (req, res, next) => {
	const eventId = req.params.eid;
	console.log('733 eventId = ', eventId);

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
				`Update event registration process failed. Please check your data: ${result.array()}`,
				422
			)
		);
	}

	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Update event registration process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}
	if (!club) {
		const error = new HttpError(
			'Update event registration failure. Unauthorized request.',
			404
		);
		return next(error);
	}

	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		const error = new HttpError(
			'Update event registration process failed, please try again later.',
			500
		);
		return next(error);
	}
	if (!event) {
		return next(
			new HttpError(
				'Update event registration failed finding the event.'
			),
			404
		);
	}

	console.log('789 event = ', event);
	// we added userData in check-auth after verifying jwt
	if (event.clubId.toString() !== req.userData) {
		const error = new HttpError('Unauthorized operation!!!', 401);
		return next(error);
	}

	const {
		totalCap,
		numGroups,
		capDistribution,
		multiDayEvent
	} = req.body;
	event.totalCap = totalCap;
	if (totalCap !== undefined || totalCap !== 0) {
		// initialize to avoid updating keeps adding elements to array
		event.full = [];
		event.full.push(false);
	}

	event.numGroups = numGroups;
	event.capDistribution = capDistribution;
	// set published to false to force re-publish
	event.published = false;
	event.multiDayEvent = multiDayEvent;

	// if capDistribution is true, we will create numGroups groups.
	// Each group can only have totalCap / numGroups participants
	// add day1 runGroupNumEntries
	// if (capDistribution) {
	// re-init array before push
	event.runGroupNumEntries = [];
	//! this does not work as MongoDB will store userId in an array
	// for (let i = 0; i < numGroups; ++i) {
	// 	event.runGroupEntries.push(undefined);
	// }
	// run group is named starting from 0 so there is no problem to match with index
	let group = [];
	for (let i = 0; i < numGroups; ++i) {
		group.push(0);
	}
	event.runGroupNumEntries.push(group);
	// }

	// add day2, day3 ... runGroupNumEntries
	if (multiDayEvent) {
		// create array elements for each day
		let startDate = moment(event.startDate);
		let endDate = moment(event.endDate);
		// dayDiff is the difference for example, 11/1 - 10/31 = 1
		let dayDiff = endDate.diff(startDate, 'days');
		// originally each field already has one element so we only need to add numDays elements to it
		for (let i = 0; i < dayDiff; ++i) {
			let entry = [];
			event.entries.push(entry);
			let wlist = [];
			event.waitlist.push(wlist);
			event.full.push(false);
			if (capDistribution) {
				//! this does not work as MongoDB will store userId in an array
				// for (let i = 0; i < numGroups; ++i) {
				// 	event.runGroupEntries.push(undefined);
				// }
				// run group is named starting from 0 so there is no problem to match with index
				let group = [];
				for (let i = 0; i < numGroups; ++i) {
					group.push(0);
				}
				event.runGroupNumEntries.push(group);
			}
		}
	}

	try {
		await event.save();
		res.status(200).json({
			event: event.toObject({
				getters: true
			})
		});
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Updating event failed. Please try again later.',
			500
		);
		return next(error);
	}
};

// PATCH /api/events/:eid
const updateEvent = async (req, res, next) => {
	const eventId = req.params.eid;

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
	let clubId = req.userData;
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

	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		console.log('err = ', err);
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
	if (event.clubId.toString() !== req.userData) {
		const error = new HttpError('Unauthorized operation!!!', 401);
		return next(error);
	}

	// update event info
	event.name = name;
	event.type = type;
	event.startDate = moment(startDate);
	event.endDate = moment(endDate);
	event.regStartDate = moment(regStartDate);
	event.regEndDate = moment(regEndDate);
	event.venue = venue;
	event.address = address;
	event.description = description;
	event.instruction = instruction;
	event.coordinate = coordinate;
	event.published = false;

	try {
		await event.save();
		res.status(200).json({
			event: event.toObject({
				getters: true
			})
		});
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
	if (event.clubId.id !== req.userData) {
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

	if (event.image !== 'UNDEFINED' && event.image) {
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

// this includes create and update event entry form
const createEventForm = async (req, res, next) => {
	// we need to get entryFormData from body
	const { entryFormData, saveTemplate } = req.body;

	// Validate clubId exists. If not, sends back an error
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Create event form process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Create event form process faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	// Validate eventId belonging to the found club. If not, sends back an error
	let event;
	const eventId = req.params.eid;
	console.log('1096 eventId = ', eventId);
	// if club does not own the eventId, return error
	if (!club.events.includes(eventId)) {
		// Not found in clubs events
		const error = new HttpError(
			'Create event form process faied with unauthorized request.  Your club does not own this event.',
			404
		);
		return next(error);
	}

	event = await Event.findById(eventId);
	if (!event) {
		const error = new HttpError(
			'Create event form process internal failure',
			404
		);
		return next(error);
	}

	// overwrite the old formData, reason for it because to figure out what to/not to replace
	// is tidious and error prone, we are not going to have a form with a lot of data so hopefully
	// it won't impact performace by much.
	if (entryFormData && entryFormData.length > 0) {
		event.entryFormData = [];
		// reset event.runGroupOptions
		event.runGroupOptions = [];
		// reset totalEntries
		event.totalEntries = [];
		// reset workerAssignments
		event.workerAssignments = [];

		entryFormData.map(data => {
			event.entryFormData.push(data);
			if (data.element === 'MultipleRadioButtonGroup') {
				data.options.map(option => {
					// loop through opt.options
					let [fieldName, choices] = formAnalysis(option);
					console.log('1131 fieldName = ', fieldName);
					console.log('choices = ', choices);
					if (fieldName.startsWith('RunGroup')) {
						console.log('inRunGroup');
						event.runGroupOptions.push(choices);
						console.log(
							'event.runGroupOptions = ',
							event.runGroupOptions
						);
						// Also make totalEntries same number of elements
						event.totalEntries.push(0);
					} else if (fieldName.startsWith('WorkerAssignments')) {
						event.workerAssignments.push(choices);
					}
				});
			} else {
				// form analysis here
				let [fieldName, choices] = formAnalysis(data);
				if (fieldName === 'RunGroupSingle') {
					console.log('RunGroupSingle');
					event.runGroupOptions = [];
					// event.runGroupOptions = choices;
					// runGroupOptions is [[]]
					let optionChoices = [];
					optionChoices.push(choices);
					event.runGroupOptions.push(choices);
					// Also make totalEntries[0] = 0
					event.totalEntries.push(0);
				} else if (fieldName === 'RaceClass') {
					event.raceClassOptions = choices;
				} else if (fieldName === 'WorkerAssignment') {
					event.workerAssignments = choices;
				}
			}
		});
		// whenever entry form gets changed, always set published to false
		event.published = false;

		// save to template if flag is true
		if (saveTemplate) {
			club.entryFormTemplate = [];
			entryFormData.map(data => club.entryFormTemplate.push(data));
		}
	}

	try {
		if (saveTemplate) {
			await club.save();
		}
		console.log('1183 event = ', event);
		await event.save();
		res
			.status(200)
			.json({ event: event.toObject({ getters: true }) });
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Create event form connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
};

// Form analysis
const formAnalysis = data => {
	if (!data.field_name) {
		return [null, null];
	}

	// Form field name is defined in frontend FormBuilder.js
	// "RunGroupSingle-" Race Group prefix for Single Choice Radiobutton
	// field_name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	let parseName = data.field_name.split('-');
	console.log('parseName = ', parseName);
	let fieldPrefix = parseName[0];
	console.log('fieldPrefix = ', fieldPrefix);
	let choices = [];

	// get the options
	// format of the
	// options: Array
	//    0: Object
	//       value: "0"
	//       text: "Morning Session 1"
	//       key: "raceRadioOption_0"
	// we will use {value: text} to compose our map
	// ex: {0: "Morning Session 1"}
	let options = data.options;
	for (var i = 0; i < options.length; ++i) {
		let option = options[i];
		// build up option map
		let value = option['text'];
		choices.push(value);
	}
	return [fieldPrefix, choices];
};

const getEventForm = async (req, res, next) => {
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		const error = new HttpError(
			'Create event form process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!club) {
		const error = new HttpError(
			'Create event form process faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	// Validate eventId belonging to the found club. If not, sends back an error
	let event;
	const eventId = req.params.eid;
	// if club does not own the eventId, return error
	if (!club.events.includes(eventId)) {
		// Not found in clubs events
		const error = new HttpError(
			'Create event form process faied with unauthorized request.  Your club does not own this event.',
			404
		);
		return next(error);
	}

	try {
		event = await Event.findById(eventId);
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

	// 1. get eventFormData from DB,
	// 2. if not available check if club has entryFormTemplate
	// 3. return initialized db if nothing found
	let entryFormData = event.entryFormData;
	if (!entryFormData || entryFormData.length === 0) {
		if (club.entryFormTemplate.length > 0) {
			entryFormData = club.entryFormTemplate;
		} else {
			res.status(200).json({ entryFormData: '[]' });
		}
	}

	res.status(200).json(entryFormData);
};

// POST /api/events/entryreportforusers/:eid
const getEntryReportForUsers = async (req, res, next) => {
	// req.params is getting the eid from url, such as /api/events/:id
	const eventId = req.params.eid;
	let event;
	try {
		event = await Event.findById(eventId);
	} catch (err) {
		console.log('err = ', err);
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'Cannot find the event for the entry list. Please try again later.',
			500
		);
		return next(error);
	}

	// this error is for DB not be able to find the event with provided ID
	if (!event) {
		const error = new HttpError(
			'Could not find the event. Please try later.',
			404
		);
		return next(error);
	}

	// get entires
	let entries = event.entries;
	// if there is no entry, should not have a waitlist, either.
	if (entries.length === 0) {
		res.status(404).json({
			entryData: [],
			waitlist: []
		});
	}

	let days = entries.length;
	let mutipleDayEntryData = [];
	for (let i = 0; i < days; ++i) {
		let entryData = [];
		let eList = entries[i];
		for (let j = 0; j < eList.length; ++j) {
			// add car info to entry for frontend to display the information
			let entry = await Entry.findById(eList[j]).populate('carId');
			// add car to entry
			let car =
				entry.carId.year +
				' ' +
				entry.carId.make +
				' ' +
				entry.carId.model;
			if (entry.carId.trimLevel != undefined) {
				car += ' ' + entry.carId.trimLevel;
			}
			// use {strict:false} to add undefined attribute in schema to existing json obj
			entry.set('car', car, { strict: false });
			entryData.push(entry);
		}
		mutipleDayEntryData.push(entryData);
	}

	// get waitlist
	let waitlist = event.waitlist;
	let mutipleDayWaitlistData = [];
	for (let i = 0; i < days; ++i) {
		let waitlistData = [];
		let wList = waitlist[i];
		for (let j = 0; j < wList.length; ++j) {
			let entry = await Entry.findById(wList[j]).populate('carId');
			// add car to entry
			let car =
				entry.carId.year +
				' ' +
				entry.carId.make +
				' ' +
				entry.carId.model;
			if (entry.carId.trimLevel != undefined) {
				car += ' ' + entry.carId.trimLevel;
			}
			// use {strict:false} to add undefined attribute in schema to existing json obj
			entry.set('car', car, { strict: false });
			waitlistData.push(entry);
		}
		mutipleDayWaitlistData.push(waitlistData);
	}

	const { displayName } = req.body;
	// convert Mongoose object to a normal js object and get rid of _ of _id using getters: true
	// res.status(200).json({
	// 	entryData: entryData.map(data => data.toObject({ getters: true }))
	// }); // { event } => { event: event }

	if (displayName) {
		res.status(200).json({
			entryData: mutipleDayEntryData.map(entryData =>
				entryData.map(data =>
					data.toObject({
						getters: true,
						transform: (doc, ret, opt) => {
							delete ret['userId'];
							// delete ret['userName'];
							delete ret['clubId'];
							delete ret['clubName'];
							delete ret['eventId'];
							delete ret['eventName'];
							delete ret['carId'];
							delete ret['disclaimer'];
							delete ret['time'];
							delete ret['published'];
							delete ret['answer'];
							return ret;
						}
					})
				)
			),
			waitlistData: mutipleDayWaitlistData.map(waitlistData =>
				waitlistData.map(data =>
					data.toObject({
						getters: true,
						transform: (doc, ret, opt) => {
							delete ret['userId'];
							// delete ret['userName'];
							delete ret['clubId'];
							delete ret['clubName'];
							delete ret['eventId'];
							delete ret['eventName'];
							delete ret['carId'];
							delete ret['disclaimer'];
							delete ret['time'];
							delete ret['published'];
							delete ret['answer'];
							return ret;
						}
					})
				)
			),
			raceClassOptions: event.raceClassOptions,
			runGroupOptions: event.runGroupOptions,
			workerAssignments: event.workerAssignments
		});
	} else {
		//!displayName
		res.status(200).json({
			entryData: mutipleDayEntryData.map(entryData =>
				entryData.map(data =>
					data.toObject({
						getters: true,
						transform: (doc, ret, opt) => {
							delete ret['userId'];
							delete ret['userLastName'];
							delete ret['userFirstName'];
							delete ret['clubId'];
							delete ret['clubName'];
							delete ret['eventId'];
							delete ret['eventName'];
							delete ret['carId'];
							delete ret['answer'];
							delete ret['disclaimer'];
							delete ret['time'];
							delete ret['published'];
							delete ret['answer'];
							return ret;
						}
					})
				)
			),
			waitlistData: mutipleDayWaitlistData.map(waitlistData =>
				waitlistData.map(data =>
					data.toObject({
						getters: true,
						transform: (doc, ret, opt) => {
							delete ret['userId'];
							delete ret['userLastName'];
							delete ret['userFirstName'];
							delete ret['clubId'];
							delete ret['clubName'];
							delete ret['eventId'];
							delete ret['eventName'];
							delete ret['carId'];
							delete ret['answer'];
							delete ret['disclaimer'];
							delete ret['time'];
							delete ret['published'];
							delete ret['answer'];
							return ret;
						}
					})
				)
			),
			raceClassOptions: event.raceClassOptions,
			runGroupOptions: event.runGroupOptions,
			workerAssignments: event.workerAssignments
		});
	}
};

// export a pointer of the function
exports.getAllEvents = getAllEvents;
exports.getEventById = getEventById;
exports.getEventsByClubId = getEventsByClubId;
exports.getEventsByDate = getEventsByDate;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.updateEventPhotos = updateEventPhotos;
exports.updateEventRegistration = updateEventRegistration;
exports.getEventsByOwnerClubId = getEventsByOwnerClubId;
exports.getPublishedEventsByOwnerClubId = getPublishedEventsByOwnerClubId;
exports.getOwnerClubEvent = getOwnerClubEvent;
exports.getEntryReport = getEntryReport;
exports.getEventForm = getEventForm;
exports.createEventForm = createEventForm;
exports.getEntryReportForUsers = getEntryReportForUsers;
