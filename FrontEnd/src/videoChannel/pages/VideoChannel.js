import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import VideoList from '../components/VideoList';

import '../../shared/css/Events.css';

// Events is called in App.js where the route been defined
// @to-do
const Videos = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [loadedVideos, setLoadedVideos] = useState();

	useEffect(() => {
		const getVideos = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/videos/drivers/',
					'GET',
					null,
					{ 'Content-type': 'application/json' }
				);
				setLoadedVideos(responseData.videos);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		getVideos();
	}, []);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			<div className="mainpage-btn-group">
				<Link to="/events/" exact="exact" className="mainpage-button">
					Events
				</Link>
				<Link
					to="/videoChannel/"
					exact="exact"
					className="mainpage-button-active">
					Videos
				</Link>
			</div>
			<div className="search-page-header">
				<h4>
					<span>Top Drivers Videos</span>
				</h4>
			</div>
			{!isLoading && !loadedVideos && (
				<div>
					<p> &nbsp; &nbsp; &nbsp;No video found.</p>
				</div>
			)}
			{!isLoading && loadedVideos && (
				<VideoList items={loadedVideos} />
			)}
		</React.Fragment>
	);
};

export default Videos;
