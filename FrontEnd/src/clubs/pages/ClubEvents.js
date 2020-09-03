import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import EventsList from '../../events/components/EventsList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

// Events is called in App.js where the route been defined
const ClubEvents = () => {
	console.log('inside clubevents');
	const [loadedEvents, setLoadedEvents] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const clubId = useParams().clubId;
	useEffect(() => {
		const fetechEvents = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/events/club/${clubId}`
				);
				console.log('responseData = ', responseData);
				setLoadedEvents(responseData.events);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		fetechEvents();
	}, [sendRequest, clubId]);

	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedEvents && (
				<EventsList items={loadedEvents} displayPublished={true} />
			)}
		</React.Fragment>
	);
};

export default ClubEvents;
