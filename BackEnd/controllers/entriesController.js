const fs = require('fs'); // file system, a nodejs module
const e = require('express');

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const mongoose = require('mongoose');

const Club = require('../models/club');
const Event = require('../models/event');
const Entry = require('../models/entry');
const EntryReport = require('../models/entryReport');
const User = require('../models/user');
const ClubAccount = require('../models/clubAccount');
const Payment = require('../models/payment');
const Stripe = require('./stripeController');
const UserAccount = require('../models/userAccount');
const ClubMember = require('../models/clubMember');
const NumberTable = require('../models/numberTable');
const {
	sendRegistrationConfirmationEmail
} = require('../util/nodeMailer');

const { compare } = require('bcryptjs');
const { Encrypt, Decrypt } = require('../util/crypto');
const { CodeStarNotifications } = require('aws-sdk');
const payment = require('../models/payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const NOT_ATTENDING = 'Not Attending';
const REGISTRATION = 'Registration';
const LUNCH = 'Lunch';
const ONSITE = 'onSite';
const STRIPE = 'stripe';
const UNPAID = 'Unpaid';
const PAID = 'Paid';
const AUTHENTICATION = 'Require Authentication';
const DECLINED = 'Declined';
const DEFAULT_STRIPE_ID = '0000';

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

	// verify wheather user account has been completed yet
	try {
		var userAccount = await UserAccount.findById(user.accountId);
	} catch (err) {
		const error = new HttpError(
			'Entry form submission faied @ finding user account.',
			500
		);
		return next(error);
	}
	if (!userAccount) {
		const error = new HttpError(
			'This user account cannot be located.',
			400
		);
		return next(error);
	}
	if (!userAccount.completed) {
		const error = new HttpError(
			'Please complete your account before registrering events.',
			401
		);
		return next(error);
	}

	// we need to get answer from body
	const {
		carId,
		carNumber,
		answer,
		disclaimer,
		paymentMethod,
		entryFee,
		stripeSetupIntentId,
		stripePaymentMethodId
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
	const eventId = req.params.eid;
	let event;
	try {
		event = await Event.findById(eventId).populate('entryReportId');
	} catch (err) {
		const error = new HttpError(
			'Entry submission process internal failure during event retrieval',
			500
		);
		return next(error);
	}
	if (!event) {
		const error = new HttpError(
			'Entry submission process internal failure',
			404
		);
		return next(error);
	}
	let entryReport = event.entryReportId;
	if (!entryReport) {
		const error = new HttpError(
			'Entry submission process internal failure entryReport not found',
			404
		);
		return next(error);
	}

	try {
		var club = await Club.findById(event.clubId);
	} catch (err) {
		const error = new HttpError(
			'Entry submission process internal failure finding club',
			500
		);
		return next(error);
	}
	if (!club) {
		const error = new HttpError(
			'Entry submission process internal failure club not found',
			404
		);
		return next(error);
	}

	// check club has this user as club member, if not we will add it to club member list
	try {
		var clubMember = await ClubMember.findOne({
			clubId: event.clubId,
			userId: userId
		});
	} catch (err) {
		console.log('Unable to look up club member = ', err);
		// unable to find
		const error = new HttpError(
			'Unable to look up club member. Please try later.',
			500
		);
		return next(error);
	}
	let newClubMember = null;
	if (!clubMember) {
		// todo check whether the carNumber is available

		// create a new member
		newClubMember = new ClubMember({
			userId: userId,
			lastName: user.lastName,
			firstName: user.firstName,
			email: user.email,
			clubId: event.clubId,
			carNumber: carNumber
		});
	}

	let multiDayEvent = event.multiDayEvent;
	// validation to make sure all the field array lengths are the same
	if (
		entryReport.entries.length !== entryReport.waitlist.length ||
		entryReport.entries.length !== entryReport.full.length ||
		entryReport.entries.length !== event.runGroupOptions.length ||
		entryReport.entries.length !==
			entryReport.runGroupNumEntries.length ||
		entryReport.entries.length !== entryReport.totalEntries.length
	) {
		// debugging message
		// console.log(
		// 	'entryReport.entries.length = ',
		// 	entryReport.entries.length
		// );
		// console.log(
		// 	'entryReport.waitlist.length = ',
		// 	entryReport.waitlist.length
		// );
		// console.log(
		// 	'entryReport.full.length = ',
		// 	entryReport.full.length
		// );
		// console.log(
		// 	'entryReport.runGroupNumEntries.length = ',
		// 	entryReport.runGroupNumEntries.length
		// );
		// console.log(
		// 	'entryReport.totalEntries.length = ',
		// 	entryReport.totalEntries.length
		// );
		// console.log(
		// 	'event.runGroupOptions.length = ',
		// 	event.runGroupOptions.length
		// );

		const error = new HttpError(
			'Entry submission process internal failure array length not the same.',
			500
		);
		return next(error);
	}
	// find how many days
	let days = entryReport.entries.length;

	// todo: auto bump waitlist once entry drops out from entry list
	// check if event is already full
	// 2 conditions here:
	// 1. total entries >= event.topCap if capDistribution is false
	// 2. entryReport.full flag. In this case, total.entries could be < event.totalCap because someone canceled
	//    the entry and removed from entry list.  We do not do auto bump yet so we will leave it as is.
	//    we cannot use entryReport.waitlist.length > 0, reason for it is because we also put group wait list entries
	//    to waitlist even though event is not full.
	let eventFull = [];
	for (let i = 0; i < days; ++i) {
		if (entryReport.full[i]) {
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
	let [raceClass, raceClassAnsTexts] = parseSingleDayAnswer(
		event.raceClassOptions,
		answer,
		'RaceClass'
	);

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

	let groupFull = [];
	// if event sets capDistribution, check group cap to see if the run gorup is full
	if (event.capDistribution) {
		let capPerGroup = Math.floor(event.totalCap / event.numGroups);
		for (let i = 0; i < days; ++i) {
			if (runGroupAnsTexts[i] === NOT_ATTENDING) {
				groupFull.push(false);
			} else if (
				// entryReport.runGroupNumEntries[i][j] is a 2-D array, i for day, j for group
				// runGroupAnsChoices[i] is the answer for i day
				entryReport.runGroupNumEntries[i][runGroupAnsChoices[i]] >=
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
	// if no worker assignments defined for current event, we will not return error
	if (
		event.workerAssignments.length !== 0 &&
		workerAssignmentAnsChoices.length === 0
	) {
		const error = new HttpError(
			'Event registration answer invalid @worker assignment.',
			400
		);
		return next(error);
	}

	// check if user has entered the event
	let entry;
	try {
		entry = await Entry.findOne({
			eventId: eventId,
			userId: userId
		});
	} catch (err) {
		const error = new HttpError(
			'Internal error in createEntry when retrieving entry.',
			500
		);
		return next(error);
	}

	let totalPrice = '0';
	if (entry) {
		// we should not find any entry here
		const error = new HttpError(
			'You already registered the event. Your submission was not accepted',
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
			raceClass: raceClassAnsTexts,
			disclaimer,
			time: moment(),
			published: true,
			waitlist: waitlist,
			groupWaitlist: groupFull,
			runGroup: runGroupAnsTexts,
			workerAssignment: workerAssignmentAnsTexts
		});

		// calculate price according to attendingDays * price/event
		let attendingDays = 0;
		// flag to keep track if user select "Not Attending" for everyday
		let notAttending = true;
		let workerNoSignup = false;
		// if event or group is full, put in wailist; otherwise put in entries
		for (let i = 0; i < days; ++i) {
			// for multiple days events, user can choose to skip some day
			if (runGroupAnsTexts[i] !== NOT_ATTENDING) {
				notAttending = false;
				if (eventFull[i] || groupFull[i]) {
					let currentWaitlist = entryReport.waitlist[i];
					currentWaitlist.push(entry);
					entryReport.waitlist.set(i, currentWaitlist);
				} else {
					let currentEntries = entryReport.entries[i];
					currentEntries.push(entry);
					entryReport.entries.set(i, currentEntries);
				}

				// increase total entries by 1 no matter this entry is on entryList or waitlist
				let numEntries = entryReport.totalEntries[i];
				entryReport.totalEntries.set(i, ++numEntries);

				// update runGroupNumEntries by +1
				if (!groupFull[i]) {
					attendingDays++;
					let index = runGroupAnsChoices[i];
					let numEntries =
						entryReport.runGroupNumEntries[i][runGroupAnsChoices[i]];
					let originalNumEntries = [];
					originalNumEntries = entryReport.runGroupNumEntries[i];
					originalNumEntries[index] = ++numEntries;

					// set day i group runGroup # runGroupAnsChoices[i]
					entryReport.runGroupNumEntries.set(i, originalNumEntries);
				}

				// only set full in 2 conditions
				// 1. capDistribution false, use total entries to compare with totalCap
				// 2. capDistribution true, each group must be full then we consider event is full
				if (
					!event.capDistribution &&
					entryReport.totalEntries[i] >= event.totalCap
				) {
					entryReport.full.set(i, true);
				} else if (event.capDistribution) {
					// groupCap, num of entries allowed in each group
					let groupCap = event.totalCap / event.numGroups;
					let groupCapFull = true;
					for (let j = 0; j < event.numGroups; ++j) {
						// loop through each group
						if (entryReport.runGroupNumEntries[i][j] < groupCap) {
							// as long as one of the groups does not meet groupCap
							groupCapFull = false;
							break;
						}
					}
					if (groupCapFull) {
						entryReport.full.set(i, true);
					}
				}

				if (workerAssignmentAnsTexts[i] === NOT_ATTENDING) {
					workerNoSignup = true;
				}
			}
		}

		// find answer of Registration option
		let answerRegistration = '';
		for (let i = 0; i < answer.length; ++i) {
			// Check name starts with "Registration", full name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
			if (answer[i].name.startsWith(REGISTRATION)) {
				// value is always at index 0
				// value: Array
				//      0: "regRadioOption_0"
				answerRegistration = answer[i].value[0];
				break;
			}
		}

		// calculate price
		let entryFormData = event.entryFormData;
		let dayPrice = '0';
		// find entryFormData with field_name starts with "Registration", full field_name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		for (let i = 0; i < entryFormData.length; ++i) {
			if (entryFormData[i].field_name.startsWith(REGISTRATION)) {
				let options = entryFormData[i].options;

				for (let j = 0; j < options.length; ++j) {
					if (options[j].key === answerRegistration) {
						dayPrice = options[j].value;
						break;
					}
				}
				break;
			}
		}
		let totalPriceNum = attendingDays * parseFloat(dayPrice);

		// add lunch option if existing
		let [lunchOption, lunchOptionAnsTexts] = parseSingleDayAnswer(
			event.lunchOptions,
			answer,
			'Lunch'
		);
		if (lunchOptionAnsTexts !== undefined) {
			entry.set('lunchOption', lunchOptionAnsTexts, {
				strict: false
			});
		}
		// add lunch price
		// find answer of Lunch option - Single Day
		let answerLunch = '';
		for (let i = 0; i < answer.length; ++i) {
			// Check name starts with "Lunch", full name is "Lunch-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
			if (answer[i].name.startsWith(LUNCH)) {
				// value is always at index 0
				// value: Array
				//      0: "regRadioOption_0"
				answerLunch = answer[i].value[0];
				break;
			}
		}

		let lunchPrice = '0';
		// find entryFormData with field_name starts with "Lunch", full field_name is "Lunch-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		for (let i = 0; i < entryFormData.length; ++i) {
			if (
				entryFormData[i].field_name &&
				entryFormData[i].field_name.startsWith(LUNCH)
			) {
				let options = entryFormData[i].options;

				for (let j = 0; j < options.length; ++j) {
					if (options[j].key === answerLunch) {
						lunchPrice = options[j].value;
						break;
					}
				}
				break;
			}
		}
		totalPriceNum = totalPriceNum + parseFloat(lunchPrice);

		// re-format to string
		totalPrice = totalPriceNum.toString();
		// If none of days has run group, return status code 406.
		// Frontend will be able to recognize 406 and print out error message.
		if (notAttending) {
			const error = new HttpError(
				'You need to sign up at least one day. Your entry was not accepted.',
				406
			);
			return next(error);
		}
		if (workerNoSignup) {
			const error = new HttpError(
				'Your must sign up worker for the registered date.  Your entry was not accepted',
				406
			);
			return next(error);
		}

		try {
			const session = await mongoose.startSession();
			session.startTransaction();
			if (newClubMember) {
				await newClubMember.save({ session: session });
			}
			await entry.save({ session: session });
			let entryId = entry.id;
			let payment = new Payment({
				entryId,
				entryFee: totalPrice,
				// stripe fee 2.9% + 30 cents service fee is not refundable
				refundFee:
					totalPrice === '0'
						? '0'
						: totalPrice - (totalPrice * 0.029 + 0.3).toFixed(2),
				stripeFee:
					totalPrice === '0'
						? '0'
						: (totalPrice * 0.029 + 0.3).toFixed(2),
				paymentMethod,
				stripeSetupIntentId,
				stripePaymentMethodId
			});

			await payment.save({ session: session });
			let paymentId = payment.id;
			// save paymentId to entry
			entry.paymentId = paymentId;
			await entry.save({ session: session });
			// store newEntry to user.envents array
			user.entries.push(entry);
			await user.save({ session: session });
			await entryReport.save({ session: session });

			// only all tasks succeed, we commit the transaction
			await session.commitTransaction();
		} catch (err) {
			console.log('522 err = ', err);
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
				fullMessage = 'Event is full. You will not be charged.';
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
				fullMessage +=
					runGroupAnsTexts[i] +
					' group is Full. You will be charged for $' +
					totalPrice +
					'.';
			}
		}
	}

	if (fullMessage !== '') {
		res.status(202).json({
			entry: entry.toObject({ getters: true }),
			totalPrice: totalPrice,
			message:
				fullMessage +
				'You are on the waitlist. Event club will notify you if there is a spot available.'
		});
	} else {
		// send registration confirmation email
		try {
			sendRegistrationConfirmationEmail(
				user.firstName,
				user.email,
				club.name,
				club.email,
				event.name,
				event.id,
				'',
				paymentMethod,
				totalPrice
			);
		} catch (err) {
			console.log(
				'sendRegistrationConfirmationEmail 200 error = ',
				err
			);
		}

		res.status(200).json({
			entry: entry.toObject({ getters: true }),
			totalPrice: totalPrice,
			email: user.email
		});
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

const parseSingleDayAnswer = (options, answer, fieldName) => {
	// entry answer format:
	// answer: Array
	//   0: object
	//      name: "RunGroupSingle-12EDB3DA-484C-4ECB-BB32-C3AE969A2D2F"
	//      value: Array
	//         0: "raceRadioOption_1"

	// answerIndex is index number of the answer
	let answerIndex;
	// answerText is corresponding text of the answer extracted from options
	let answerText;
	// i is the index of answer
	// We will loop through answer, answer is sorted per sequence of the entry form,
	for (let i = 0; i < answer.length; ++i) {
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

			// options[i] is the corresponding text of the answer in options
			answerIndex = res[i];
			// res[1] is the answer index
			answerText = options[res[1]];
		}
	}

	return [answerIndex, answerText];
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

	const { carNumber } = req.body;
	entry.carNumber = carNumber;

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

	let entryReport;
	try {
		entryReport = await EntryReport.findById(event.entryReportId);
	} catch (err) {
		const error = new HttpError(
			'Entry submission process internal failure entryReport not found.',
			500
		);
		return next(error);
	}
	if (!entryReport) {
		const error = new HttpError(
			'Entry submission process internal failure entryReport not found.',
			404
		);
		return next(error);
	}

	const { answer } = req.body;

	if (!answer || answer.length === 0) {
		const error = new HttpError(
			'UpdateFormAnswer Entry submission failed with empty answer.',
			400
		);
		return next(error);
	}

	// ! ************ Future Implementation Use Mutex ************ !//
	// ! To avoid race condition, querying number of entries and group entries need to wait till
	// ! previous event.save() done.

	// find how many days
	let days = entryReport.entries.length;
	let eventFull = [];
	for (let i = 0; i < days; ++i) {
		if (entryReport.full[i]) {
			eventFull.push(true);
		} else {
			eventFull.push(false);
		}
	}

	// update race class
	let [raceClass, raceClassAnsTexts] = parseSingleDayAnswer(
		event.raceClassOptions,
		answer,
		'RaceClass'
	);
	entry.raceClass = raceClassAnsTexts;

	// runGroupAnsChoices is the answer index for each day, i.e., index 1 is extracted from => 0: "raceRadioOption_1"
	// runGroups
	let [runGroupAnsChoices, runGroupAnsTexts] = parseAnswer(
		event.runGroupOptions,
		answer,
		'RunGroup'
	);

	if (runGroupAnsTexts.length === 0) {
		const error = new HttpError(
			'Your submission was not accepted. Please choose a run group',
			406
		);

		return next(error);
	}

	let notAttending = true;
	for (let i = 0; i < days; ++i) {
		if (runGroupAnsTexts[i] !== NOT_ATTENDING) {
			notAttending = false;
			break;
		}
	}

	if (notAttending) {
		const error = new HttpError(
			'Your submission was not accepted. Please sign up at least one day. If you are not planning to attend to the event, please cancel your registration instead.',
			406
		);

		return next(error);
	}

	let [runGroupsIndex] = getRunGroupsIndex(
		event.runGroupOptions,
		entry.runGroup
	);

	if (runGroupAnsChoices.length === 0) {
		const error = new HttpError(
			'Event registration answer invalid. Please select a run group. ',
			400
		);
		return next(error);
	}

	let groupFull = [];
	// check group cap to see if the run gorup is full
	if (event.capDistribution) {
		let capPerGroup = Math.floor(event.totalCap / event.numGroups);
		for (let i = 0; i < days; ++i) {
			if (runGroupAnsTexts[i] === NOT_ATTENDING) {
				groupFull.push(false);
			} else if (
				// entryReport.runGroupNumEntries[i][j] is a 2-D array, i for day, j for group
				// runGroupAnsChoices[i] is the answer for i day
				entryReport.runGroupNumEntries[i][runGroupAnsChoices[i]] >=
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
	// events may not have worker assignments defined in the entry form
	if (
		event.workerAssignments.length !== 0 &&
		workerAssignmentAnsChoices.length === 0
	) {
		const error = new HttpError(
			'Event registration answer invalid @worker assignment.',
			400
		);
		return next(error);
	}

	// check wheather runGroupAnsChoices does not match workerAssignmentAnsChoices
	// for non-"Not Attending" day, there must be worker signup
	const workerSignup = isWorkerSignedUp(
		runGroupAnsTexts,
		workerAssignmentAnsTexts
	);
	// events may not have worker assignments defined in the entry form
	if (event.workerAssignments.length !== 0 && !workerSignup) {
		const error = new HttpError(
			'Your must sign up worker for the registered date.  Your entry was not accepted',
			406
		);
		return next(error);
	}

	// calculate price according to attendingDays * price/event
	let attendingDays = 0;
	let groupFullMsg = '';
	let runGroupChanged = [];
	for (let i = 0; i < days; ++i) {
		let oldIndex = runGroupsIndex[i];
		let newIndex = runGroupAnsChoices[i];
		// old run group same as new run group, skip
		if (
			oldIndex == newIndex &&
			runGroupAnsTexts[i] !== NOT_ATTENDING
		) {
			runGroupChanged.push(false);
			++attendingDays;
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
			runGroupChanged.push(false);
		} else if (!groupFull[i]) {
			// check if the previous entry was on the group waitlist
			// if entry.groupWaitlist === true, entry.waitlist must be also true
			if (onWaitlist && onGroupWaitlist) {
				if (runGroupAnsTexts[i] !== NOT_ATTENDING) {
					// put in entries
					let entries = entryReport.entries[i];
					entries.push(entry.id);
					entryReport.entries.set(i, entries);
					++attendingDays;
				} else {
					// current entry is NOT_ATTENDING
					// No need to put in entry list,
					// reduce 1 from totalEntries
					let oldTotalEntries = entryReport.totalEntries[i];
					entryReport.totalEntries.set(i, oldTotalEntries - 1);
				}
				// if current entry run group is good, remove the entry from waitlist
				let waitlistEntries = entryReport.waitlist[i];
				let entryIndex = waitlistEntries.indexOf(entry.id);
				waitlistEntries.splice(entryIndex, 1);
				entryReport.waitlist.set(i, waitlistEntries);

				// update entry status
				entry.waitlist.set(i, false);
				entry.groupWaitlist.set(i, false);
			} else if (entryReport.entries[i].indexOf(entry.id) === -1) {
				// If entryReport.entries does not have this entry meaning previous choice
				// was NOT_ATTENDING, now we need to add the entry to it. Also +1 for total
				// entries.
				// current entry can never be NOT_ATTENDING because oldIndex !== newIndex
				let entries = entryReport.entries[i];
				entries.push(entry.id);
				entryReport.entries.set(i, entries);
				entryReport.totalEntries.set(
					i,
					entryReport.totalEntries[i] + 1
				);
				++attendingDays;
			} else {
				// current entry run group is different from previous entry run group
				// current choice is not NOT_ATTENDING
				if (runGroupAnsTexts[i] !== NOT_ATTENDING) {
					++attendingDays;
				}
			}

			// we have checked current entry run group is different from previous entry run group
			let dayRunGroupNumEntries = entryReport.runGroupNumEntries[i];
			let newDayRunGroupEntries = [];
			for (let j = 0; j < dayRunGroupNumEntries.length; ++j) {
				if (j == newIndex && runGroupAnsTexts[i] !== NOT_ATTENDING) {
					// only increase runGroupNumEntires for meaningful groups
					newDayRunGroupEntries.push(dayRunGroupNumEntries[j] + 1);
				} else if (j == oldIndex && !onWaitlist) {
					newDayRunGroupEntries.push(dayRunGroupNumEntries[j] - 1);
				} else {
					newDayRunGroupEntries.push(dayRunGroupNumEntries[j]);
				}
			}
			// use set to set array value => array.set(index, value)
			entryReport.runGroupNumEntries.set(i, newDayRunGroupEntries);
			runGroupChanged.push(true);
		} else {
			// groupFull[i] === true
			if (entry.runGroup[i] === NOT_ATTENDING) {
				// previous entry was NOT_ATTENDING now put the enry in the waitlist
				// put entry in entryReport.waitlist
				let waitlist = [];
				waitlist = entryReport.waitlist[i];
				waitlist.push(entry.id);
				entryReport.waitlist.set(i, waitlist);
				// entryReport.totalEntries + 1
				let numEntries = entryReport.totalEntries[i];
				entryReport.totalEntries.set(i, numEntries + 1);
				// entry.waitlist = true
				entry.waitlist.set(i, true);
				// entry.groupWaitlist = true
				entry.groupWaitlist.set(i, true);
				// assign entry.runGroup
				entry.runGroup.set(i, runGroupAnsTexts[i]);
				// mark runGroup
				runGroupChanged.push(true);

				groupFullMsg += ` Day ${i + 1} ${
					event.runGroupOptions[i][runGroupAnsChoices[i]]
				} run group is full. You are on the waitlist`;
			} else {
				// if previous entry was not NOT_ATTENDING but now the new group is full.
				// There are 2 status for previous entry, either on the waitlist or not.
				// Either one, we don't want to re-enter the event, instead giving an error message.
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
				runGroupChanged.push(false);
				// need to check whether the previous entry was on waitlist or not to get correct attenday days
				// if previous entry was not on wailitlist, we need to add attendingDays + 1
				if (!entry.waitlist[i]) {
					++attendingDays;
				}
			}
		}
	}

	// This section is to find the dayPrice to calculate entry fee
	// we always want to get retrieve the answer from the form to get the dayPrice because it may be changed
	// find answer of Registration option
	let answerRegistration = '';
	for (let i = 0; i < answer.length; ++i) {
		// Check name starts with "Registration", full name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		if (answer[i].name.startsWith(REGISTRATION)) {
			// value is always at index 0
			// value: Array
			//      0: "regRadioOption_0"
			answerRegistration = answer[i].value[0];
			break;
		}
	}
	let entryFormData = event.entryFormData;
	let dayPrice = '0';
	// find entryFormData with field_name starts with "Registration", full field_name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
	for (let i = 0; i < entryFormData.length; ++i) {
		if (entryFormData[i].field_name.startsWith(REGISTRATION)) {
			let options = entryFormData[i].options;

			for (let j = 0; j < options.length; ++j) {
				if (options[j].key === answerRegistration) {
					dayPrice = options[j].value;
					break;
				}
			}
			break;
		}
	}
	let totalPriceNum = attendingDays * parseFloat(dayPrice);

	// add lunch option if existing
	let [lunchOption, lunchOptionAnsTexts] = parseSingleDayAnswer(
		event.lunchOptions,
		answer,
		'Lunch'
	);
	if (lunchOptionAnsTexts !== undefined) {
		entry.lunchOption = lunchOptionAnsTexts;
	}
	// add lunch price
	// find answer of Lunch option - Single Day
	let answerLunch = '';
	for (let i = 0; i < answer.length; ++i) {
		// Check name starts with "Lunch", full name is "Lunch-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		if (answer[i].name.startsWith(LUNCH)) {
			// value is always at index 0
			// value: Array
			//      0: "regRadioOption_0"
			answerLunch = answer[i].value[0];
			break;
		}
	}

	let lunchPrice = '0';
	// find entryFormData with field_name starts with "Lunch", full field_name is "Lunch-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
	for (let i = 0; i < entryFormData.length; ++i) {
		if (
			entryFormData[i].field_name &&
			entryFormData[i].field_name.startsWith(LUNCH)
		) {
			let options = entryFormData[i].options;

			for (let j = 0; j < options.length; ++j) {
				if (options[j].key === answerLunch) {
					lunchPrice = options[j].value;
					break;
				}
			}
			break;
		}
	}
	totalPriceNum = totalPriceNum + parseFloat(lunchPrice);

	totalPrice = totalPriceNum.toString();

	// override answers
	let originalAnswer = [];
	originalAnswer = entry.answer;

	entry.answer = [];
	let runGroupCounter = 0;
	answer.map((data, index) => {
		// if runGroup is not updated, we will not write to DB
		if (data.name.startsWith('RunGroup')) {
			if (!runGroupChanged[runGroupCounter]) {
				entry.answer.push(originalAnswer[index]);
			} else {
				if (data.name) entry.answer.push(data);
			}
			++runGroupCounter;
		} else {
			if (data.name) entry.answer.push(data);
		}
	});

	// update entry status
	for (let i = 0; i < days; ++i) {
		if (!groupFull[i]) {
			entry.runGroup.set(i, runGroupAnsTexts[i]);
		}
		entry.workerAssignment.set(i, workerAssignmentAnsTexts[i]);
	}

	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('980 err  =', err);
		const error = new HttpError(
			'Entry update form answer failed to retrieve payment DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	payment.entryFee = totalPrice;
	// stripe fee 2.9% + 30 cents service fee is not refundable
	payment.refundFee =
		totalPrice === '0'
			? '0'
			: totalPrice - (totalPrice * 0.029 + 0.3).toFixed(2);
	payment.stripeFee =
		totalPrice === '0' ? '0' : (totalPrice * 0.029 + 0.3).toFixed(2);
	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		// save entry first because entry has less requests than event
		await entry.save({ session: session });
		await entryReport.save({ session: session });
		await payment.save({ session: session });
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Entry update form answer connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (groupFullMsg !== '') {
		if (days === 1) {
			res.status(202).json({
				entry: entry.toObject({ getters: true }),
				message:
					groupFullMsg +
					' Please try a different group or cancel the registration if you cannot make it.' +
					'Entry Fee is $' +
					totalPrice +
					'.'
			});
		} else {
			res.status(202).json({
				entry: entry.toObject({ getters: true }),
				message: groupFullMsg + 'Entry Fee is $' + totalPrice + '.'
			});
		}
	} else {
		res.status(200).json({
			entry: entry.toObject({ getters: true }),
			message: 'Entry Fee is $' + totalPrice + '.'
		});
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

const isWorkerSignedUp = (
	runGroupAnsTexts,
	workerAssignmentAnsTexts
) => {
	if (runGroupAnsTexts.length !== workerAssignmentAnsTexts.length) {
		return false;
	}
	for (let i = 0; i < runGroupAnsTexts.length; ++i) {
		if (
			runGroupAnsTexts[i] !== NOT_ATTENDING &&
			workerAssignmentAnsTexts[i] === NOT_ATTENDING
		) {
			return false;
		}
	}
	return true;
};

const updatePayment = async (req, res, next) => {
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
			'Update payment process failed. Please try again later',
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

	let payment;
	try {
		payment = await Payment.findById(entry.paymentId);
	} catch (err) {
		const error = new HttpError(
			'Update payment process failed @ retrieving payment. Please try again later',
			500
		);
		return next(error);
	}

	if (!payment) {
		const error = new HttpError(
			'Update payment process failed @ finding payment. Please try again later',
			500
		);
		return next(error);
	}

	let {
		paymentMethod,
		stripeSetupIntentId,
		stripePaymentMethodId
	} = req.body;

	if (paymentMethod === 'stripe') {
		if (
			stripeSetupIntentId === '' ||
			stripeSetupIntentId === undefined ||
			stripePaymentMethodId === '' ||
			stripePaymentMethodId === undefined
		) {
			const error = new HttpError(
				'Update payment process failed. Missing stripe information.',
				500
			);
			return next(error);
		}
	} else {
		// need to set default value
		if (
			stripeSetupIntentId === '' ||
			stripeSetupIntentId === undefined
		) {
			stripeSetupIntentId = DEFAULT_STRIPE_ID;
		}
		if (
			stripePaymentMethodId === '' ||
			stripePaymentMethodId === undefined
		) {
			stripePaymentMethodId = DEFAULT_STRIPE_ID;
		}
	}

	// Wipe out credit card information if paymentMethod is ONSITE
	payment.paymentMethod = paymentMethod;
	payment.stripeSetupIntentId = stripeSetupIntentId;
	payment.stripePaymentMethodId = stripePaymentMethodId;
	payment.paymentStatus = UNPAID;
	try {
		await payment.save();
	} catch (err) {
		const error = new HttpError(
			'Entry update payment connecting with DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

const deleteEntry = async (req, res, next) => {
	// Validate event exists, if not send back an error.
	const entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId).populate('eventId');
	} catch (err) {
		const error = new HttpError(
			'Internal error in cancelEntry when retrieving entry.',
			500
		);
		return next(error);
	}
	let eventName = entry.eventId.name;

	if (!entry) {
		// we should not find any entry here
		const error = new HttpError('User entry cannot be found.', 400);
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
			'Cancel registration process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Cancel registration faied with unauthorized request. Forgot to login?',
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
			`Cancel registration process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}

	let event;
	try {
		event = await Event.findById(entry.eventId.id);
	} catch (err) {
		const error = new HttpError(
			'Internal error in cancelEntry when retrieving event.',
			500
		);
		return next(error);
	}
	if (!event) {
		const error = new HttpError(
			'Internal error in cancelEntry event not found.',
			500
		);
		return next(error);
	}

	let entryReport;
	try {
		entryReport = await EntryReport.findById(event.entryReportId);
	} catch (err) {
		const error = new HttpError(
			'`Cancel registration process internal failure entryReport not found',
			404
		);
		return next(error);
	}
	if (!entryReport) {
		const error = new HttpError(
			'`Cancel registration process internal failure entryReport not in DB',
			404
		);
		return next(error);
	}

	let multiDayEvent = entry.eventId.multiDayEvent;
	// find how many days
	let days = entryReport.entries.length;

	// todo: auto bump waitlist once entry drops out from entry list
	// Since we do not auto bump autolist so we will not touch event full flag
	// we only modify entryReport.entries and entryReport.waitlist to remove entry from lists
	for (let i = 0; i < days; ++i) {
		if (entry.waitlist[i]) {
			// remove from waitlist
			let waitlist = entryReport.waitlist[i];
			let index = waitlist.indexOf(entryId);
			waitlist.splice(index, 1);
			entryReport.waitlist.set(i, waitlist);
		} else {
			// remove from entries
			let entryList = entryReport.entries[i];
			let index = entryList.indexOf(entryId);
			entryList.splice(index, 1);
			entryReport.entries.set(i, entryList);

			// -1 for runGroup
			// match event runGroupOptions
			const [runGroupIndex] = getRunGroupIndex(
				event.runGroupOptions[i],
				entry.runGroup[i]
			);
			if (event.runGroupOptions[i][runGroupIndex] === NOT_ATTENDING) {
				continue;
			}
			let num = entryReport.runGroupNumEntries[i][runGroupIndex];
			// workaround method to change an element value in a nested array array[i][j]
			// first retrieve array[i] => let array1 = [], array1 = array[i]
			// and modify it outside => array1[j]--
			// then use array.set(i, array1) to set array1 to array
			let runGroupNumEntries = [];
			runGroupNumEntries = entryReport.runGroupNumEntries[i];
			runGroupNumEntries[runGroupIndex]--;
			entryReport.runGroupNumEntries.set(i, runGroupNumEntries);
		}
		// -1 for totalEntries
		let numEntries = entryReport.totalEntries[i];
		entryReport.totalEntries.set(i, numEntries - 1);
	}

	// delete payment record
	let payment;
	try {
		payment = await Payment.findById(entry.paymentId);
	} catch (err) {
		const error = new HttpError(
			'Failed to delete the event @retrieving payment.  Please try it later.',
			500
		);
		return next(error);
	}

	// remove entry from user entries
	user.entries.pull(entryId);
	try {
		// we need to use populate('clubId') above to be able to modify data in
		// event.clubId.events
		const session = await mongoose.startSession();
		session.startTransaction();
		await user.save({ session: session });
		// remove payment
		if (payment) {
			await payment.remove({ session: session });
		}
		await entry.remove({ session: session });
		// remove entryReport
		await entryReport.save({ session: session });
		// only both tasks succeed, we commit the transaction
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Failed to delete the entry.  Please try it later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		message: `Your entry for ${eventName} has been canceled.`
	});
};

const getRunGroupIndex = (runGroupOptions, runGroupText) => {
	for (let i = 0; i < runGroupOptions.length; ++i) {
		if (runGroupOptions[i] == runGroupText) {
			return [i];
		}
	}
};

// create entry
const getEntryFee = async (req, res, next) => {
	// Validate userId exists. If not, sends back an error
	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'getEntryFee process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'getEntryFee faied with unauthorized request. Forgot to login?',
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
			`getEntryFee process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}

	// we need to get answer from body
	const { answer } = req.body;

	if (!answer || answer.length === 0) {
		const error = new HttpError(
			'getEntryFee failed with empty answer.',
			400
		);
		return next(error);
	}

	// Validate event exists, if not send back an error.
	const eventId = req.params.eid;
	let event;
	try {
		event = await Event.findById(eventId).populate('entryReportId');
	} catch (err) {
		const error = new HttpError(
			'getEntryFee internal failure during event retrieval',
			500
		);
		return next(error);
	}
	if (!event) {
		const error = new HttpError(
			'getEntryFee process internal failure',
			404
		);
		return next(error);
	}
	let entryReport = event.entryReportId;
	if (!entryReport) {
		const error = new HttpError(
			'getEntryFee process internal failure entryReport not found',
			404
		);
		return next(error);
	}

	let multiDayEvent = event.multiDayEvent;
	// validation to make sure all the field array lengths are the same
	if (
		entryReport.entries.length !== entryReport.waitlist.length ||
		entryReport.entries.length !== entryReport.full.length ||
		entryReport.entries.length !== event.runGroupOptions.length ||
		entryReport.entries.length !==
			entryReport.runGroupNumEntries.length ||
		entryReport.entries.length !== entryReport.totalEntries.length
	) {
		// debug messages
		// console.log(
		// 	'entryReport.entries.length  = ',
		// 	entryReport.entries.length
		// );
		// console.log(
		// 	'entryReport.waitlist.length  = ',
		// 	entryReport.waitlist.length
		// );
		// console.log(
		// 	'entryReport.full.length  = ',
		// 	entryReport.full.length
		// );
		// console.log(
		// 	'event.runGroupOptions.length  = ',
		// 	event.runGroupOptions.length
		// );
		// console.log(
		// 	'entryReport.runGroupNumEntries.length  = ',
		// 	entryReport.runGroupNumEntries.length
		// );
		// console.log(
		// 	'entryReport.totalEntries.length  = ',
		// 	entryReport.totalEntries.length
		// );
		const error = new HttpError(
			'getEntryFee process internal failure array length not the same.',
			500
		);
		return next(error);
	}

	let clubAccount;
	try {
		clubAccount = await ClubAccount.findOne({ clubId: event.clubId });
	} catch (err) {
		const error = new HttpError(
			'getEntryFee internal failure @ getting club account. Please try again later.',
			500
		);
		return next(error);
	}

	if (!clubAccount) {
		const error = new HttpError(
			'getEntryFee failed. No club account in the DB.',
			404
		);
		return next(error);
	}
	let paymentOptions = [];

	if (clubAccount.onSitePayment === true) {
		paymentOptions.push(ONSITE);
	}
	if (clubAccount.stripePayment === true) {
		paymentOptions.push('stripe');
	}

	// find how many days
	let days = entryReport.entries.length;

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

	// check if user has entered the event
	let entry;
	try {
		entry = await Entry.findOne({
			eventId: eventId,
			userId: userId
		});
	} catch (err) {
		const error = new HttpError(
			'Internal error in createEntry when retrieving entry.',
			500
		);
		return next(error);
	}

	let entryFee = '0';
	let paymentMethod = '';
	if (entry) {
		// get entry fee from payment
		let payment;
		try {
			payment = await Payment.findById(entry.paymentId);
		} catch (err) {
			const error = new HttpError(
				'Internal error in getEntryFee when retrieving payment.',
				500
			);
			return next(error);
		}
		entryFee = payment.entryFee;
		paymentMethod = payment.paymentMethod;
	} else {
		// !entry
		// entry not found, we can proceed to get entry free from answers
		// calculate price according to attendingDays * price/event
		let attendingDays = 0;

		// flag to keep track if user select "Not Attending" for everyday
		let notAttending = true;

		// figure out how many attending days
		for (let i = 0; i < days; ++i) {
			// for multiple days events, user can choose to skip some day
			if (runGroupAnsTexts[i] !== NOT_ATTENDING) {
				notAttending = false;
				attendingDays++;
			}
		}

		// find answer of Registration option to get pricing per day
		let answerRegistration = '';
		for (let i = 0; i < answer.length; ++i) {
			// Check name starts with "Registration", full name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
			if (answer[i].name.startsWith(REGISTRATION)) {
				// value is always at index 0
				// value: Array
				//      0: "regRadioOption_0"
				answerRegistration = answer[i].value[0];
				break;
			}
		}

		// calculate price
		let entryFormData = event.entryFormData;
		let feePerDay = '0';
		// find entryFormData with field_name starts with "Registration", full field_name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		for (let i = 0; i < entryFormData.length; ++i) {
			if (entryFormData[i].field_name.startsWith(REGISTRATION)) {
				let options = entryFormData[i].options;
				for (let j = 0; j < options.length; ++j) {
					if (options[j].key === answerRegistration) {
						feePerDay = options[j].value;
						break;
					}
				}
				break;
			}
		}

		let totalPriceNum = attendingDays * parseFloat(feePerDay);

		// add lunch price
		// find answer of Lunch option - Single Day
		let answerLunch = '';
		for (let i = 0; i < answer.length; ++i) {
			// Check name starts with "Lunch", full name is "Lunch-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
			if (answer[i].name.startsWith(LUNCH)) {
				// value is always at index 0
				// value: Array
				//      0: "regRadioOption_0"
				answerLunch = answer[i].value[0];
				break;
			}
		}

		let lunchPrice = '0';
		// find entryFormData with field_name starts with "Lunch", full field_name is "Lunch-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		for (let i = 0; i < entryFormData.length; ++i) {
			if (
				entryFormData[i].field_name &&
				entryFormData[i].field_name.startsWith(LUNCH)
			) {
				let options = entryFormData[i].options;

				for (let j = 0; j < options.length; ++j) {
					if (options[j].key === answerLunch) {
						lunchPrice = options[j].value;
						break;
					}
				}
				break;
			}
		}
		totalPriceNum = totalPriceNum + parseFloat(lunchPrice);

		entryFee = totalPriceNum.toString();
		// If none of days has run group, return status code 406.
		// Frontend will be able to recognize 406 and print out error message.
		if (notAttending) {
			const error = new HttpError(
				'You need to sign up at least one day. Your entry was not accepted.',
				406
			);
			return next(error);
		}
	}

	res.status(200).json({
		entryFee,
		// paymentOptions is the payment options offered by club that contains "stripe" and/or "onSite"
		paymentOptions,
		// paymentMethod is what user chose how to pay for the entry fee
		paymentMethod
	});
};

const chargeEntry = async (req, res, next) => {
	let entryId = req.params.entryId;
	let club;
	let clubId = req.userData;
	try {
		club = await Club.findById(clubId);
	} catch (err) {
		console.log('1605 err = ', err);
		const error = new HttpError(
			'chargeEntry process failed during club validation. Please try again later.',
			500
		);
		return next(error);
	}
	if (!club) {
		const error = new HttpError(
			'chargeEntry process faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}
	let clubAccount;
	try {
		clubAccount = await ClubAccount.findById(club.accountId);
	} catch (err) {
		const error = new HttpError(
			'chargeEntry internal failure @ getting club account. Please try again later.',
			500
		);
		return next(error);
	}

	if (!clubAccount) {
		const error = new HttpError(
			'chargeEntry failed. No club account in the DB.',
			404
		);
		return next(error);
	}
	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('1624 err = ', err);
		const error = new HttpError(
			'chargeEntry process failed @ getting entry. Please try again later',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError(
			'chargeEntry Could not find entry.',
			404
		);
		return next(error);
	}

	let user;
	try {
		user = await User.findById(entry.userId);
	} catch (err) {
		console.log('1646 err = ', err);
		const error = new HttpError(
			'chargeEntry process failed @ getting user. Please try again later',
			500
		);
		return next(error);
	}
	if (!user) {
		const error = new HttpError(
			'chargeEntry Could not find user.',
			404
		);
		return next(error);
	}

	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('1640 err  =', err);
		const error = new HttpError(
			'chargeEntry failed to retrieve payment DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'chargeEntry failed finding payment.',
			500
		);
		return next(error);
	}
	let paymentMethod = payment.paymentMethod;
	let paymentStatus = 'Unpaid',
		errorCode = '';
	if (paymentMethod === ONSITE) {
		paymentStatus = PAID;
		payment.stripeFee = 0;
		payment.refundFee = payment.entryFee;
	} else if (paymentMethod === STRIPE) {
		if (payment.paymentStatus !== 'Unpaid') {
			const error = new HttpError(
				'paymentStatus needs to be in Unpaid to be charged.',
				400
			);
			return next(error);
		}
		// create paymentIntent, calling stripe.paymentIntents.create
		const [paymentIntent, err] = await Stripe.createPaymentIntent(
			user.stripeCustomerId,
			user.email,
			payment.stripePaymentMethodId,
			payment.entryFee,
			Decrypt(clubAccount.stripeAccountId)
		);
		console.log(
			'stripe account ID = ',
			Decrypt(clubAccount.stripeAccountId)
		);

		if (err) {
			console.log('1663 err  =', err);
			if (err.code === 'authentication_required') {
				paymentStatus = AUTHENTICATION;
				// Bring the customer back on-session to authenticate the purchase
				// You can do this by sending an email or app notification to let them know
				// the off-session purchase failed
				// Use the PM ID and client_secret to authenticate the purchase
				// without asking your customers to re-enter their details
				errorCode =
					'Charge failed. Customer authentication required. Please contact customer to login and authorize the charge.';
			} else if (err.code) {
				paymentStatus = DECLINED;
				// The card was declined for other reasons (e.g. insufficient funds)
				// Bring the customer back on-session to ask them for a new payment method
				errorCode =
					'Charge failed. Card was declined. Please contact customer to login and provide a different credit card.';
			} else {
				console.log('Unknown error occurred', err);
				const error = new HttpError(
					'Charge failed. Unknown error occurred. Please try again later.',
					500
				);
				return next(error);
			}
		} else {
			paymentStatus = PAID;
		}
		// save paymentIntentId, if err.code is AUTHENTICATION, we need paymentIntentId to handle the post-procecssing tasks
		payment.stripePaymentIntentId = paymentIntent.id;
	} else {
		const error = new HttpError('Payment method error.', 500);
		return next(error);
	}

	try {
		payment.paymentStatus = paymentStatus;
		await payment.save();
	} catch (err) {
		console.log('1730 err  =', err);
		const error = new HttpError(
			'chargeEntry failed saving payment. Please try again later.',
			500
		);
		return next(error);
	}
	if (errorCode !== '') {
		console.log('errorCode = ', errorCode);
		console.log('paymentStatus = ', paymentStatus);
		// cannot use 400, browser will error out
		return res.status(201).json({
			paymentStatus: paymentStatus,
			errorCode: errorCode
		});
	}

	return res.status(200).json({
		paymentStatus: paymentStatus,
		errorCode: errorCode
	});
};

// update refund fee requested by club refund center
const updateRefundFee = async (req, res, next) => {
	let entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('2003 err = ', err);
		const error = new HttpError(
			'updateRefundFee process failed @ getting entry. Please try again later',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError(
			'updateRefundFee Could not find entry.',
			404
		);
		return next(error);
	}

	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('2023 err  =', err);
		const error = new HttpError(
			'updateRefundFee failed to retrieve payment DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'updateRefundFee failed finding payment.',
			500
		);
		return next(error);
	}

	const { refundFee } = req.body;
	payment.refundFee = refundFee;

	try {
		await payment.save();
	} catch (err) {
		console.log('2044 err  =', err);
		const error = new HttpError(
			'updateRefundFee failed @ saving payment. Please try again later.',
			500
		);
		return next(error);
	}
	return res.status(200).json({
		refundUpdateStatus: true
	});
};

// return required information for refund request
const refund = async (req, res, next) => {
	let entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('1624 err = ', err);
		const error = new HttpError(
			'refund process failed @ getting entry. Please try again later',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError('refund Could not find entry.', 404);
		return next(error);
	}

	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('1640 err  =', err);
		const error = new HttpError(
			'refund failed to retrieve payment DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'refund failed finding payment.',
			500
		);
		return next(error);
	}

	// onSite paymentMethod
	if (payment.paymentMethod === 'stripe') {
		// stripe payment method
		let refund;
		try {
			refund = await stripe.refunds.create({
				amount: payment.refundFee * 100,
				payment_intent: payment.stripePaymentIntentId
			});
		} catch (err) {
			console.log('1835 err  =', err);
			const error = new HttpError(
				'refund failed @ stripe. Please try again later.',
				500
			);
			return next(error);
		}

		// if failed, we want to keep paymentStatus as 'Paid', so returning an error no update on status
		if (refund.status !== 'succeeded') {
			console.log('1843 err  =', err);
			const error = new HttpError(
				'Refund process failed. Please try again later. If problem persists, please have customer contact his/her credit card company.',
				500
			);
			return next(error);
		}
		payment.set('stripeRefundId', refund.id, { strict: false });
	}
	payment.paymentStatus = 'Refunded';

	try {
		await payment.save();
	} catch (err) {
		console.log('1856 err  =', err);
		const error = new HttpError(
			'refund failed @ saving payment. Please try again later.',
			500
		);
		return next(error);
	}
	return res.status(200).json({
		refundStatus: true
	});
};

// update entry fee requested by club payment center
const updateEntryFee = async (req, res, next) => {
	let entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('2150 err = ', err);
		const error = new HttpError(
			'updateEntryFee process failed @ getting entry. Please try again later',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError(
			'updateEntryFee Could not find entry.',
			404
		);
		return next(error);
	}

	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('2070 err  =', err);
		const error = new HttpError(
			'updateEntryFee failed to retrieve payment DB failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'updateEntryFee failed finding payment.',
			500
		);
		return next(error);
	}

	const { entryFee } = req.body;
	payment.entryFee = entryFee;
	payment.stripeFee =
		entryFee === 0 ? 0 : (entryFee * 0.029 + 0.3).toFixed(2);
	payment.refundFee =
		entryFee === 0
			? 0
			: entryFee - (entryFee * 0.029 + 0.3).toFixed(2);

	try {
		await payment.save();
	} catch (err) {
		console.log('2191 err  =', err);
		const error = new HttpError(
			'updateEntryFee failed @ saving payment. Please try again later.',
			500
		);
		return next(error);
	}
	return res.status(200).json({
		refundUpdateStatus: true
	});
};

// GET /authentication/:entryId returns clientSecret and paymentMethodId for frontend
// to process
const authentication = async (req, res, next) => {
	let entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('1794 err = ', err);
		const error = new HttpError(
			'authorizeCharge process failed @ getting entry. Please try again later',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError(
			'authorizeCharge Could not find entry.',
			404
		);
		return next(error);
	}
	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('980 err  =', err);
		const error = new HttpError(
			'authorizeCharge failed to retrieve payment. Stripe failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'authorizeCharge failed finding payment.',
			500
		);
		return next(error);
	}

	// use the declined PaymentIntent’s client secret and payment method with
	// confirmCardPayment to allow the customer to authenticate the payment.
	// 1. get client secret using setupIntent
	let paymentIntent;
	try {
		paymentIntent = await stripe.paymentIntents.retrieve(
			payment.stripePaymentIntentId
		);
	} catch (err) {
		console.log('1836 err = ', err);
		const error = new HttpError(
			'authorizeCharge failed to retrieve paymentIntent. Stripe failed. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		clientSecret: paymentIntent.client_secret,
		paymentMethodId:
			paymentIntent.last_payment_error.payment_method.id
	});
};

const updatePaymentStatus = async (req, res, next) => {
	let entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId);
	} catch (err) {
		console.log('1866 err = ', err);
		const error = new HttpError(
			'updatePaymentStatus process failed @ getting entry. Please try again later',
			500
		);
		return next(error);
	}
	if (!entry) {
		const error = new HttpError(
			'updatePaymentStatus Could not find entry.',
			404
		);
		return next(error);
	}
	let paymentId = entry.paymentId;
	let payment;
	try {
		payment = await Payment.findById(paymentId);
	} catch (err) {
		console.log('1885 err  =', err);
		const error = new HttpError(
			'updatePaymentStatus failed to retrieve payment. Stripe failed. Please try again later.',
			500
		);
		return next(error);
	}
	if (!payment) {
		const error = new HttpError(
			'updatePaymentStatus failed finding payment.',
			500
		);
		return next(error);
	}
	const { paymentStatus } = req.body;
	payment.paymentStatus = paymentStatus;

	try {
		await payment.save();
	} catch {
		console.log('1905 err  =', err);
		const error = new HttpError(
			'updatePaymentStatus failed to retrieve payment. Stripe failed. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		paymentStatus: paymentStatus
	});
};

const addEntryByClub = async (req, res, next) => {
	let clubId = req.userData;
	// Validate event exists, if not send back an error.
	const entryId = req.params.entryId;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		const error = new HttpError(
			`addEntryByClub process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}
	const { daySelected } = req.body;
	let entry;
	try {
		entry = await Entry.findById(entryId).populate('eventId');
	} catch (err) {
		const error = new HttpError(
			'Internal error in addEntryByClub when retrieving entry.',
			500
		);
		return next(error);
	}
	// validat deletion is from same clubId
	if (clubId !== entry.clubId.toString()) {
		const error = new HttpError('Not authorized to add entry.', 403);
		return next(error);
	}

	if (!entry) {
		// we should not find any entry here
		const error = new HttpError(
			'addEntryByClub User entry cannot be found.',
			400
		);
		return next(error);
	}

	// Validate userId exists. If not, sends back an error
	let user;
	// req.userData is inserted in check-auth.js
	let userId = entry.userId;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'addEntryByClub process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'addEntryByClub faied with unauthorized request. Forgot to login?',
			404
		);
		return next(error);
	}

	let event;
	try {
		event = await Event.findById(entry.eventId.id);
	} catch (err) {
		const cerror = new HttpError(
			'Internal error in addEntryByClub when retrieving event.',
			500
		);
		return next(error);
	}
	if (!event) {
		const error = new HttpError(
			'Internal error in addEntryByClub event not found.',
			500
		);
		return next(error);
	}

	let entryReport;
	try {
		entryReport = await EntryReport.findById(event.entryReportId);
	} catch (err) {
		const error = new HttpError(
			'`addEntryByClub process internal failure entryReport not found',
			404
		);
		return next(error);
	}
	if (!entryReport) {
		const error = new HttpError(
			'`addEntryByClub process internal failure entryReport not in DB',
			404
		);
		return next(error);
	}

	// find how many days
	let days = entryReport.entries.length;
	let payment;
	// Since we do not auto bump autolist so we will not touch event full and flag
	// we only modify entryReport.entries and entryReport.waitlist to remove entry from lists
	for (let i = 0; i < days; ++i) {
		if (i !== daySelected) {
			continue;
		}
		if (entry.waitlist[i]) {
			// Deal with entryReport
			// remove from entryreport waitlist
			let waitlist = entryReport.waitlist[i];
			let index = waitlist.indexOf(entryId);
			waitlist.splice(index, 1);
			entryReport.waitlist.set(i, waitlist);
			// add to entryReport entries
			// Since this is added by club, ignore event total participants and group cap
			// add entryId to the end of entrylist,
			// *** push does not work, need to make a copy of the original entry list to add to it, then use set to
			// *** re-assign the new entry list
			let newEntryList = entryReport.entries[i];
			newEntryList.push(entryId);
			entryReport.entries.set(i, newEntryList);
			// increase rungroup num
			let runGroupIndex = event.runGroupOptions[i].indexOf(
				entry.runGroup[i]
			);
			let runGroupNumEntries = entryReport.runGroupNumEntries[i];
			runGroupNumEntries[runGroupIndex]++;
			entryReport.runGroupNumEntries.set(i, runGroupNumEntries);

			// Deal with entry
			// remove from waitlist
			entry.waitlist.set(i, false);
			entry.groupWaitlist.set(i, false);

			// add entry fee
			// find answer of Registration option
			let answer = entry.answer;
			let answerRegistration = '';
			for (let i = 0; i < answer.length; ++i) {
				// Check name starts with "Registration", full name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
				if (answer[i].name.startsWith(REGISTRATION)) {
					// value is always at index 0
					// value: Array
					//      0: "regRadioOption_0"
					answerRegistration = answer[i].value[0];
					break;
				}
			}
			// calculate price
			let entryFormData = event.entryFormData;
			let dayPrice = '0';
			// find entryFormData with field_name starts with "Registration", full field_name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
			for (let i = 0; i < entryFormData.length; ++i) {
				if (entryFormData[i].field_name.startsWith(REGISTRATION)) {
					let options = entryFormData[i].options;
					for (let j = 0; j < options.length; ++j) {
						if (options[j].key === answerRegistration) {
							dayPrice = options[j].value;
							break;
						}
					}
					break;
				}
			}

			try {
				payment = await Payment.findById(entry.paymentId);
			} catch (err) {
				const error = new HttpError(
					'addEntryByClub process failed during retrieving payment. Please try again later.',
					500
				);
				return next(error);
			}
			if (!payment) {
				const error = new HttpError(
					'addEntryByClub process failed payment not found.',
					404
				);
				return next(error);
			}
			let totalPrice =
				parseFloat(payment.entryFee) + parseFloat(dayPrice);
			payment.entryFee = totalPrice.toString();
			payment.refundFee = totalPrice.toString();
			payment.stripeFee = (totalPrice * 0.029 + 0.3)
				.toFixed(2)
				.toString();
		}
	}

	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		await payment.save({ session: session });
		await entry.save({ session: session });
		// remove entryReport
		await entryReport.save({ session: session });
		// only both tasks succeed, we commit the transaction
		await session.commitTransaction();
	} catch (err) {
		console.log('2595 err = ', err);
		const error = new HttpError(
			'addEntryByClub Failed to add the entry to entry list.  Please try it later.',
			500
		);
		return next(error);
	}

	// once it's done, prepare to reutrn entrylist back to frontend
	// get entires
	let entries = entryReport.entries;
	// if there is no entry, should not have a waitlist, either.
	if (entries.length === 0) {
		res.status(404).json({
			entryData: [],
			waitlist: []
		});
	}

	let mutipleDayEntryData = [];
	for (let i = 0; i < days; ++i) {
		let entryData = [];
		let eList = entries[i];
		for (let j = 0; j < eList.length; ++j) {
			let entry;
			try {
				entry = await Entry.findById(eList[j]).populate('carId');
			} catch (err) {
				const error = new HttpError(
					'addEntryByClub Cannot find the entry in getEntryReport entry. Please try again later.',
					500
				);
				return next(error);
			}
			if (!entry) {
				const error = new HttpError(
					'addEntryByClub Internal error entry not found in getEntryReport.',
					500
				);
				return next(error);
			}

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
	let waitlist = entryReport.waitlist;
	let mutipleDayWaitlistData = [];
	for (let i = 0; i < days; ++i) {
		let waitlistData = [];
		let wList = waitlist[i];
		for (let j = 0; j < wList.length; ++j) {
			let entry;
			try {
				entry = await Entry.findById(wList[j]).populate('carId');
			} catch (err) {
				const error = new HttpError(
					'Cannot find the entry in getEntryReport waitlist. Please try again later.',
					500
				);
				return next(error);
			}
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
		entryData: mutipleDayEntryData.map(entryData =>
			entryData.map(data =>
				data.toObject({
					getters: true,
					transform: (doc, ret, opt) => {
						delete ret['userId'];
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
		)
	});
};

const deleteEntryByClub = async (req, res, next) => {
	let clubId = req.userData;
	// Validate event exists, if not send back an error.
	const entryId = req.params.entryId;
	let entry;
	try {
		entry = await Entry.findById(entryId).populate('eventId');
	} catch (err) {
		const error = new HttpError(
			'Internal error in deleteEntryByClub when retrieving entry.',
			500
		);
		return next(error);
	}
	// validat deletion is from same clubId
	if (clubId !== entry.clubId.toString()) {
		const error = new HttpError(
			'Not authorized to delete entry.',
			403
		);
		return next(error);
	}

	if (!entry) {
		// we should not find any entry here
		const error = new HttpError(
			'deleteEntryByClub User entry cannot be found.',
			400
		);
		return next(error);
	}

	// Validate userId exists. If not, sends back an error
	let user;
	// req.userData is inserted in check-auth.js
	let userId = entry.userId;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'deleteEntryByClub process failed during user validation. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'deleteEntryByClub faied with unauthorized request. Forgot to login?',
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
			`deleteEntryByClub process failed. Please check your data: ${result.array()}`,
			422
		);
		return next(error);
	}

	let event;
	try {
		event = await Event.findById(entry.eventId.id);
	} catch (err) {
		const error = new HttpError(
			'Internal error in deleteEntryByClub when retrieving event.',
			500
		);
		return next(error);
	}
	if (!event) {
		const error = new HttpError(
			'Internal error in deleteEntryByClub event not found.',
			500
		);
		return next(error);
	}

	let entryReport;
	try {
		entryReport = await EntryReport.findById(event.entryReportId);
	} catch (err) {
		const error = new HttpError(
			'`deleteEntryByClub process internal failure entryReport not found',
			404
		);
		return next(error);
	}
	if (!entryReport) {
		const error = new HttpError(
			'`deleteEntryByClub process internal failure entryReport not in DB',
			404
		);
		return next(error);
	}

	const { daySelected } = req.body;

	// find how many days
	let days = entryReport.entries.length;

	// todo: auto bump waitlist once entry drops out from entry list
	// Since we do not auto bump autolist so we will not touch event full flag
	// we only modify entryReport.entries and entryReport.waitlist to remove entry from lists

	// go over each day to find out if entry still registers on another day,
	// entry can only be removed if it's not registered on another day
	let removeEntry = true;
	let payment;
	for (let i = 0; i < days; ++i) {
		// only delete entry for the specified day
		if (i !== daySelected) {
			if (entry.runGroup[i] !== NOT_ATTENDING) {
				removeEntry = false;
			}
			continue;
		}
		if (entry.waitlist[i]) {
			// remove from waitlist
			let waitlist = entryReport.waitlist[i];
			let index = waitlist.indexOf(entryId);
			waitlist.splice(index, 1);
			entryReport.waitlist.set(i, waitlist);
		} else {
			// remove from entries
			let entryList = entryReport.entries[i];
			let index = entryList.indexOf(entryId);
			entryList.splice(index, 1);
			entryReport.entries.set(i, entryList);
			// -1 for runGroup
			// match event runGroupOptions
			const [runGroupIndex] = getRunGroupIndex(
				event.runGroupOptions[i],
				entry.runGroup[i]
			);
			if (event.runGroupOptions[i][runGroupIndex] === NOT_ATTENDING) {
				continue;
			}
			let num = entryReport.runGroupNumEntries[i][runGroupIndex];
			// workaround method to change an element value in a nested array array[i][j]
			// first retrieve array[i] => let array1 = [], array1 = array[i]
			// and modify it outside => array1[j]--
			// then use array.set(i, array1) to set array1 to array
			let runGroupNumEntries = [];
			runGroupNumEntries = entryReport.runGroupNumEntries[i];
			runGroupNumEntries[runGroupIndex]--;
			entryReport.runGroupNumEntries.set(i, runGroupNumEntries);
		}
		// change run group to NOT_ATTENDING
		entry.runGroup.set(i, NOT_ATTENDING);
		// -1 for totalEntries
		let numEntries = entryReport.totalEntries[i];
		entryReport.totalEntries.set(i, numEntries - 1);

		// deduct entry fee
		// find answer of Registration option
		let answer = entry.answer;
		let answerRegistration = '';
		for (let i = 0; i < answer.length; ++i) {
			// Check name starts with "Registration", full name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
			if (answer[i].name.startsWith(REGISTRATION)) {
				// value is always at index 0
				// value: Array
				//      0: "regRadioOption_0"
				answerRegistration = answer[i].value[0];
				break;
			}
		}
		// calculate price
		let entryFormData = event.entryFormData;
		let dayPrice = '0';
		// find entryFormData with field_name starts with "Registration", full field_name is "Registration-9E00A485-3458-4DA4-A8D1-FB6292ECA3F0"
		for (let i = 0; i < entryFormData.length; ++i) {
			if (entryFormData[i].field_name.startsWith(REGISTRATION)) {
				let options = entryFormData[i].options;
				for (let j = 0; j < options.length; ++j) {
					if (options[j].key === answerRegistration) {
						dayPrice = options[j].value;
						break;
					}
				}
				break;
			}
		}

		try {
			payment = await Payment.findById(entry.paymentId);
		} catch (err) {
			const error = new HttpError(
				'deleteEntryByClub process failed during retrieving payment. Please try again later.',
				500
			);
			return next(error);
		}
		if (!payment) {
			const error = new HttpError(
				'deleteEntryByClub Failed to delete the event @retrieving payment.  Please try it later.',
				404
			);
			return next(error);
		}
		let totalPrice =
			parseFloat(payment.entryFee) - parseFloat(dayPrice);
		payment.entryFee = totalPrice.toString();
		payment.refundFee = totalPrice.toString();
		payment.stripeFee = (totalPrice * 0.029 + 0.3)
			.toFixed(2)
			.toString();
	}

	// remove entry from user entries
	user.entries.pull(entryId);
	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		await user.save({ session: session });

		if (payment && removeEntry) {
			// remove payment for stripe payment if entry is not on any of event days
			await payment.remove({ session: session });
		} else if (payment && !removeEntry) {
			// save payment for stripe payment if entry is on any of event days
			await payment.save({ session: session });
		}
		if (removeEntry) {
			await entry.remove({ session: session });
		} else {
			await entry.save({ session: session });
		}
		// remove entryReport
		await entryReport.save({ session: session });
		// only all tasks succeed, we commit the transaction
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'deleteEntryByClub Failed to delete the entry.  Please try it later.',
			500
		);
		return next(error);
	}

	// prepare payment report
	// get entires
	let entries = entryReport.entries;
	// if there is no entry, should not have a waitlist, either.
	if (entries.length === 0) {
		res.status(404).json({
			entryData: [],
			waitlist: []
		});
	}
	let mutipleDayEntryData = [];
	for (let i = 0; i < days; ++i) {
		let entryData = [];
		let eList = entries[i];
		for (let j = 0; j < eList.length; ++j) {
			let entry;
			try {
				entry = await Entry.findById(eList[j]).populate('carId');
			} catch (err) {
				const error = new HttpError(
					'Cannot find the entry in getPaymentReport. Please try again later.',
					500
				);
				return next(error);
			}
			if (!entry) {
				const error = new HttpError(
					'Internal error entry not found in getPaymentReport.',
					500
				);
				return next(error);
			}

			let user;
			try {
				user = await User.findById(entry.userId);
			} catch (err) {
				const error = new HttpError(
					'Cannot find the user in getPaymentReport. Please try again later.',
					500
				);
				return next(error);
			}
			if (!user) {
				continue;
				// const error = new HttpError(
				// 	'Internal error user not found in getPaymentReport.',
				// 	500
				// );
				// return next(error);
			}
			// use {strict:false} to add undefined attribute in schema to existing json obj
			entry.set('email', user.email, { strict: false });
			// get payment data
			let payment;
			try {
				payment = await Payment.findById(entry.paymentId);
			} catch (err) {
				const error = new HttpError(
					'DB error at finding the payment in getPaymentReport. Please try again later.',
					500
				);
				return next(error);
			}
			if (!payment) {
				const error = new HttpError(
					'Cannot find the payment in getPaymentReport.',
					500
				);
				return next(error);
			}
			// adding entryFee and paymentMethod to entry to return to Frontend
			entry.set('entryFee', payment.entryFee, { strict: false });
			entry.set('stripeFee', payment.stripeFee, { strict: false });
			entry.set('paymentMethod', payment.paymentMethod, {
				strict: false
			});
			entry.set('paymentStatus', payment.paymentStatus, {
				strict: false
			});
			entry.set('refundFee', payment.refundFee, { strict: false });
			entryData.push(entry);
		}
		mutipleDayEntryData.push(entryData);
	}

	res.status(200).json({
		eventName: event.name,
		eventId: event.id,
		entryData: mutipleDayEntryData.map(entryData =>
			entryData.map(data =>
				data.toObject({
					getters: true,
					transform: (doc, ret, opt) => {
						delete ret['userId'];
						delete ret['userName'];
						delete ret['answer'];
						delete ret['groupWaitlist'];
						delete ret['raceClass'];
						delete ret['waitlist'];
						delete ret['workerAssignment'];
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
		lunchOptions: event.lunchOptions
	});
};

exports.createEntry = createEntry;
exports.updateCar = updateCar;
exports.updateClassNumber = updateClassNumber;
exports.updateFormAnswer = updateFormAnswer;
exports.updatePayment = updatePayment;
exports.deleteEntry = deleteEntry;
exports.getEntryFee = getEntryFee;
exports.chargeEntry = chargeEntry;
exports.updateRefundFee = updateRefundFee;
exports.refund = refund;
exports.updateEntryFee = updateEntryFee;
exports.authentication = authentication;
exports.updatePaymentStatus = updatePaymentStatus;
exports.addEntryByClub = addEntryByClub;
exports.deleteEntryByClub = deleteEntryByClub;
