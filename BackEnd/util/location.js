const axios = require('axios');

const HttpError = require('../models/httpError');

const API_KEY = 'AIzaSyACd-t1zWuethP3l-Ynqwhxr3h6jMZBxB4';

// https://developers.google.com/maps/documentation/geocoding/start
async function getCoordinatesForAddress(address) {
	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address
		)}&key=${API_KEY}`
	);

	const data = response.data;
	if (!data || data.status === 'ZERO_RESULTS') {
		const error = new HttpError(
			'Could not find location for the specified address.',
			422
		);
		throw error;
	}
	console.log(data);
	const cooridnates = data.results[0].geometry.location;

	return cooridnates;
}

module.exports = getCoordinatesForAddress;
