const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const numberTableSchema = new Schema({
	clubId: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Club'
	},
	strart: { type: Number },
	end: { type: Number },
	openNumbers: [{ type: Number }]
});

// 1st argument is the name will be used as the collection name in MongoDB,
// 'Event' will be converted to 'events' in MongoDB
// 2nd argument is the schema that will be used to create the object
module.exports = mongoose.model('NumberTable', numberTableSchema);
