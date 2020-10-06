const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

const Event = require('../models/event');
const Entry = require('../models/entry');
const User = require('../models/user');
const e = require('express');
const { toNamespacedPath } = require('path');

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

// include both create and update entry
const createEntry = async (req, res, next) => {
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

	// ! ************ Future Implementation Use Mutex ************ !//
	// ! To avoid race condition, querying number of entries and group entries need to wait till
	// ! previous event.save() done.

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

	// todo: auto bump waitlist once entry drops out from entry list
	// check if event is already full
	// 2 conditions here:
	// 1. total entries >= event.topCap
	// 2. event.full flag. In this case, total.entries could be < event.totalCap because someone canceled
	//    the entry and removed from entry list.  We do not do auto bump yet so we will leave it as is.
	//    we cannot use event.waitlist.length > 0, reason for it is because we also put group wait list entries
	//    to waitlist even though event is not full.
	let eventFull = false;
	if (event.totalEntries >= event.totalCap || event.full) {
		console.log('event is full');
		eventFull = true;
	}

	//********* This section is for parsing entry form answers **********//
	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"
	let groupFull = false;
	// runGroupAnsChoice is the 1 from => 0: "raceRadioOption_1"
	let [runGroupAnsChoice, runGroup] = parseAnswer(
		event.runGroupOptions,
		answer,
		'RunGroup'
	);
	if (runGroupAnsChoice === -1) {
		const error = new HttpError(
			'Event registration answer invalid @run group. ',
			400
		);
		return next(error);
	}
	// check group cap to see if the run gorup is full
	if (event.capDistribution) {
		let capPerGroup = Math.floor(event.totalCap / event.numGroups);
		if (event.runGroupNumEntries[runGroupAnsChoice] === capPerGroup) {
			groupFull = true;
		}
	}

	// let raceClass = parseAnswer(answer, 'RaceClass');
	// if (raceClass === -1) {
	// 	const error = new HttpError(
	// 		'Event registration answer invalid @race class.',
	// 		400
	// 	);
	// 	return next(error);
	// }

	let [workerAssignmentAnsChoice, workerAssignment] = parseAnswer(
		event.workerAssignments,
		answer,
		'WorkerAssignment'
	);
	if (workerAssignment === -1) {
		const error = new HttpError(
			'Event registration answer invalid @worker assignment.',
			400
		);
		return next(error);
	}

	// check if user has entered the event
	let entry = await Entry.findOne({
		eventId: eventId,
		userId: userId
	});

	if (entry) {
		// flag to decide if event needs to be saved
		let eventUpdate = false;
		// check if the previous entry was on the group waitlist
		// if entry.groupWaitlist  == true, entry.waitlist must be also true
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
			// we have checked current entry run group is different from previous entry run group
			let oldGroup = event.runGroupNumEntries[entry.runGroup];
			let newGroup = event.runGroupNumEntries[runGroup];
			// use set to set array value => array.set(index, value)
			event.runGroupNumEntries.set(entry.runGroup, --oldGroup);
			event.runGroupNumEntries.set(runGroup, ++newGroup);
			// update entry status
			entry.waitlist = false;
			entry.groupWaitlist = false;
		} else if (
			!entry.waitlist &&
			groupFull &&
			entry.runGroup !== runGroupAnsChoice
		) {
			// if previous entry was good but now the new group is full.
			// We don't want to re-enter the event, instead giving an error message.
			// Because drop an entry to waitlist is very bad.
			const error = new HttpError(
				`${event.runGroupOptions[runGroupAnsChoice]} is full. You are still registed in ${entry.runGroup} run group.  Please try a different group or cancel the registration if you cannot make it.`,
				304
			);
			return next(error);
		}

		// if entry found, we need to override the previous values
		entry.carNumber = carNumber;
		entry.raceClass = raceClass;
		entry.workerAssignment = workerAssignment;
		entry.runGroup = runGroup;
		entry.answer = [];
		answer.map(data => entry.answer.push(data));

		try {
			if (eventUpdate) {
				const session = await mongoose.startSession();
				session.startTransaction();
				// save entry first because entry has less requests than event
				await entry.save({ session: session });
				await event.save({ session: session });
				await session.commitTransaction();
			} else {
				await entry.save();
			}
		} catch (err) {
			const error = new HttpError(
				'Event registration connecting with DB failed. Please try again later.',
				500
			);
			return next(error);
		}
	} else {
		// !entry
		// entry not found, create a new entry and store the entryId to event and user
		entry = new Entry({
			userId,
			userName: user.userName,
			userLastName: user.lastName,
			userFirstName: user.firstName,
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
			groupWaitlist: groupFull,
			runGroup: runGroup,
			workerAssignment: workerAssignment
		});
		try {
			const session = await mongoose.startSession();
			session.startTransaction();
			await entry.save({ session: session });

			// if event or group is full, put in wailist; otherwise put in entries
			if (eventFull || groupFull) {
				console.log('in waitlist');
				event.waitlist.push(entry);
			} else {
				event.entries.push(entry);
			}
			// update totalEntries number when neither event nor group is full
			if (!groupFull && !eventFull) {
				event.totalEntries++;
				if (event.totalEntries === event.totalCap) {
					event.full = true;
				}
			}

			// update runGroup entry number
			if (!groupFull) {
				let numEntries = event.runGroupNumEntries[runGroupAnsChoice];
				event.runGroupNumEntries.set(runGroupAnsChoice, ++numEntries);
			}

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
		res.status(202).json({
			entry: entry.toObject({ getters: true }),
			message:
				'Event is full. You are on the waitlist. Event club will notify you if there is a spot available.'
		});
	} else if (groupFull) {
		res.status(202).json({
			entry: entry.toObject({ getters: true }),
			message: `${event.runGroupOptions[runGroupAnsChoice]} is full. You are on the waitlist. You may try to register for another run group or wait for the event organizer to notify you when a spot is available.`
		});
	} else {
		res
			.status(200)
			.json({ entry: entry.toObject({ getters: true }) });
	}
};

