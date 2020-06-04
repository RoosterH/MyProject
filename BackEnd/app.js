const express = require('express');
const bodyParser = require('body-parser');

const clubsRoutes = require('./routes/clubsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const HttpError = require('./models/httpError');
const app = express();

// bodyParser.json() will parse the json to js data structure such as array then call next automatically.
app.use(bodyParser.json());

app.use('/api/events/', eventsRoutes);
app.use('/api/clubs/', clubsRoutes);

// this route is for the requests that are not in any of the routes
app.use((req, res, next) => {
	const error = new HttpError('Could not find this route.', 404);
	// we use throw here because it's synchronous
	throw error;
});

// this route is
app.use((error, req, res, next) => {
	// Check if header has been sent meaning a response been sent already.
	// If that's the case, we want to return next and forward the error to it,
	// because we can only send the response once.
	if (res.headerSent) {
		return next(error);
	}
	// if error comes with a code, we use that code; otherwise send back 500
	res.status(error.code || 500);
	res.json({ message: error.message } || 'An unknown error occurred!');
});

app.listen(5000);
