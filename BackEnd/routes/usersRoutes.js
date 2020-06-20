/**
 * This route is for /api/users
 */
const express = require('express');
const { check } = require('express-validator');

const clubsController = require('../controllers/clubsController');

const router = express.Router();

// /api/clubs
router.get('/', clubsController.getAllClubs);

router.get('/:cid', clubsController.getClubById);

router.post(
	'/signup',
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	clubsController.createClub
);

// login, due to security reasons, we don't want to do a check for the input data
router.post('/login', clubsController.loginClub);

router.patch(
	'/:cid',
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	clubsController.updateClub
);

router.delete('/:cid', clubsController.deleteClub);

module.exports = router;
