const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubContactSchema = new Schema({
	address: { type: Object, required: true, default: {} },
	city: { type: Object, required: true, default: {} },
	state: { type: String, required: true, default: '' },
	zip: { type: String, required: true, default: '' },
	contactName: { type: String, required: true, default: '' },
	phone: { type: Object, required: true, default: {} }
});

module.exports = mongoose.model('ClubContact', clubContactSchema);
