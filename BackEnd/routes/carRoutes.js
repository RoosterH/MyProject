/**
 * This route is for /api/users
 */
const express = require('express');
const { check } = require('express-validator');

const carsController = require('../controllers/carsController');
const fileUpload = require('../middleware/file-upload');
const checkUserAuth = require('../middleware/check-userAuth');

const router = express.Router();

// adding checkUserAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkUserAuth);

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
router.get('/:cid', carsController.getCarById);

router.get('/users/:uid', carsController.getCarsByUserId);

// only users are able to create an car
router.post(
	'/',
	fileUpload.fields([{ name: 'image', maxCount: 1 }]),
	[
		(check('year').isLength({ min: 4 }),
		check('make').isLength({ min: 2 }),
		check('model').isLength({ min: 2 }),
		check('tireBrand').isLength({ min: 5 }),
		check('tireName').isLength({ min: 2 }))
	],
	carsController.createCar
);

router.patch(
	'/:cid',
	fileUpload.fields([{ name: 'image', maxCount: 1 }]),
	[
		(check('year').isLength({ min: 4 }),
		check('make').isLength({ min: 2 }),
		check('model').isLength({ min: 2 }),
		check('tireBrand').isLength({ min: 5 }),
		check('tireName').isLength({ min: 5 }))
	],
	carsController.updateCar
);

router.patch('/activate/:cd', carsController.activateCar);

router.delete('/:cid', carsController.deleteCar);

module.exports = router;
