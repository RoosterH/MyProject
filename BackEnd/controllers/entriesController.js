const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

const Event = require('../models/event');
const Entry = require('../models/entry');
const User = require('../models/user');

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

const createEntry = async (req, res, next) => {
	console.log('in createEntry');
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`Register event process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}

	// we need to get answer from body
	const {
		carId,
		carNumber,
		raceClass,
		answer,
		disclaimer
	} = req.body;
	if (!answer || answer.length === 0) {
		const error = new HttpError(
			'Entry submission failed with empty answer.',
			400
		);
		return next(error);
	}

	// Validate userId exists. If not, sends back an error
	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'Entry form submission process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Entry form submission faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}
	// Validate event exists, if not send back an error.
	let event;
	const eventId = req.params.eid;
	event = await Event.findById(eventId);
	if (!event) {
		const error = new HttpError(
			'Entry submission process internal failure',
			404
		);
		return next(error);
	}

	// check if user has entered the event
	let entry = await Entry.findOne({
		eventId: eventId,
		userId: userId
	});

	if (entry) {
		// if entry found, we only need to override the previous values
		entry.carNumber = carNumber;
		entry.raceClass = raceClass;
		entry.answer = [];
		answer.map(data => entry.answer.push(data));

		try {
			await entry.save();
		} catch (err) {
			const error = new HttpError(
				'Event registration connecting with DB failed. Please try again later.',
				500
			);
			return next(error);
		}
	} else {
		// entry not found, create a new entry and store the entryId to event and user
		entry = new Entry({
			userId,
			userLastName: user.lastname,
			userFirstName: user.firstname,
			clubId: event.clubId,
			clubName: event.clubName,
			eventId,
			eventName: event.name,
			answer,
			carId,
			carNumber,
			raceClass,
			disclaimer,
			time: moment(),
			published: true
		});
		console.log('entry = ', entry);
		try {
			const session = await mongoose.startSession();
			session.startTransaction();
			await entry.save({ session: session });

			// store newEntry to event.entries array
			event.entries.push(entry);
			await event.save({ session: session });

			// store newEntry to user.envents array
			user.entries.push(entry);
			await user.save({ session: session });

			// only all tasks succeed, we commit the transaction
			await session.commitTransaction();
		} catch (err) {
			console.log('err = ', err);
			const error = new HttpError(
				'Event registration process failed due to technical issue. Please try again later.',
				500
			);
			return next(error);
		}
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

exports.createEntry = createEntry;
