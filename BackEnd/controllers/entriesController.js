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
const { deflateSync } = require('zlib');
const { findOneAndUpdate } = require('../models/event');

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

	let multiDayEvent = event.multiDayEvent;
	// validation to make sure all the field array lengths are the same
	if (
		event.entries.length !== event.waitlist.length ||
		event.entries.length !== event.full.length ||
		event.entries.length !== event.runGroupOptions.length ||
		event.entries.length !== event.runGroupNumEntries.length ||
		event.entries.length !== event.totalEntries.length
	) {
		console.log('event.entries.length = ', event.entries.length);
		console.log('event.waitlist.length = ', event.waitlist.length);
		console.log('event.full.length = ', event.full.length);
		console.log(
			'event.runGroupOptions.length = ',
			event.runGroupOptions.length
		);
		console.log(
			'event.runGroupNumEntries.length = ',
			event.runGroupNumEntries.length
		);
		console.log('event.totalEntries = ', event.totalEntries);

		const error = new HttpError(
			'Entry submission process internal failure array length not the same.',
			500
		);
		return next(error);
	}
	// find how many days
	let days = event.entries.length;

	// todo: auto bump waitlist once entry drops out from entry list
	// check if event is already full
	// 2 conditions here:
	// 1. total entries >= event.topCap
	// 2. event.full flag. In this case, total.entries could be < event.totalCap because someone canceled
	//    the entry and removed from entry list.  We do not do auto bump yet so we will leave it as is.
	//    we cannot use event.waitlist.length > 0, reason for it is because we also put group wait list entries
	//    to waitlist even though event is not full.
	let eventFull = [];
	for (let i = 0; i < days; ++i) {
		if (event.totalEntries[i] >= event.totalCap || event.full[i]) {
			console.log('event day is full = ', i);
			eventFull.push(true);
		} else {
			eventFull.push(false);
		}
	}

	//********* This section is for parsing entry form answers **********//
	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"
	// let groupFull = false;
	let groupFull = [];

	console.log('137 event.runGroupOptions = ', event.runGroupOptions);
	// runGroupAnsChoices is the answer index for each day, i.e., index 1 is extracted from => 0: "raceRadioOption_1"
	// runGroups
	let [runGroupAnsChoices, runGroupAnsTexts] = parseAnswer(
		event.runGroupOptions,
		answer,
		'RunGroup'
	);

	// ! need to support single day selection for multiple day event
	if (runGroupAnsChoices.length === 0) {
		console.log('164');
		const error = new HttpError(
			'Event registration answer invalid @run group. ',
			400
		);
		return next(error);
	}

	// check group cap to see if the run gorup is full
	if (event.capDistribution) {
		let capPerGroup = Math.floor(event.totalCap / event.numGroups);
		for (let i = 0; i < days; ++i) {
			if (
				// event.runGroupNumEntries[i][j] is a 2-D array, i for day, j for group
				// runGroupAnsChoices[i] is the answer for i day
				event.runGroupNumEntries[i][runGroupAnsChoices[i]] ===
				capPerGroup
			) {
				groupFull.push(true);
			} else {
				groupFull.push(false);
			}
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

	let [
		workerAssignmentAnsChoices,
		workerAssignmentAnsTexts
	] = parseAnswer(
		event.workerAssignments,
		answer,
		'WorkerAssignment'
	);
	if (workerAssignmentAnsChoices.length === 0) {
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
			console.log('250');
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
			console.log('280');
			const error = new HttpError(
				'Event registration connecting with DB failed. Please try again later.',
				500
			);
			return next(error);
		}
	} else {
		// !entry
		// entry not found, create a new entry and store the entryId to event and user
		let waitlist = [];
		for (let i = 0; i < eventFull.length; ++i) {
			// either event or group is full, entry will be on the waitilist
			waitlist.push(eventFull[i] || groupFull[i]);
		}

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
			waitlist: waitlist,
			groupWaitlist: groupFull,
			runGroup: runGroupAnsTexts,
			workerAssignment: workerAssignmentAnsTexts
		});
		console.log('entry = ', entry);
		try {
			const session = await mongoose.startSession();
			session.startTransaction();
			console.log('321');
			await entry.save({ session: session });

			// store newEntry to user.envents array
			user.entries.push(entry);

			await user.save({ session: session });
			console.log('330');
			// if event or group is full, put in wailist; otherwise put in entries
			for (let i = 0; i < days; ++i) {
				if (eventFull[i] || groupFull[i]) {
					// event.waitlist[i].push(entry);
					let currentWaitlist = event.waitlist[i];
					currentWaitlist.push(entry);
					event.waitlist.set(i, currentWaitlist);
				} else {
					// event.entries[i].push(entry);
					let currentEntries = event.entries[i];
					currentEntries.push(entry);
					event.entries.set(i, currentEntries);
				}
			}
			console.log('345');
			// update totalEntries number when neither event nor group is full
			for (let i = 0; i < days; ++i) {
				let numEntries = event.totalEntries[i];
				// event.totalEntries[i]++;
				event.totalEntries.set(i, ++numEntries);
				if (event.totalEntries[i] === event.totalCap) {
					// event.full[i] = true;
					event.full.set(i, true);
				}
			}
			console.log('354');
			// update runGroup entry number
			for (let i = 0; i < days; ++i) {
				if (!groupFull[i]) {
					console.log(
						'1: event.runGroupNumEntries[i] = ',
						event.runGroupNumEntries[i]
					);
					console.log(
						'runGroupAnsChoices[i] = ',
						runGroupAnsChoices[i]
					);
					let index = runGroupAnsChoices[i];
					console.log('index = ', index);

					let numEntries =
						event.runGroupNumEntries[i][runGroupAnsChoices[i]];
					console.log('numEntries = ', numEntries);

					let originalNumEntries = [];
					originalNumEntries = event.runGroupNumEntries[i];
					console.log('originalNumEntries 1 = ', originalNumEntries);

					originalNumEntries[index] = ++numEntries;

					console.log('originalNumEntries 2 = ', originalNumEntries);

					// set day i group runGroup # runGroupAnsChoices[i]
					event.runGroupNumEntries.set(i, originalNumEntries);

					console.log(
						'2: event.runGroupNumEntries[i] = ',
						event.runGroupNumEntries[i]
					);
				}
			}
			console.log('event = ', event);
			console.log('379');
			await event.save({ session: session });

			// only all tasks succeed, we commit the transaction
			await session.commitTransaction();
		} catch (err) {
			console.log('387 err = ', err);
			const error = new HttpError(
				'Event registration process failed due to technical issue. Please try again later.',
				500
			);
			return next(error);
		}
	}

	let fullMessage = '';
	for (let i = 0; i < days; ++i) {
		if (eventFull[i]) {
			fullMessage += 'Day ' + i + ' event is Full.';
		} else if (groupFull[i]) {
			fullMessage +=
				'Day ' + i + ' group ' + runGroupAnsTexts[i] + ' is Full.';
		}
	}

	if (fullMessage !== '') {
		res.status(202).json({
			entry: entry.toObject({ getters: true }),
			message:
				fullMessage +
				'You are on the waitlist. Event club will notify you if there is a spot available.'
		});
	} else {
		res
			.status(200)
			.json({ entry: entry.toObject({ getters: true }) });
	}
};

