import React, { useState, useEffect } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';

import EventItem from '../components/EventItem';

// Events is called in App.js where the route been defined
// @to-do
const Event = () => {
	const [loadedEvent, setLoadedEvent] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const eId = useParams().id;
	useEffect(() => {
		const fetechEvents = async () => {
			try {
				const responseData = await sendRequest(
					`http://localhost:5000/api/events/${eId}`
				);
				setLoadedEvent(responseData.event);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		fetechEvents();
	}, [sendRequest, eId]);

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
			{!isLoading && loadedEvent && <EventItem event={loadedEvent} />}
		</React.Fragment>
	);
};

export default Event;
