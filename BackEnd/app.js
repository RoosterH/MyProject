const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const clubsRoutes = require('./routes/clubsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const HttpError = require('./models/httpError');

const app = express();

// bodyParser.json() will parse the json to js data structure such as array then call next automatically.
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));

// Express session
// rolling: forced the session identifier cookie to be set on every response.
// The expiration is reset to the original maxAge, resetting the expiration countdown.
app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true,
		rolling: true,
		maxAge: new Date(Date.now() + 3600)
	})
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// this is to avoid CORS error
app.use((req, res, next) => {
	// add certain headers to the response so we can attach it to the response sent back
	// to the front end to work around CORS policy issue

	/**
	 * Because requests initiated by js by default does not contain credentials(cookies
	 * or HTTP authentication). In order to keep Express Session persistent between React
	 * and Express. We need to add => credentials: 'include' to all the fetch calls to backend.
	 * For Backend, we will add 'Access-Control-Allow-Credentials', 'true' to accept js calls.
	 * For security reason, we need to set 'Access-Control-Allow-Origin' to the specific host that sends
	 * the request from due to security reason. => '*' can no longer be used.
	 */
	res.setHeader(
		'Access-Control-Allow-Origin',
		'http://localhost:3000'
	);
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-Width, Content-Type, Accept, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE'
	);

	next();
});

app.use('/api/events/', eventsRoutes);
app.use('/api/clubs/', clubsRoutes);
app.use('/api/users/', usersRoutes);

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
	res.json(
		{ message: error.message } || 'An unknown error occurred!'
	);
});

mongoose
	.connect(
		'mongodb+srv://hung:hung@hungjencluster0-ahunv.mongodb.net/MySeatTime?retryWrites=true&w=majority',
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		app.listen(5000);
	})
	.catch(err => {
		console.log(err);
	});
