import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './VideoItem.css';

// EventsItem renders a card for each event
const EventsItem = props => {
	const videoId = props.videoId;
	const title = props.title;
	const channelTitle = props.channelTitle;
	// publishedAt format "2019-09-10T21:05:30Z"
	const publishedAt = props.publishedAt;
	let publishedAtStrs = publishedAt.split('T');
	let publishedDate = publishedAtStrs[0];
	return (
		<li className="videoitem-item">
			<Card className="videoitem-item__content">
				<div className="videoitem-item__image">
					<iframe
						width="320"
						height="180"
						src={
							`https://www.youtube.com/embed/` +
							videoId +
							'?rel=0&autoplay=0'
						}
						frameBorder="0"
						allowFullScreen></iframe>
				</div>
				<div className="videoitem-item__info">
					{/* <h2>{props.type}</h2> */}
					<div className="videoitem-item__eventName">{title}</div>
					<h4>by {channelTitle}</h4>
					<h2>published: {publishedDate}</h2>
				</div>
			</Card>
		</li>
	);
};

export default EventsItem;
