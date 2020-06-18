import React, { useEffect, useState } from 'react';

import ClubsList from '../components/ClubsList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const Clubs = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();
	const [loadedClubs, setLoadedClubs] = useState();

	// if the dependency is empty, it will only run once
	// don't make useEffect function async, because useEffect does not want the
	// function returns a promise
	useEffect(() => {
		const sendRequest = async () => {
			setIsLoading(true);
			try {
				// send GET request to backend
				const response = await fetch(
					'http://localhost:5000/api/clubs'
				);
				const responseData = await response.json();

				if (!response.ok) {
					throw new Error(responseData.message);
				}
				/**
				 * this corresponds to back end clubsController.getAllClubs
				 * res.status(200).json({
				 *   clubs: clubs.map(club => club.toObject({ getters: true }))
				 * });
				 **/
				//
				setLoadedClubs(responseData.clubs);
			} catch (err) {
				setError(err.message);
			}
			setIsLoading(false);
		};
		sendRequest();
	}, []);

	const errorHandler = () => {
		setError(null);
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={errorHandler} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{/* we onlt want to render ClubsList if loadClubs has something; otherwise 
			there will be an error */}
			{!isLoading && loadedClubs && <ClubsList items={loadedClubs} />}
		</React.Fragment>
	);
};

export default Clubs;
