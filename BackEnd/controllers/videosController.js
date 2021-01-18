const fs = require('fs'); // file system, a nodejs module
const moment = require('moment');
const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const { google } = require('googleapis');

// GET /api/cars/:cid
const getDriverVideos = async (req, res, next) => {
	const CREDENTIALS = process.env.GOOGLE_API_KEY;
	Youtube = google.youtube('v3');

	// Bryan Heitkotter: bryanmr2
	// James Yom: PLEhwsZi0dkhn6iJuf0KZPOGMZSs4UgztX
	// Jeff/Nicole Wong: PLr4IGVM7FLU38Wym15ODgjtbsRreKirOd
	let numberItems = 4;
	let snippetArray = [];

	let userArray = ['bryanmr2'];
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
			const error = new HttpError(
				'Error fetching YouTube playlist items.',
				500
			);

			return next(error);
		}

		// insert to snippetArray
		for (let j = 0; j < playlistItems.data.items.length; ++j) {
			snippetArray.push(playlistItems.data.items[j].snippet);
		}
	}

	// route 2 use playlist Id to fetch videos
	let uploadsPlaylistIdArray = [
		'PLEhwsZi0dkhn6iJuf0KZPOGMZSs4UgztX',
		'PLr4IGVM7FLU38Wym15ODgjtbsRreKirOd'
	];

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
			snippetArray.push(playlistItems.data.items[j].snippet);
		}
	}

	snippetArray.sort((a, b) => {
		var aISOTime = new Date(a.publishedAt);
		var bISOTime = new Date(b.publishedAt);
		// descending ordedr
		if (moment(aISOTime).isAfter(moment(bISOTime))) {
			return -1;
		} else if (moment(aISOTime).isBefore(moment(bISOTime))) {
			return -1;
		}

		return 0;
	});

	// return the latest 10 videos
	let videoArray = [];
	for (let i = 0; i < 10 && snippetArray.length >= 10; ++i) {
		videoArray.push(snippetArray[i]);
	}
	res.status(200).json({
		// videos: playlistItems.data.items.map(item => item.snippet)
		videos: videoArray
	});
};

exports.getDriverVideos = getDriverVideos;
