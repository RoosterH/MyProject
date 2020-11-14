/**
 * This route is for /api/users
 */
const express = require('express');
const { check } = require('express-validator');

const carsController = require('../controllers/carsController');
const fileUpload = require('../middleware/file-upload');
// const fileUploadResizeS3 = require('../middleware/file-uploadResizeS3');
const checkUserAuth = require('../middleware/check-userAuth');

const router = express.Router();

// adding checkUserAuth middleware here will ensure all the requests below
// need to be authenticated
router.use(checkUserAuth);

router.post('/users/:uid', carsController.getCarsByUserId);

// pass the pointer of the function, we don't want to execute here.
// Express will use the pointer to execute the function when it's needed
router.get('/:cid', carsController.getCarById);

// only users are able to create an car
router.post(
	'/',
	// fileUploadResizeS3.single('carImage'),
	fileUpload.single('carImage'),
	[
		(check('active').isEmpty(),
		check('year').isLength({ min: 4 }),
		check('make').isLength({ min: 2 }),
		check('model').isLength({ min: 2 }),
		check('tireBrand').isLength({ min: 5 }),
		check('tireName').isLength({ min: 2 }),
		check('tireFrontWidth').isLength({ min: 3 }, { max: 3 }),
		check('tirFrontRatio').isLength({ min: 2 }, { max: 2 }),
		check('tireFrontDiameter').isLength({ min: 2 }, { max: 2 }),
		check('tireRearWidth').isLength({ min: 3 }, { max: 3 }),
		check('tirRearRatio').isLength({ min: 2 }, { max: 2 }),
		check('tireRearDiameter').isLength({ min: 2 }, { max: 2 })),
		check('image').isEmpty(),
		check('note').isLength({ max: 350 })
	],
	carsController.createCar
);

router.patch('/activate/:cid', carsController.activateCar);

router.patch(
	'/:cid',
	// fileUploadResizeS3.single('carImage'),
	fileUpload.single('carImage'),
	[
		(check('active').isEmpty(),
		check('year').isLength({ min: 4 }),
		check('make').isLength({ min: 2 }),
		check('model').isLength({ min: 2 }),
		check('tireBrand').isLength({ min: 5 }),
		check('tireName').isLength({ min: 5 }),
		check('tireFrontWidth').isLength({ min: 3 }, { max: 3 }),
		check('tirFrontRatio').isLength({ min: 2 }, { max: 2 }),
		check('tireFrontDiameter').isLength({ min: 2 }, { max: 2 }),
		check('tireRearWidth').isLength({ min: 3 }, { max: 3 }),
		check('tirRearRatio').isLength({ min: 2 }, { max: 2 }),
		check('tireRearDiameter').isLength({ min: 2 }, { max: 2 })),
		check('note').isLength({ max: 350 })
	],
	carsController.updateCar
);

router.delete('/:cid', carsController.deleteCar);

module.exports = router;
