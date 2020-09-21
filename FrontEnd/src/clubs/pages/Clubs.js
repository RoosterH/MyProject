import React, { useEffect, useState } from 'react';

import ClubsList from '../components/ClubsList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const Clubs = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [loadedClubs, setLoadedClubs] = useState();
	// if the dependency is empty, it will only run once
	// don't make useEffect function async, because useEffect does not want the
	// function returns a promise
	useEffect(() => {
		let mounted = true;
		const fetchClubs = async () => {
			try {
				// send GET request to backend
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/clubs'
				);

				/**
				 * this corresponds to back end clubsController.getAllClubs
				 * res.status(200).json({
				 *   clubs: clubs.map(club => club.toObject({ getters: true }))
				 * });
				 **/
				//
				setLoadedClubs(responseData.clubs);
			} catch (err) {}
		};
		if (mounted) {
			fetchClubs();
		}
		return () => (mounted = false);
	}, [sendRequest]);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{/* we only want to render ClubsList if loadClubs has something; otherwise 
			there will be an error */}
			{!isLoading && loadedClubs && <ClubsList items={loadedClubs} />}
		</React.Fragment>
	);
};

export default Clubs;
