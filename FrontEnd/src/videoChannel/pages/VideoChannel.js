import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@material-ui/lab/Pagination';

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

	// pagination
	const [currentVidoe, setCurrentVideo] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(-1);
	// const [searchTitle, setSearchTitle] = useState("");

	const [page, setPage] = useState(1);
	const [count, setCount] = useState(0);
	const [pageSize, setPageSize] = useState(4);

	const pageSizes = [4, 6, 8];

	const getRequestParams = (searchTitle, page, pageSize) => {
		let params = {};

		if (page) {
			params['page'] = page - 1;
		}

		if (pageSize) {
			params['size'] = pageSize;
		}

		return params;
	};

	// set which page to view
	const handlePageChange = (event, value) => {
		setPage(value);
	};

	// set how many videos per page
	const handlePageSizeChange = event => {
		setPageSize(event.target.value);
		setPage(1);
	};

	useEffect(() => {
		const getVideos = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/videos/drivers/${page - 1}/${pageSize}`,
					'GET',
					null,
					{ 'Content-type': 'application/json' }
				);
				setLoadedVideos(responseData.docs);
				setCount(responseData.totalPages);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		getVideos();
	}, [page, pageSize]);

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
			<div className="col-md-6">
				<h4>Top Drivers Videos</h4>

				<div className="mt-3">
					{'Vidoes per Page: '}
					{/* select how many videos to display on a page */}
					<select onChange={handlePageSizeChange} value={pageSize}>
						{pageSizes.map(size => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>

					{/* use onChange to get the page number */}
					<Pagination
						className="my-3"
						count={count}
						page={page}
						siblingCount={2}
						boundaryCount={2}
						variant="outlined"
						shape="rounded"
						onChange={handlePageChange}
					/>
				</div>
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
