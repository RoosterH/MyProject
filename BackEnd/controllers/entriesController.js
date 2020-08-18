const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Event = require('../models/event');
const Club = require('../models/club');

const config = require('../Config/Config');
const JWT_PRIVATE_KEY = config.JWT_PRIVATE_KEY;

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

const createEntry = async (req, res, next) => {
	// we need to get answer from body
	const { answer } = req.body;

	// Validate clubId exists. If not, sends back an error
	let user;
	// req.userData is inserted in check-auth.js
	let userId = req.userData.userId;
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

	// Validate eventId belonging to the found club. If not, sends back an error
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

	// overwrite the old formData, reason for it because to figure out what to/not to replace
	// is tidious and error prone, we are not going to have a form with a lot of data so hopefully
	// it won't impact performace by much.
	if (answer && answer.length > 0) {
		entries.answer = [];
		answer.map(data => entries.answer.push(data));
		// whenever entry form gets changed, always set published to false
		entries.published = true;
	}

	const newEntry = new Entry({
		userId,
		userName,
		clubId,
		clubName,
		eventId,
		eventName,
		answer,
		time,
		published
	});

	try {
		await newEntry.save();
		await event.save();
		await user.save();
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

exports.createEntry = createEntry;
