const axios = require('axios');

const HttpError = require('../models/httpError');

// https://developers.google.com/maps/documentation/geocoding/start
async function getCoordinatesForAddress(address) {
	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address
		)}&key=${process.env.GOOGLE_API_KEY}`
	);

	const data = response.data;
	if (!data || data.status === 'ZERO_RESULTS') {
		const error = new HttpError(
			'Could not find location for the specified address.',
			422
		);
		throw error;
	}
	const cooridnates = data.results[0].geometry.location;

	return cooridnates;
}

module.exports = getCoordinatesForAddress;
