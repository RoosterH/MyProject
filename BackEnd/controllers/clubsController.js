const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/httpError');

DUMMY_CLUBS = [
	{ id: 'c1', name: 'AAS', password: 'havefun', email: 'AAS@gmail.com' },
	{
		id: 'c2',
		name: 'SCCASFR',
		password: 'autocross',
		email: 'SCCASFR@gmail.com'
	},
	{ id: 'c3', name: 'GGLC', password: 'lotusisfun', email: 'GGLC@gmail.com' },
	{ id: 'c4', name: 'BMWCCA', password: 'bmwsucks', email: 'BMWCCA@gmail.com' }
];

// GET /api/clubs/
const getClubs = (req, res, next) => {
	if (DUMMY_CLUBS.length === 0) {
		return next(new HttpError('Could not find any clubs', 404));
	}

	res.status(200).json({ clubs: DUMMY_CLUBS });
};

// GET /api/clubs/:id
const getClubById = (req, res, next) => {
	clubId = req.params.cid;
	const club = DUMMY_CLUBS.find(c => c.id === clubId);
	if (!club) {
		return next(new HttpError('Could not find any club with provided ID'), 404);
	}

	res.status(200).json({ club: club });
};

// POST '/api/clubs/signup'
const createClub = (req, res, next) => {
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

	const { name, password, email } = req.body;
	const foundClub = DUMMY_CLUBS.find(c => c.email === email);
	if (foundClub) {
		return next(
			new HttpError('Could not create the club.  Email already exists', 422)
		);
	}

	// name => same as name: name
	const newClub = { id: uuidv4(), name, password, email };
	if (!newClub) {
		return next(
			new HttpError(
				'Server was not able to create a club account. Please try it again later.',
				500
			)
		);
	}

	DUMMY_CLUBS.push(newClub);
	res.status(201).json({ club: newClub });
};

// POST '/api/clubs/login'
const loginClub = (req, res, next) => {
	const { name, password, email } = req.body;

	const foundClub = DUMMY_CLUBS.find(e => e.name === name);

	if (!foundClub || foundClub.password !== password) {
		return next(new HttpError('Club not found.', 401));
	}

	res.status(201).json({ message: `Club ${foundClub.name} logged in.` });
};

// PATCH '/api/clubs/:cid'
const updateClub = (req, res, next) => {
	const { name, password, email } = req.body;

	const clubId = req.params.cid;

	const club = DUMMY_CLUBS.find(c => c.id === clubId);
	if (!club) {
		return next(new HttpError('Cannot find the club with provided ID'), 404);
	}

	const updatedClub = { ...DUMMY_CLUBS.find(c => c.id === clubId) };
	updatedClub.name = name;
	updatedClub.password = password;
	updatedClub.email = email;

	const clubIndex = DUMMY_CLUBS.findIndex(c => c.id === clubId);

	DUMMY_CLUBS[clubIndex] = updatedClub;
	res.status(200).json({ updatedClub: updatedClub });
};

// DELETE '/api/clubs/:cid'
const deleteClub = (req, res, next) => {
	const clubId = req.params.cid;

	const club = DUMMY_CLUBS.find(c => c.id === clubId);
	if (!club) {
		return next(new HttpError('Could not find any club with provided ID', 404));
	}

	DUMMY_CLUBS = DUMMY_CLUBS.filter(c => c.id !== clubId);
	const clubName = club.name;

	res.status(200).json({ message: `Club ${clubName} is deleted.` });
};

exports.getClubs = getClubs;
exports.getClubById = getClubById;
exports.createClub = createClub;
exports.loginClub = loginClub;
exports.updateClub = updateClub;
exports.deleteClub = deleteClub;
