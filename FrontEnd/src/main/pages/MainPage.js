import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Events from '../../events/pages/Events';
import Videos from '../../videoChannel/pages/VideoChannel';
import './MainPage.css';

// basically MainPage only displays Event page for now.  Reason for it because we want to have
// distint URL for eventPage and videoPage.
const MainPage = () => {
	const [eventPage, setEventPage] = useState(false);
	const [videoPage, setVideoPage] = useState(false);
	const [eventClassName, setEventClassName] = useState(
		'mainpage-button'
	);
	const [videoChannelClassName, setVideoChannelClassName] = useState(
		'mainpage-button'
	);

	if (!eventPage && !videoPage) {
		setEventPage(true);
	}

	const eventPageHandler = () => {
		setEventPage(true);
		setVideoPage(false);
		setEventClassName('mainpage-button-active');
		setVideoChannelClassName('mainpage-button');
	};
	const videoPageHandler = () => {
		setEventPage(false);
		setVideoPage(true);
		setEventClassName('mainpage-button');
		setVideoChannelClassName('mainpage-button-active');
	};

	return (
		<React.Fragment>
			{eventPage && <Events />}
			{videoPage && <Videos />}
		</React.Fragment>
	);
};

export default MainPage;
