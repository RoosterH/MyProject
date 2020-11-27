const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = process.env.CRYPTO_SECRET_KEY;
const iv = crypto.randomBytes(16);

const Encrypt = text => {
	const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
	const encrypted = Buffer.concat([
		cipher.update(text),
		cipher.final()
	]);

	return {
		iv: iv.toString('hex'),
		content: encrypted.toString('hex')
	};
};

const Decrypt = hash => {
	const decipher = crypto.createDecipheriv(
		algorithm,
		secretKey,
		Buffer.from(hash.iv, 'hex')
	);

	const decrpyted = Buffer.concat([
		decipher.update(Buffer.from(hash.content, 'hex')),
		decipher.final()
	]);

	return decrpyted.toString();
};

function decrypt(text) {
	let iv = Buffer.from(text.iv, 'hex');
	let encryptedText = Buffer.from(text.encryptedData, 'hex');
	let decipher = crypto.createDecipheriv(
		'aes-256-cbc',
		Buffer.from(key),
		iv
	);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

module.exports = {
	Encrypt,
	Decrypt
};