// example:
// options: event.runGroupOptions = [["Morning Group 1","Morning Group 2","Afternoon Group 1","Afternoon Group 2","Afternoon Group 3"],["Morning Group 1","Morning Group 2","Afternoon Group 1","Afternoon Group 2","Afternoon Group 3"]]
// answer:  entry form answer from users =  RunGroupsForMultipleDaysEventDay2-0
// fieldName: "RunGroup"
// return: [runGroupAnsChoices, runGroupAnsTexts], runGroupAnsChoices: answers for each day, runGroupAnsTexts: text for the corresponding text
const parseAnswer = (options, answer, fieldName) => {
	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"

	// answerArray stores index number of the answer
	let answerArray = [];
	// textArray stores corresponding text of the answer extracted from options
	let textArray = [];
	// i is the index of answer
	// j is the index of options
	// We will loop through answer, answer is sorted per sequence of the entry form,
	// therefore the first answer for RunGroup is for Day 1, the 2nd will be Day 2 ... and so on.
	for (let i = 0, j = 0; i < answer.length; ++i) {
		console.log('349 options = ', options);
		let name = answer[i].name;
		let splitName = name.split('-');
		// fieldName should start with 'RunGroup'
		// let index = splitName[0].indexOf(fieldName);
		console.log('splitName[0] = ', splitName[0]);
		console.log('fieldName = ', fieldName);
		let match = splitName[0].startsWith(fieldName);

		// index must be 0 because "RunGroupSingle"
		// if (index === 0) {
		if (match) {
			let ansOpt = answer[i].value[0];
			// parse string "raceRadioOption_1"
			res = ansOpt.split('_');
			console.log('res = ', res);
			console.log('res[1] = ', res[1]);
			console.log('options[j] = ', options[j]);
			console.log('options[j][res[1]] = ', options[j][res[1]]);

			// res[1] is the answer index
			answerArray.push(res[1]);
			// options[j][res[1]] is the corresponding text of the answer in options
			textArray.push(options[j][res[1]]);
			++j;
		}
	}

	return [answerArray, textArray];
};

const updateCar = async (req, res, next) => {
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
			'Update car process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		console.log('entry not found');
		const error = new HttpError(
			'Could not find entry to update car.',
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
			'Entry update car connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

const updateClassNumber = async (req, res, next) => {
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
			'Update class process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		console.log('entry not found');
		const error = new HttpError(
			'Could not find entry to update race class/car number.',
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
			'Entry update class connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

const updateFormAnswer = async (req, res, next) => {
	const entryId = req.params.entryId;
	const userId = req.userData;

	console.log('entryId = ', entryId);
	console.log('userId = ', userId);
	let entry;
	try {
		entry = await Entry.findOne({
			_id: entryId,
			userId: userId
		});
	} catch (err) {
		console.log('err1 = ', err);
		const error = new HttpError(
			'Update form answer process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		console.log('entry not found');
		const error = new HttpError(
			'Could not find entry to update form answer.',
			404
		);
		return next(error);
	}

	const { answer } = req.body;
	entry.answer = answer;

	try {
		await entry.save();
		console.log('entry = entry');
	} catch (err) {
		console.log('err 2 =', err);
		const error = new HttpError(
			'Entry update form answer connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

exports.createEntry = createEntry;
exports.updateCar = updateCar;
exports.updateClassNumber = updateClassNumber;
exports.updateFormAnswer = updateFormAnswer;