const parseAnswer = (options, answer, fieldName) => {
	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"

	for (let i = 0; i < answer.length; ++i) {
		let name = answer[i].name;
		let splitName = name.split('-');
		// fieldName is 'RunGroup'
		let index = splitName[0].indexOf(fieldName);
		// index must be 0 because "RunGroupSingle"
		if (index === 0) {
			let ansOpt = answer[i].value[0];
			// parse string "raceRadioOption_1"
			res = ansOpt.split('_');
			return [res[1], options[res[1]]];
		}
	}
	return [-1, null];
};

const changeCar = async (req, res, next) => {
	const entryId = req.params.entryId;
	const userId = req.userData;

	let entry;
	try {
		entry = await Entry.findOne({
			_id: entryId,
			userId: userId
		});
	} catch (err) {
		const error = new HttpError(
			'Change car process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		console.log('entry not found');
		const error = new HttpError(
			'Could not find entry to change car.',
			404
		);
		return next(error);
	}

	const { carId } = req.body;
	entry.carId = carId;

	try {
		await entry.save();
	} catch (err) {
		const error = new HttpError(
			'entry update car connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

const changeClassNumber = async (req, res, next) => {
	const entryId = req.params.entryId;
	const userId = req.userData;

	let entry;
	try {
		entry = await Entry.findOne({
			_id: entryId,
			userId: userId
		});
	} catch (err) {
		const error = new HttpError(
			'Change class process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		console.log('entry not found');
		const error = new HttpError(
			'Could not find entry to change class.',
			404
		);
		return next(error);
	}

	const { carNumber, raceClass } = req.body;
	entry.carNumber = carNumber;
	entry.raceClass = raceClass;

	try {
		await entry.save();
	} catch (err) {
		const error = new HttpError(
			'entry update class connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

exports.createEntry = createEntry;
exports.changeCar = changeCar;
exports.changeClassNumber = changeClassNumber;
