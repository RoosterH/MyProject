const multer = require('multer');
const { v1: uuid } = require('uuid');

const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpg': 'jpg',
	'image/jpeg': 'jpeg'
};
// Execute multer as a function that we can pass configuration object.
// The result is the actual fileUpload middleware
const fileUpload = multer({
	limits: 1500000, // 1.5MB file size
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			// 1st param is error = null
			// 2nd param is storage path
			cb(null, 'uploads/images');
		},
		filename: (req, file, cb) => {
			// file extension
			const ext = MIME_TYPE_MAP[file.mimetype];
			// 1st param is error = null
			// 2nd is the filename
			cb(null, uuid() + '.' + ext);
		}
	}),
	fileFilter: (req, file, cb) => {
		// if extention is not defined in MIME_TYPE_MAP, it will return undefined
		// '!!' meaning converts undefiend or null to false
		// if it's defined !! will still be true
		const isValid = !!MIME_TYPE_MAP[file.mimetype];
		let error = isValid ? null : new Error('Invalid MIME type!');
		cb(error, isValid);
	}
});

module.exports = fileUpload;
