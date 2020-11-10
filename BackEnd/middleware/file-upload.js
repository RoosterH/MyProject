const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const { v1: uuid } = require('uuid');
const { connect } = require('mongoose');

const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpg': 'jpg',
	'image/jpeg': 'jpeg'
};
// Execute multer as a function that we can pass configuration object.
// The result is the actual fileUpload middleware
// const fileUpload = multer({
// 	limits: 1500000, // 1.5MB file size
// 	storage: multer.diskStorage({
// 		destination: (req, file, cb) => {
// 			// 1st param is error = null
// 			// 2nd param is storage path
// 			cb(null, 'uploads/images');
// 		},
// 		filename: (req, file, cb) => {
// 			// file extension
// 			const ext = MIME_TYPE_MAP[file.mimetype];
// 			// 1st param is error = null
// 			// 2nd is the filename
// 			cb(null, uuid() + '.' + ext);
// 		}
// 	}),
// 	fileFilter: (req, file, cb) => {
// 		// if extention is not defined in MIME_TYPE_MAP, it will return undefined
// 		// '!!' meaning converts undefiend or null to false
// 		// if it's defined !! will still be true
// 		const isValid = !!MIME_TYPE_MAP[file.mimetype];
// 		let error = isValid ? null : new Error('Invalid MIME type!');
// 		cb(error, isValid);
// 	}
// });
const s3 = new aws.S3();

// s3 bucket policy:
// Deny NULL => s3:x-amz-server-side-encrption: "true", deny request if header is NULL is true
// Deny StringNotEquals => s3:x-amz-server-side-encrption: "AES256", deny if it's not AES256
aws.config.update({
	secretAccessKey: process.env.AWS_SECRETACCESSKEY,
	accessKeyId: process.env.AWS_ACCESSKEYID,
	region: process.env.S3_REGION
});

const fileUpload = multer({
	limits: 1500000, // 1.5MB file size
	storage: multerS3({
		acl: 'public-read', // Owner gets FULL_CONTROL. The AllUsers group gets READ access.
		s3: s3,
		bucket: process.env.S3_BUCKET_NAME,
		// No need to provide serverSideEncryption, just click on S3 bucket or folder to enable it
		// serverSideEncryption: 'AES256',
		// Withoute contentType image will be downloaded instead of been displayed
		contentType: multerS3.AUTO_CONTENT_TYPE,
		metadata: (req, file, cb) => {
			const ext = MIME_TYPE_MAP[file.mimetype];
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			const UUID = uuid();
			const ext = MIME_TYPE_MAP[file.mimetype];

			let S3Folder;
			if (file.fieldname === 'userImage') {
				S3Folder = 'users';
			} else if (file.fieldname === 'clubImage') {
				S3Folder = 'clubs';
			} else if (file.fieldname === 'eventImage') {
				S3Folder = 'events';
			} else if (file.fieldname === 'courseMap') {
				S3Folder = 'courseMaps';
			} else if (file.fieldname === 'carImage') {
				S3Folder = 'cars';
			}

			cb(null, S3Folder + '/' + UUID + '.' + ext);
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
