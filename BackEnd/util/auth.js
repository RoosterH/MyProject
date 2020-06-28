const HttpError = require('../models/httpError');

// use req.isAuthenticated provided by passport to make sure user is logged in for
// certain operations
module.exports = {
	ensureAuthenticated: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		return next(
			new HttpError('Logging in required. Please log in.', 401)
		);
	},
	forwardAuthenticated: function (req, res, next) {
		if (!req.isAuthenticated()) {
			return new HttpError(
				'Logging in required. Please log in.',
				401
			);
		}
		return next();
	}
};
