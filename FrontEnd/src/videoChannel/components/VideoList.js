import React, { useContext } from 'react';

import VideoItem from './VideoItem';
import '../../shared/css/EventsList.css';

// treat this as a function looks like
// EventList(props.items), caller will call as <EventList items=(value to be passed in) \>
const VideoList = props => {
	if (props.items.length === 0) {
		return (
			<div className="events-list">
				<h2>No video found.</h2>
			</div>
		);
	}

	let videos = props.items;
	return (
		<ul className="events-list">
			{videos.map(video => (
				<VideoItem
					// In React, each child in the array should have a unique "key" prop
					// so when render it will only render one element not the whole array
					key={video.videoId}
					videoId={video.videoId}
					title={video.title}
					channelTitle={video.channelTitle}
					publishedAt={video.publishedAt}
				/>
			))}
		</ul>
	);
};

export default VideoList;
