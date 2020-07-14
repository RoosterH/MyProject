/**
 * This route is for /api/users
 */
const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/usersController');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// /api/users
router.get('/', usersController.getAllUsers);

router.get('/:uid', usersController.getUserById);

router.post(
	'/signup',
	fileUpload.single('image'),
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }),
		check('passwordValidation').isLength({ min: 6 })
	],
	usersController.createUser
);

// login, due to security reasons, we don't want to do a check for the input data
router.post('/login', usersController.loginUser);

// adding checkAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkAuth);

router.post('/logout', usersController.logoutUser);

router.patch(
	'/:uid',
	[
		check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 })
	],
	usersController.updateUser
);

router.delete('/:uid', usersController.deleteUser);

module.exports = router;
