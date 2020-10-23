const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

const Event = require('../models/event');
const Entry = require('../models/entry');
const User = require('../models/user');
const e = require('express');
const { compare } = require('bcryptjs');

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

// create entry
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

	// runGroupAnsChoices is the answer index for each day, i.e., index 1 is extracted from => 0: "raceRadioOption_1"
	// runGroups
	let [runGroupAnsChoices, runGroupAnsTexts] = parseAnswer(
		event.runGroupOptions,
		answer,
		'RunGroup'
	);

	// ! need to support single day selection for multiple day event
	if (runGroupAnsChoices.length === 0) {
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
	} else {
		for (let i = 0; i < days; ++i) {
			groupFull.push(false);
		}
	}

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
		// we should not find any entry here
		const error = new HttpError(
			'User already registered the event.',
			400
		);
		return next(error);
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
		try {
			const session = await mongoose.startSession();
			session.startTransaction();
			await entry.save({ session: session });

			// store newEntry to user.envents array
			user.entries.push(entry);
			await user.save({ session: session });

			// if event or group is full, put in wailist; otherwise put in entries
			for (let i = 0; i < days; ++i) {
				if (eventFull[i] || groupFull[i]) {
					let currentWaitlist = event.waitlist[i];
					currentWaitlist.push(entry);
					event.waitlist.set(i, currentWaitlist);
				} else {
					let currentEntries = event.entries[i];
					currentEntries.push(entry);
					event.entries.set(i, currentEntries);
				}
			}
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
			// update runGroup entry number
			for (let i = 0; i < days; ++i) {
				if (!groupFull[i]) {
					let index = runGroupAnsChoices[i];
					let numEntries =
						event.runGroupNumEntries[i][runGroupAnsChoices[i]];
					let originalNumEntries = [];
					originalNumEntries = event.runGroupNumEntries[i];
					originalNumEntries[index] = ++numEntries;

					// set day i group runGroup # runGroupAnsChoices[i]
					event.runGroupNumEntries.set(i, originalNumEntries);
				}
			}
			await event.save({ session: session });

			// only all tasks succeed, we commit the transaction
			await session.commitTransaction();
		} catch (err) {
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
			if (days > 1) {
				fullMessage += 'Day ' + (i + 1) + ' event is Full. ';
			} else {
				fullMessage = 'Event is full. ';
			}
		} else if (groupFull[i]) {
			if (days > 1) {
				fullMessage +=
					'Day ' +
					(i + 1) +
					' group ' +
					runGroupAnsTexts[i] +
					' is Full.  ';
			} else {
				fullMessage += runGroupAnsTexts[i] + ' group is Full.  ';
			}
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
		let name = answer[i].name;
		let splitName = name.split('-');
		// fieldName should start with 'RunGroup'
		// let index = splitName[0].indexOf(fieldName);
		let match = splitName[0].startsWith(fieldName);

		// index must be 0 because "RunGroupSingle"
		// if (index === 0) {
		if (match) {
			let ansOpt = answer[i].value[0];
			// parse string "raceRadioOption_1"
			res = ansOpt.split('_');

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

	let entry;
	try {
		entry = await Entry.findOne({
			_id: entryId,
			userId: userId
		});
	} catch (err) {
		const error = new HttpError(
			'Update form answer process failed. Please try again later',
			500
		);
		return next(error);
	}

	if (!entry) {
		const error = new HttpError(
			'Could not find entry to update form answer.',
			404
		);
		return next(error);
	}

	let event;
	event = await Event.findById(entry.eventId);
	if (!event) {
		const error = new HttpError(
			'Entry submission process internal failure',
			404
		);
		return next(error);
	}

	const { answer } = req.body;

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

	// find how many days
	let days = event.entries.length;

	let eventFull = [];
	for (let i = 0; i < days; ++i) {
		if (event.totalEntries[i] >= event.totalCap || event.full[i]) {
			eventFull.push(true);
		} else {
			eventFull.push(false);
		}
	}

	let groupFull = [];

	// runGroupAnsChoices is the answer index for each day, i.e., index 1 is extracted from => 0: "raceRadioOption_1"
	// runGroups
	let [runGroupAnsChoices, runGroupAnsTexts] = parseAnswer(
		event.runGroupOptions,
		answer,
		'RunGroup'
	);

	let [runGroupsIndex] = getRunGroupsIndex(
		event.runGroupOptions,
		entry.runGroup
	);

	// ! need to support single day selection for multiple day event
	if (runGroupAnsChoices.length === 0) {
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
				event.runGroupNumEntries[i][runGroupAnsChoices[i]] ==
				capPerGroup
			) {
				groupFull.push(true);
			} else {
				groupFull.push(false);
			}
		}
	} else {
		for (let i = 0; i < days; ++i) {
			groupFull.push(false);
		}
	}

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

	let groupFullMsg = '';
	for (let i = 0; i < days; ++i) {
		let oldIndex = runGroupsIndex[i];
		let newIndex = runGroupAnsChoices[i];
		// old run group same as new run group, skip
		if (oldIndex == newIndex) {
			continue;
		}
		let onWaitlist = entry.waitlist[i];
		let onGroupWaitlist = entry.groupWaitlist[i];
		if (!event.capDistribution && eventFull[i]) {
			// event full. in case users running into race condition that event just filled up after loading page
			if (days > 1) {
				groupFullMsg = `Day ${i} is full. No change was made.`;
			} else {
				groupFullMsg = `Event is full. No change was made.`;
			}
		} else if (!groupFull[i]) {
			// check if the previous entry was on the group waitlist
			// if entry.groupWaitlist  == true, entry.waitlist must be also true
			if (onWaitlist && onGroupWaitlist) {
				// if current entry run group is good, remove the entry from waitlist
				let waitlistEntries = event.waitlist[i];
				let entryIndex = waitlistEntries.indexOf(entry.id);
				waitlistEntries.splice(entryIndex, 1);
				event.waitlist.set(i, waitlistEntries);

				// put in entries
				let entries = event.entries[i];
				entries.push(entry.id);
				event.entries.set(i, entries);

				// update entry status
				entry.waitlist.set(i, false);
				entry.groupWaitlist.set(i, false);
			}
			// we have checked current entry run group is different from previous entry run group
			let dayRunGroupNumEntries = event.runGroupNumEntries[i];
			let newDayRunGroupEntries = [];
			for (let j = 0; j < dayRunGroupNumEntries.length; ++j) {
				if (j == newIndex) {
					newDayRunGroupEntries.push(dayRunGroupNumEntries[j] + 1);
				} else if (j == oldIndex && !onWaitlist) {
					newDayRunGroupEntries.push(dayRunGroupNumEntries[j] - 1);
				} else {
					newDayRunGroupEntries.push(dayRunGroupNumEntries[j]);
				}
			}
			// use set to set array value => array.set(index, value)
			event.runGroupNumEntries.set(i, newDayRunGroupEntries);
		} else {
			// groupFull[i] === true
			// if previous entry was good but now the new group is full.
			// We don't want to re-enter the event, instead giving an error message.
			// Because drop an entry to waitlist is very bad.
			if (days > 1) {
				groupFullMsg += ` Day ${i + 1} ${
					event.runGroupOptions[i][runGroupAnsChoices[i]]
				} run group is full. You are still registed in ${
					entry.runGroup[i]
				} run group.`;
			} else {
				groupFullMsg = `${
					event.runGroupOptions[i][runGroupAnsChoices[i]]
				} run group is full. You are still registed in ${
					entry.runGroup[i]
				} run group.`;
			}
		}
	}

	// override answers
	entry.answer = [];
	answer.map(data => entry.answer.push(data));
	entry.answer = answer;
	for (let i = 0; i < days; ++i) {
		if (!groupFull[i]) {
			entry.runGroup.set(i, runGroupAnsTexts[i]);
		}
		entry.workerAssignment.set(i, workerAssignmentAnsTexts[i]);
	}

	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		// save entry first because entry has less requests than event
		await entry.save({ session: session });
		await event.save({ session: session });
		await session.commitTransaction();
	} catch (err) {
		console.log('err  =', err);
		const error = new HttpError(
			'Entry update form answer connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (groupFullMsg !== '') {
		res.status(202).json({
			entry: entry.toObject({ getters: true }),
			message:
				groupFullMsg +
				' Please try a different group or cancel the registration if you cannot make it.'
		});
	} else {
		res
			.status(200)
			.json({ entry: entry.toObject({ getters: true }) });
	}
};

const getRunGroupsIndex = (runGroupOptions, runGroups) => {
	let runGroupsIndex = [];
	let days = runGroups.length;
	for (let i = 0; i < days; ++i) {
		runGroupsIndex.push(runGroupOptions[i].indexOf(runGroups[i]));
	}
	return [runGroupsIndex];
};

exports.createEntry = createEntry;
exports.updateCar = updateCar;
exports.updateClassNumber = updateClassNumber;
exports.updateFormAnswer = updateFormAnswer;
