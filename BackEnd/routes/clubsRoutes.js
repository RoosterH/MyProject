/**
 * This route is for /api/clubs
 */
const express = require('express');
const { check } = require('express-validator');

const clubsController = require('../controllers/clubsController');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// /api/clubs
router.get('/', clubsController.getAllClubs);

router.get('/:cid', clubsController.getClubById);

router.post(
	'/signup',
	// single file, 'image' is the key name in the request body
	// that is associated with the uploading file
	fileUpload.single('image'),
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }),
		check('passwordValidation').isLength({ min: 6 })
	],
	clubsController.createClub
);

// Login, due to security reasons, we don't want to do express-validator for the input data
// because that will provide hints to hackers
router.post('/login', clubsController.loginClub);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkAuth);

// club logout
router.post('/logout', clubsController.logoutClub);

// update club info
router.patch(
	'/:cid',
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	clubsController.updateClub
);

// delete club
router.delete('/:cid', clubsController.deleteClub);

// /api/clubs/form/:eid
router.get('/form/:eid', clubsController.getEventForm);

// create event entry form
router.post(
	'/form/:eid',
	[check('task_data').not().isEmpty()],
	clubsController.createEventForm
);

module.exports = router;
