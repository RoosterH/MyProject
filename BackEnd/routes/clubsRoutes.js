/**
 * This route is for /api/clubs
 */
const express = require('express');
const { check } = require('express-validator');

const clubsController = require('../controllers/clubsController');

const router = express.Router();

// /api/clubs
router.get('/', clubsController.getClubs);

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

router.post('/login', clubsController.loginClub);

router.patch('/:cid', clubsController.updateClub);

router.delete('/:cid', clubsController.deleteClub);

module.exports = router;
