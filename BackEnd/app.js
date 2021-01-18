const fs = require('fs'); // file system, a nodejs module
const path = require('path');

const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const clubsRoutes = require('./routes/clubsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const entriesRoutes = require('./routes/entriesRoutes');
const carsRoutes = require('./routes/carRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const stripeWebhookRoutes = require('./routes/stripeWebhookRoutes');
const videosRoutes = require('./routes/videosRoutes');
const HttpError = require('./models/httpError');

const app = express();

// ! this has to be placed above bodyParser.json()
// stripe webhook needs to use raw body to content type application/json need to use bodyParser.raw for Stripe webhook, otherwise it won't parse req.body correctly
app.use('/webhook', bodyParser.raw({ type: '*/*' }));

// bodyParser.json() will parse the json to js data structure such as array then call next automatically.
app.use(bodyParser.json());

// express.static() a middleware and returns the requested file
app.use(
	'/uploads/images',
	express.static(path.join('uploads', 'images'))
);

// this is to avoid CORS error
app.use((req, res, next) => {
	// add certain headers to the response so we can attach it to the response sent back
	// to the front end to work around CORS policy issue

	//'Access-Control-Allow-Origin', '*' means server accepts request sent from any end point
	// To specify an end point, we could do: 'Access-Control-Allow-Origin': '*'
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE'
	);

	next();
});

app.use(cors());
app.use('/api/cars/', carsRoutes);
app.use('/api/clubs/', clubsRoutes);
app.use('/api/entries/', entriesRoutes);
app.use('/api/events/', eventsRoutes);
app.use('/api/users/', usersRoutes);
app.use('/api/videos/', videosRoutes);
app.use('/api/stripe/', stripeRoutes);
app.use('/webhook/', stripeWebhookRoutes);

// this route is for the requests that are not in any of the routes
app.use((req, res, next) => {
	const error = new HttpError('Could not find this route.', 404);
	// we use throw here because it's synchronous
	throw error;
});

// this middleware is to check if there is any error occurring during
// request processing
app.use((error, req, res, next) => {
	// if req failed and it contains a file, we want to delete the file
	if (req.file) {
		// fs.unlink(req.file.path, err => {
		// 	console.log(err);
		// });
	}
	// req contains multiple files failed. delete them all
	if (req.files) {
		Object.keys(req.files).map(field => {
			// fs.unlink(req.files[field][0].path, err => {
			// 	console.log(err);
			// });
		});
	}
	// header has been sent meaning a response been sent already.
	// If that's the case, we want to return next and forward the error to it,
	// because we can only send the response once.
	// Usually that happens when there is a bug in the codes that we send
	// response back multiple times.
	if (res.headerSent) {
		return next(error);
	}
	// if error comes with a code, we use that code; otherwise send back 500
	res.status(error.code || 500);
	res.json(
		{ message: error.message } || 'An unknown error occurred!'
	);
});

// process.env defined in nodemon.json
mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@hungjencluster0-ahunv.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		app.listen(process.env.PORT || 5000);
	})
	.catch(err => {
		console.log(err);
	});
