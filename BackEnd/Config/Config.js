const mongoose = require('mongoose');

// JWT private key
const JWT_PRIVATE_KEY = 'MySeatTime_38_718GT4_PDK';
exports.JWT_PRIVATE_KEY = JWT_PRIVATE_KEY;

// Dummy clubId from MySeatTime
const dummyClubId = mongoose.Types.ObjectId(
	'5ef702c7ba7511499165e653'
);
exports.DUMMY_CLUBID = dummyClubId;
