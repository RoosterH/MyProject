const aws = require('aws-sdk'); // AWS SDK V2

// This function uses AWS SDK to simulate move a file from one folder to the other folder in the same bucket.
// 1. copy files from one folder to a different folder in the same bucket.
// 2. After copying, it deletes the original file.
const S3ImageProcess = fileLocation => {
	// fileLocation = https://myseattime-dev.s3.us-west-1.amazonaws.com/cars/faf21120-2533-11eb-a9c0-ed9f2385ef05.jpg-small
	let parseLocation = fileLocation.split('/');
	// bucket folder name, ie. 'cars'
	let folderName = parseLocation[parseLocation.length - 2];
	// fileName: faf21120-2533-11eb-a9c0-ed9f2385ef05.jpg-small
	let fileName = parseLocation[parseLocation.length - 1];
	// parse file name
	let parseFileName = fileName.split('.');
	// name: faf21120-2533-11eb-a9c0-ed9f2385ef05
	let name = parseFileName[parseFileName.length - 2];
	// extension: jpg-small
	let extensionSize = parseFileName[parseFileName.length - 1];
	// break extensionSize
	let parseExtensionSize = extensionSize.split('-');
	// size: small
	let size = parseExtensionSize[1];
	// ext: jpg
	let ext = parseExtensionSize[0];
	// assemble new name
	let newName = name + '-' + size + '.' + ext;
	console.log('size = ', size);
	console.log('newName  = ', newName);

	//const aws = require('@aws-sdk/client-s3/');
	const s3 = new aws.S3();

	// s3 bucket policy:
	// Deny NULL => s3:x-amz-server-side-encrption: "true", deny request if header is NULL is true
	// Deny StringNotEquals => s3:x-amz-server-side-encrption: "AES256", deny if it's not AES256
	aws.config.update({
		secretAccessKey: process.env.AWS_SECRETACCESSKEY,
		accessKeyId: process.env.AWS_ACCESSKEYID,
		region: process.env.S3_REGION
	});

	// copy new fileName
	var copyParams = {
		Bucket: process.env.S3_BUCKET_NAME,
		CopySource:
			'/' +
			process.env.S3_BUCKET_NAME +
			'/' +
			folderName +
			'/' +
			fileName,
		Key: folderName + '/' + size + '/' + newName,
		ACL: 'public-read'
	};

	// delete original file
	var deleteParams = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: folderName + '/' + fileName
	};

	try {
		s3.copyObject(copyParams, (err, data) => {
			if (err) {
				console.log('err in s3 copy = ', err);
				throw 'S3 copyObject Error. Please try again.';
			} else {
				console.log(data);
				// delete after copy, delete must happen if there is no error for copyObject
				s3.deleteObject(deleteParams, (err, data) => {
					if (err) {
						throw 'S3 deleteObject Error. Please try again.';
						// an error occurred
						// const error = new HttpError('S3 deleteObject error.', 500);
						// return err;
					} else {
						// successful response
						console.log(data);
					}
				});
			}
		});
	} catch (err) {
		throw err;
	}

	console.log(
		'return name = ',
		process.env.S3_URL + '/' + folderName + '/' + size + '/' + newName
	);
	return (
		// https://myseattime-dev.s3-us-west-1.amazonaws.com/cars/small/841f8a40-256b-11eb-bba5-bdc4f4521391-small.jpg
		process.env.S3_URL + '/' + folderName + '/' + size + '/' + newName
	);
};

exports.S3ImageProcess = S3ImageProcess;
