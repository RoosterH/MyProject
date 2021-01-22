const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const videoSchema = new Schema({
	videoId: { type: String, require: true },
	publishedAt: { type: Date, require: true },
	channelId: { type: String, require: true },
	title: { type: String, require: true },
	description: { type: String, require: true },
	// channelTitle: 'Bryan Heitkotter',
	channelTitle: { type: String, require: true },
	playlistId: { type: String, require: true },
	// type: 'driver', 'instruction'
	videoType: { type: String, require: true }
});

videoSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Video', videoSchema);
