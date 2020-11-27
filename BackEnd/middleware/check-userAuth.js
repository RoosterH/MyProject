const jwt = require('jsonwebtoken');

const HttpError = require('../models/httpError');

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

// export a middleware function
// this funtion takes the request from client and verify its token.
// Once verified, we add clubId to req.userData so clubId will be available
// in the requests passing to REST APIs
module.exports = (req, res, next) => {
	// For certain browsers, by default it sends an 'OPTION' request
	// before sending the actual request, except GET.  It's to test if
	// server permits the to be sent requests.  For 'OPTION' request, there
	// is no token inside. We simply let it pass.
	if (req.method === 'OPTIONS') {
		return next();
	}

	/**
	 * Discussion of where to put the token
	 * 1. req.body: some API requests such as GET/DELETE do not come with
	 *    body so this is not a good idea
	 * 2. query parms in url ?token=abc: it's valid but preferred using header
	 * 3. req.headers cleaner without attaching to url
	 */

	// headers() is coming from express js
	/**
	 * In App.js, we define
	 * res.setHeader('Access-Control-Allow-Headers',
	 *  'Origin, X-Requested-Width, Content-Type, Accept, Authorization');
	 * authorization header is included.
	 */

	// syntax in the header is => Authorization: 'Bearer TOKEN'
	// so split(' ')[1] = TOKEN
	try {
		const token = req.headers.authorization.split(' ')[1];
		if (!token) {
			// this throw will go into outer catch
			throw new Error('Authentication failed!');
		}
		// verify request token against server token generated from private key
		const decodedToken = jwt.verify(token, JWT_PRIVATE_KEY);

		// add data to the request
		req.userData = decodedToken.userId;
		next();
	} catch (err) {
		const error = new HttpError(
			'Authentication failed. Login required',
			401
		);
		return next(error);
	}
};
