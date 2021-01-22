const fs = require('fs'); // file system, a nodejs module
const moment = require('moment');
const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const { google } = require('googleapis');
const Video = require('../models/video');
const VideoUpdate = require('../models/videoUpdate');
// read YouTube user/playlist IDs from videoList
const {
	newUserList,
	newPlaylist,
	userList,
	playlist
} = require('../util/videoList');

// GET /api/videos/drivers called when drivers video page first opens
// we want to retrieve new videos since last updated then return first page contents
const getDriverVideos = async (req, res, next) => {
	// page starts from 0
	let page = req.params.page;
	// pageSize = num of videos per page
	let pageSize = req.params.pageSize;

	const CREDENTIALS = process.env.GOOGLE_API_KEY;
	Youtube = google.youtube('v3');

	// get the latest video in DB and use its publishedAt date to retrieve newer videos from YouTube
	let latestVideo;
	let lastestVideoTimeStamp = moment(
		'2019-01-01T00:00:00Z'
	).toISOString();
	// only query YouTube if last query was more than 180 minutes ago
	const updateInterval = 180;
	try {
		latestVideo = await Video.findOne({ videoType: 'driver' }).sort({
			publishedAt: -1
		});
	} catch (err) {
		console.log(
			'VideosController getDriverVideos find latestVideo error = ',
			err
		);
		const error = new HttpError(
			'getDriverVideos find latestVideo error',
			500
		);
	}
	if (latestVideo) {
		lastestVideoTimeStamp = moment(
			latestVideo.publishedAt
		).toISOString();
	}

	let numberItems = 25;
	let snippetArray = [];
	// update new added userList up to lastestVideoTimeStamp starting from
	for (let i = 0; i < newUserList.length; ++i) {
		let user = newUserList[i];
		// route 1, use YouTube user name to get latest uploads playlist
		let channelConfig = {
			key: CREDENTIALS,
			part: 'contentDetails',
			forUsername: user
		};

		let channelContents;
		try {
			channelContents = await Youtube.channels.list(channelConfig);
		} catch (err) {
			const error = new HttpError(
				'Error fetching YouTube channel.',
				500
			);

			return next(error);
		}
		// Get the uploads playlist Id
		let uploadsPlaylistId =
			channelContents.data.items[0].contentDetails.relatedPlaylists
				.uploads;

		// created at or after the specified time.
		let playlistConfig = {
			part: 'snippet',
			maxResults: numberItems,
			playlistId: uploadsPlaylistId,
			key: CREDENTIALS
		};

		// Fetch items from upload playlist
		let playlistItems;
		try {
			playlistItems = await Youtube.playlistItems.list(
				playlistConfig
			);
		} catch (err) {
			console.log(
				'videosController fetching YouTube playlist items err = ',
				err
			);
			const error = new HttpError(
				'Error fetching YouTube playlist items.',
				500
			);

			return next(error);
		}
		// insert to snippetArray
		for (let j = 0; j < playlistItems.data.items.length; ++j) {
			// filter out videos published before lastestVideoTimeStamp
			if (
				moment(
					playlistItems.data.items[j].snippet.publishedAt
				).isAfter(moment(lastestVideoTimeStamp)) ||
				moment(
					playlistItems.data.items[j].snippet.publishedAt
				).isBefore(moment('2019-01-01T00:00:00Z'))
			) {
				continue;
			}
			snippetArray.push(playlistItems.data.items[j].snippet);
		}
	}

	// update newPlaylist
	for (let i = 0; i < newPlaylist.length; ++i) {
		let uploadsPlaylistId = newPlaylist[i];
		let playlistConfig = {
			part: 'snippet',
			maxResults: numberItems,
			playlistId: uploadsPlaylistId,
			key: CREDENTIALS
		};
		// Fetch items from playlist
		let playlistItems;
		try {
			playlistItems = await Youtube.playlistItems.list(
				playlistConfig
			);
		} catch (err) {
			const error = new HttpError(
				'Error fetching YouTube playlist items.',
				500
			);

			return next(error);
		}
		for (let j = 0; j < playlistItems.data.items.length; ++j) {
			if (
				moment(
					playlistItems.data.items[j].snippet.publishedAt
				).isAfter(moment(lastestVideoTimeStamp)) ||
				moment(
					playlistItems.data.items[j].snippet.publishedAt
				).isBefore(moment('2019-01-01T00:00:00Z'))
			) {
				continue;
			}
			snippetArray.push(playlistItems.data.items[j].snippet);
		}
	}

	// Google API has quota so we only want to query the videos from YouTube again
	// if last update was done more than 10 minutes ago
	let lastUpdate;
	let lastUpdateTime = moment().add(-180, 'minutes');
	let now = moment();
	let updateNow = false;
	try {
		lastUpdate = await VideoUpdate.findOne({
			videoType: 'driver'
		}).sort({
			publishedAt: -1
		});
	} catch (err) {
		console.log(
			'VideosController getDriverVideos find VideoUpdate error = ',
			err
		);
		const error = new HttpError(
			'Some error occurred while finding last update driver video.',
			500
		);

		return next(error);
	}
	if (lastUpdate) {
		lastUpdateTime = lastUpdate.time;
	}

	if (now.diff(lastUpdateTime, 'minutes') >= updateInterval) {
		updateNow = true;
		let newUpdate = new VideoUpdate({
			time: now,
			videoType: 'driver'
		});
		try {
			await newUpdate.save();
		} catch (err) {
			console.log(
				'VideosController getDriverVideos newUpdate save error = ',
				err
			);
			const error = new HttpError(
				'VideoController Some error occurred while updating videoUpdate.',
				500
			);

			return next(error);
		}
	}

	let userArray = userList;
	if (updateNow) {
		for (let i = 0; i < userArray.length; ++i) {
			let user = userArray[i];
			// route 1, use YouTube user name to get latest uploads playlist
			let channelConfig = {
				key: CREDENTIALS,
				part: 'contentDetails',
				forUsername: user
			};

			let channelContents;
			try {
				channelContents = await Youtube.channels.list(channelConfig);
			} catch (err) {
				const error = new HttpError(
					'Error fetching YouTube channel.',
					500
				);

				return next(error);
			}
			// Get the uploads playlist Id
			let uploadsPlaylistId =
				channelContents.data.items[0].contentDetails.relatedPlaylists
					.uploads;

			// created at or after the specified time.
			let playlistConfig = {
				part: 'snippet',
				maxResults: numberItems,
				playlistId: uploadsPlaylistId,
				key: CREDENTIALS
			};

			// Fetch items from upload playlist
			let playlistItems;
			try {
				playlistItems = await Youtube.playlistItems.list(
					playlistConfig
				);
			} catch (err) {
				console.log(
					'videosController fetching YouTube playlist items err = ',
					err
				);
				const error = new HttpError(
					'Error fetching YouTube playlist items.',
					500
				);

				return next(error);
			}
			// insert to snippetArray
			for (let j = 0; j < playlistItems.data.items.length; ++j) {
				// filter out videos published before lastestVideoTimeStamp
				if (
					moment(
						playlistItems.data.items[j].snippet.publishedAt
					).isSameOrBefore(moment(lastestVideoTimeStamp))
				) {
					continue;
				}
				snippetArray.push(playlistItems.data.items[j].snippet);
			}
		}
	}

	// route 2 use playlist Id to fetch videos
	let uploadsPlaylistIdArray = playlist;

	// created at or after the specified time.
	if (updateNow) {
		for (let i = 0; i < uploadsPlaylistIdArray.length; ++i) {
			let uploadsPlaylistId = uploadsPlaylistIdArray[i];
			let playlistConfig = {
				part: 'snippet',
				maxResults: numberItems,
				playlistId: uploadsPlaylistId,
				key: CREDENTIALS
			};
			// Fetch items from playlist
			let playlistItems;
			try {
				playlistItems = await Youtube.playlistItems.list(
					playlistConfig
				);
			} catch (err) {
				const error = new HttpError(
					'Error fetching YouTube playlist items.',
					500
				);

				return next(error);
			}
			for (let j = 0; j < playlistItems.data.items.length; ++j) {
				if (
					moment(
						playlistItems.data.items[j].snippet.publishedAt
					).isSameOrBefore(moment(lastestVideoTimeStamp))
				) {
					continue;
				}
				snippetArray.push(playlistItems.data.items[j].snippet);
			}
		}
	}

	// remove duplicates in case dfferent playlists continging the same video
	snippetArray = snippetArray.filter(
		(video, index, self) =>
			index ===
			self.findIndex(
				t => t.resourceId.videoId === video.resourceId.videoId
			)
	);

	// put new videos in DB
	let newVideoArray = [];
	for (let i = 0; i < snippetArray.length; ++i) {
		let foundVideo;
		// make sure we did not have the video before adding it to DB
		try {
			foundVideo = await Video.findOne({
				videoId: snippetArray[i].resourceId.videoId
			});
		} catch (err) {
			const error = new HttpError(
				'Error finding video from DB.',
				500
			);

			return next(error);
		}

		if (foundVideo) {
			console.log('found duplicates');
			continue;
		}
		let newVideo = new Video({
			videoId: snippetArray[i].resourceId.videoId,
			publishedAt: snippetArray[i].publishedAt,
			channelId: snippetArray[i].channelId,
			title: snippetArray[i].title,
			description: snippetArray[i].description,
			channelTitle: snippetArray[i].channelTitle,
			playlistId: snippetArray[i].playlistId,
			videoType: 'driver'
		});
		newVideoArray.push(newVideo);
	}

	// ** if there are a lot of new videos found, it actually takes longer time
	// ** to finish writing to DB before paginate queries, since this is not a critical
	// ** task, we won't set a timeout to slow down performance
	try {
		newVideoArray.map(async newVideo => {
			await newVideo.save();
		});
	} catch (err) {
		console.log('videoControllers 325 err = ', err);
		const error = new HttpError(
			'Some error occurred while saving driver videos.',
			500
		);

		return next(error);
	}

	// offset: quantity of items to skip
	// limit: quantity of items to fetch
	// total 8 items
	// – { offset: 3 }: skip first 3 items, fetch 5 remaining items.
	// – { limit: 2 }: fetch first 2 items.
	// – { offset: 3, limit: 2 }: skip first 3 items, fetch 4th and 5th items.
	const limit = pageSize ? +pageSize : 4;
	const offset = page ? page * limit : 0;

	// ! await not working so we need to use promises
	let foundVideos;
	Video.paginate(
		{},
		{ offset: offset, limit: limit, sort: { publishedAt: -1 } }
	)
		.then(result => {
			// result.docs
			// result.totalDocs = 100
			// result.limit = 100
			// result.page = 1
			// result.totalPages = 1
			// result.hasNextPage = false
			// result.nextPage = null
			// result.hasPrevPage = false
			// result.prevPage = null
			// result.pagingCounter = 1
			res.status(200).json({
				docs: result.docs,
				totalDocs: result.totalDocs,
				totalPages: result.totalPages
			});
		})
		.catch(err => {
			console.log('videoControllers 325 err = ', err);
			const error = new HttpError(
				'Some error occurred while retrieving driver videos.',
				500
			);

			return next(error);
		});
};

exports.getDriverVideos = getDriverVideos;
