const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

const Event = require('../models/event');
const Entry = require('../models/entry');
const User = require('../models/user');
const e = require('express');

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

	// check if event is already full
	// 2 conditions here:
	// 1. total entries >= event.topCap
	// 2. event.waitlist.length > 0, reason for this is if waitlist is open, we want to put all the future
	//    entries to waitlist. This is to avoid someone cancels the entry and there is a waitlist. Since we
	//    are not bumping entry from waitlist, we need to add all future entries to waitlist.
	let eventFull = false;

	if (
		event.totalEntries >= event.totalCap ||
		event.waitlist.length > 0
	) {
		console.log('event is full');
		eventFull = true;
	}

	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"

	// check if run group is full
	let groupFull = false;
	let runGroup = getRunGroup(answer);
	if (runGroup === -1) {
		const error = new HttpError(
			'Event registration answer invalid.',
			400
		);
		return next(error);
	}

	// check group cap to see if the run gorup is full
	if (event.capDistribution) {
		let capPerGroup = Math.floor(event.totalCap / event.numGroups);
		if (event.runGroupEntries[runGroup].length >= capPerGroup) {
			groupFull = true;
		}
	}

	// check if user has entered the event
	let entry = await Entry.findOne({
		eventId: eventId,
		userId: userId
	});

	if (entry) {
		console.log('in entry route');
		// check if the previous entry was on the group waitlist
		if (
			entry.waitlist &&
			entry.groupWaitlist &&
			!eventFull &&
			!groupFull
		) {
			// if current entry run group is good, remove the entry from waitlist
			let index = event.waitlist.indexOf(entry.id);
			// remove from waitlist
			event.waitlist.splice(index, 1);
			// put in entries
			event.entries.push(entry);
		} else if (!entry.waitlist && groupFull) {
			// if previous entry was good but now the new group is full.
			// We don't want to re-enter the event, instead giving an error message.
			// Because drop an entry to waitlist is very bad.
			const error = new HttpError(
				`${event.runGroupOptions[runGroup]} is full. You are still in the old run group.  If you cannot make this event, please cancel it.`,
				304
			);
			return next(error);
		}

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
		console.log('Not in entry route');
		// entry not found, create a new entry and store the entryId to event and user
		entry = new Entry({
			userId,
			userName: user.userName,
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
			published: true,
			waitlist: eventFull || groupFull,
			groupWaitlist: groupFull
		});
		try {
			const session = await mongoose.startSession();
			session.startTransaction();
			await entry.save({ session: session });

			// if event or group is full, put in wailist; otherwise put in entries
			if (eventFull || groupFull) {
				event.waitlist.push(entry);
			} else {
				event.entries.push(entry);
			}
			// update totalEntries number
			event.totalEntries++;

			// update run group entries
			console.log(
				'event.runGroupEntries[runGroup] 2 = ',
				event.runGroupEntries[runGroup]
			);
			console.log('userId = ', userId);
			event.runGroupEntries[runGroup].push(userId);

			console.log(
				'event.runGroupEntries[runGroup] 3 = ',
				event.runGroupEntries[runGroup]
			);

			await event.save({ session: session });

			console.log('final event= ', event);

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

	if (eventFull) {
		const error = new HttpError(
			'Event is full. You are on the waitlist. Event club will notify yuo if there is a spot available.',
			202
		);
		return next(error);
	}
	if (groupFull) {
		const error = new HttpError(
			`${event.runGroupOptions[runGroup]} is full. You are on the waitlist. You may try to register for another run group or wait for the club to notify yuo if a spot is available.`,
			202
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

const getRunGroup = answer => {
	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"

	for (let i = 0; i < answer.length; ++i) {
		let name = answer[i].name;
		console.log('name = ', name);
		let splitName = name.split('-');
		console.log('splitName = ', splitName);
		let index = splitName[0].indexOf('RunGroup');
		console.log('index = ', index);
		if (index === 0) {
			console.log('inside index  ');
			let ansOpt = answer[i].value[0];
			// parse string "raceRadioOption_1"
			res = ansOpt.split('_');
			console.log('res = ', res[1]);
			return res[1];
		}
	}
	return -1;
};
exports.createEntry = createEntry;
