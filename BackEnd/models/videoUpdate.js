const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// this table records last YouTube query time, because YouTube Data API has quota,
// we don't want to query new videos for every request,
// currently we only query if the last query time was more than 10 minutes ago
// otherwise, we will just load from our own DB
const videoUpdateSchema = new Schema({
	time: { type: Date, require: true },
	videoType: { type: String, require: true }
});

module.exports = mongoose.model('VideoUpdate', videoUpdateSchema);
