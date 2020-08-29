const fs = require('fs'); // file system, a nodejs module

const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const mongoose = require('mongoose');

const Car = require('../models/car');
const User = require('../models/user');
const fileUpload = require('../middleware/file-upload');
const { request } = require('http');

const errMsg = errors => {
	var msg;
	for (var e of errors) {
		msg + e.param;
	}
	return msg;
};

// GET /api/cars/:cid
const getCarById = async (req, res, next) => {
	// req.params is getting the eid from url, such as /api/cars/:cid
	const carId = req.params.cid;
	let car;
	try {
		car = await Car.findById(carId);
	} catch (err) {
		// this error is displayed if the request to the DB had some issues
		const error = new HttpError(
			'Get car by ID process failed. Please try again later.',
			500
		);
		return next(error);
	}

	// this error is for DB not be able to find the car with provided ID
	if (!car) {
		const error = new HttpError(
			'Could not find the car with the provided id',
			404
		);
		return next(error);
	}

	// check if user owns the car
	const userId = req.userData;
	if (userId != car.userId && !car.share) {
		res.status(200).json({
			car: car.toObject({
				getters: true,
				// use transform to filter out password
				transform: (doc, ret, opt) => {
					delete ret['FrontPressure'];
					delete ret['RearPressure'];
					delete ret['LFCamber'];
					delete ret['RFCamber'];
					delete ret['LRCamber'];
					delete ret['RRCamber'];
					delete ret['LFCaster'];
					delete ret['RFCaster'];
					delete ret['LFToe'];
					delete ret['RFToe'];
					delete ret['FrontToe'];
					delete ret['LRToe'];
					delete ret['RRToe'];
					delete ret['RearToe'];
					delete ret['FBar'];
					delete ret['RBar'];
					delete ret['FRebound'];
					delete ret['RRebound'];
					delete ret['FCompression'];
					delete ret['RCompression'];
					delete ret['note'];
					return ret;
				}
			})
		});
	} else {
		// convert Mongoose object to a normal js object and get rid of _ of _id using getters: true
		res.status(200).json({ car: car.toObject({ getters: true }) }); // { car } => { car: car }
	}
};

// GET /api/cars/user/:uid
const getCarsByUserId = async (req, res, next) => {
	const uId = req.params.uid;

	let user;
	try {
		user = await User.findById(uId).populate('garage');
	} catch (err) {
		const error = new HttpError(
			'Get cars by user ID process failed. Please try again later',
			500
		);
		return next(error);
	}
	if (!user) {
		const error = new HttpError('Could not find the user.', 404);
		return next(error);
	}
	if (!user.garage || user.garage.length === 0) {
		// const error = new HttpError('Could not find any car.', 404);
		// return next(error);
		res.status(404).json({
			cars: []
		});
		return next();
	}

	// check if request is coming from the same person
	// if not, we need to chectk share setting for each car
	if (req.userData != uId) {
		res.status(200).json({
			cars: user.garage.map(car => {
				if (!car.share) {
					car: car.toObject({
						getters: true,
						// use transform to filter out password
						transform: (doc, ret, opt) => {
							delete ret['FrontPressure'];
							delete ret['RearPressure'];
							delete ret['LFCamber'];
							delete ret['RFCamber'];
							delete ret['LRCamber'];
							delete ret['RRCamber'];
							delete ret['LFCaster'];
							delete ret['RFCaster'];
							delete ret['LFToe'];
							delete ret['RFToe'];
							delete ret['FrontToe'];
							delete ret['LRToe'];
							delete ret['RRToe'];
							delete ret['RearToe'];
							delete ret['FBar'];
							delete ret['RBar'];
							delete ret['FRebound'];
							delete ret['RRebound'];
							delete ret['FCompression'];
							delete ret['RCompression'];
							delete ret['note'];
							return ret;
						}
					});
				} else {
					car.toObject({
						getters: true
					});
				}
			})
		});
	} else {
		res.status(200).json({
			cars: user.garage.map(car =>
				car.toObject({
					getters: true
				})
			)
		});
	}
};

// POST /api/cars/
const createCar = async (req, res, next) => {
	// validate request, req checks are defined in carRoutes.js using
	// express-validator
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorFormatter = ({ value, msg, param, location }) => {
			return `${param} : ${msg} `;
		};
		const result = validationResult(req).formatWith(errorFormatter);
		return next(
			new HttpError(
				`Create car process failed. Please check your data: ${result.array()}`,
				422
			)
		);
	}

	// we need to get the data from body
	const {
		year,
		make,
		model,
		trimLevel,
		tireBrand,
		tireName,
		tireFrontWidth,
		tireFrontDiameter,
		tireFrontRatio,
		tireRearWidth,
		tireRearDiameter,
		tireRearRatio,
		share,
		FrontPressure,
		RearPressure,
		LFCamber,
		RFCamber,
		LRCamber,
		RRCamber,
		LFCaster,
		RFCaster,
		LFToe,
		RFToe,
		FrontToe,
		LRToe,
		RRToe,
		RearToe,
		FBar,
		RBar,
		FRebound,
		RRebound,
		FCompression,
		RCompression,
		note
	} = req.body;

	// Validate user exists. If not, sends back an error
	let user;
	let userId = req.userData.userId;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			'Create car process failed. Please try again later.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Create car failure. Unauthorized request.',
			401
		);
		return next(error);
	}

	let imagePath = req.files.image[0].path;
	const newCar = new Car({
		userId: userId,
		userName: user.name,
		active: true,
		year,
		make,
		model,
		trimLevel,
		image: imagePath,
		tireBrand,
		tireName,
		tireFrontWidth,
		tireFrontDiameter,
		tireFrontRatio,
		tireRearWidth,
		tireRearDiameter,
		tireRearRatio,
		share,
		FrontPressure,
		RearPressure,
		LFCamber,
		RFCamber,
		LRCamber,
		RRCamber,
		LFCaster,
		RFCaster,
		LFToe,
		RFToe,
		FrontToe,
		LRToe,
		RRToe,
		RearToe,
		FBar,
		RBar,
		FRebound,
		RRebound,
		FCompression,
		RCompression,
		note
	});

	try {
		/**
		 * 2 operations here: 1. save the car to DB. 2. store the car ID to user
		 * create a session for transaction, transaction is atomic meaning a logical unit
		 * of work must be either completed with all of its data modifications, or none
		 * of them is performed. Also it's isolated, modifications of data must be independent
		 * of another transaction.
		 **/
		const session = await mongoose.startSession();
		session.startTransaction();
		await newCar.save({ session: session });
		/**
		 * push here is not an array push method. Instead it's a Mongoose method that
		 * establishes connection between two models which are user and car in this case.
		 * Behind the scence, Mongo DB grabs newCar ID and adds it to cars field of the
		 * user.
		 **/
		user.garage.push(newCar);
		await user.save({ session: session });
		// only both tasks succeed, we commit the transaction
		await session.commitTransaction();
	} catch (err) {
		console.log('err = ', err);
		const error = new HttpError(
			'Create car failed. Please try again later.',
			500
		);
		return next(error);
	}

	res.status(201).json({ car: newCar.toObject({ getters: true }) });
};

// PATCH /api/cars/:cid
const updateCar = async (req, res, next) => {};

// PATCH /api/activate/:cid
const activateCar = async (req, res, next) => {};

const deleteCar = async (req, res, next) => {};

// export a pointer of the function
exports.getCarById = getCarById;
exports.getCarsByUserId = getCarsByUserId;
exports.createCar = createCar;
exports.updateCar = updateCar;
exports.activateCar = activateCar;
exports.deleteCar = deleteCar;
