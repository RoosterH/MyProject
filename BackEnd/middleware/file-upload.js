const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const aws = require('aws-sdk');
const { v1: uuid } = require('uuid');
const sharp = require('sharp');

const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpg': 'jpg',
	'image/jpeg': 'jpeg'
};
const s3 = new aws.S3();

// s3 bucket policy:
// Deny NULL => s3:x-amz-server-side-encrption: "true", deny request if header is NULL is true
// Deny StringNotEquals => s3:x-amz-server-side-encrption: "AES256", deny if it's not AES256
aws.config.update({
	secretAccessKey: process.env.AWS_SECRETACCESSKEY,
	accessKeyId: process.env.AWS_ACCESSKEYID,
	region: process.env.S3_REGION
});

// Format of req.file using multer-s3-transform
// req.file =  {
// 	fieldname: 'carImage',
// 	originalname: 'Princess_Peach.png',
// 	encoding: '7bit',
// 	mimetype: 'image/png',
// 	transforms: [
// 	  {
// 		id: 'small',
// 		size: 43312,
// 		bucket: 'myseattime-dev',
// 		key: 'cars/small/c510d150-2776-11eb-89a5-25f841de659d-small.jpg',
// 		acl: 'public-read',
// 		contentType: 'image/png',
// 		metadata: [Object],
// 		location: 'https://myseattime-dev.s3.us-west-1.amazonaws.com/cars/small/c510d150-2776-11eb-89a5-25f841de659d-small.jpg',
// 		etag: '"2b3dbad5050460e3d6f3c5bc681d40c8"'
// 	  },
// 	  {
// 		id: 'original',
// 		size: 418497,
// 		bucket: 'myseattime-dev',
// 		key: 'cars/original/c510d150-2776-11eb-89a5-25f841de659d-original.jpg',
// 		acl: 'public-read',
// 		contentType: 'image/png',
// 		metadata: [Object],
// 		location: 'https://myseattime-dev.s3.us-west-1.amazonaws.com/cars/original/c510d150-2776-11eb-89a5-25f841de659d-original.jpg',
// 		etag: '"87043120ba61e0e084b303205991daf1"'
// 	  }
// 	]
//   }

let UUID;
const fileUpload = multer({
	limits: 1500000, // 1.5MB file size
	storage: multerS3({
		// public-read: Owner gets FULL_CONTROL. The AllUsers group gets READ access.
		// We need to use "authenticated-read" so users cannot directly GetObject from S3 bucket
		acl: process.env.S3_ACL,
		s3: s3,
		bucket: process.env.S3_BUCKET_NAME,
		// Need to provide serverSideEncryption in order to match bucket setting of Server-side encryption: Amazon S3 master-key (SSE-S3)
		serverSideEncryption: 'AES256',
		// Withoute contentType image will be downloaded instead of been displayed
		contentType: multerS3.AUTO_CONTENT_TYPE,
		metadata: (req, file, cb) => {
			const ext = MIME_TYPE_MAP[file.mimetype];
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			UUID = uuid();
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
		},
		shouldTransform: (req, file, cb) => {
			// is this an image type?
			cb(
				null,
				/^image/i.test(file.mimetype) &&
					file.fieldname !== 'courseMap' &&
					file.fieldname !== 'clubImage'
			);
		},
		transforms: [
			{
				id: 'original',
				key: (req, file, cb) => {
					// UUID = uuid();
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

					cb(
						null,
						S3Folder +
							'/' +
							'original' +
							'/' +
							UUID +
							'-original.webp'
					);
				},
				transform: (req, file, cb) => {
					cb(null, sharp().webp({ quality: 100 }));
				}
			},
			{
				id: 'small',
				key: (req, file, cb) => {
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
					cb(
						null,
						S3Folder + '/' + 'small' + '/' + UUID + '-small.webp'
					);
				},
				transform: (req, file, cb) => {
					cb(
						null,
						sharp().resize({ width: 300 }).webp({ quality: 100 })
					);
				}
			}
		]
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

// **** Example of how to store image in the local drive **** //
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
