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
	limit: 500000, // 500kB file size
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			// storage path
			cb(null, 'upload/images');
		},
		filename: (req, file, cb) => {
			// file extension
			const ext = MIME_TYPE_MAP[file.mimetype];
			// use uuid to generate a filename. The first param is for error
			cb(null, uuid() + '.' + ext);
		}
	}),
	fileFilter: (req, file, cb) => {
		// !! meaning converts undefiend or null to false
		const isValid = !!MIME_TYPE_MAP[file.mimetype];
		let error = isValid ? null : new Error('Invalid MIME type!');
		cb(error, isValid);
	}
});

module.exports = fileUpload;
