import React, { useEffect, useState } from 'react';

import EventsList from '../components/EventsList';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

// Events is called in App.js where the route been defined
// @to-do
const Events = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [loadedEvents, setLoadedEvents] = useState();
	useEffect(() => {
		const fectchEvents = async () => {
			try {
				const responseData = await sendRequest(
					'http://localhost:5000/api/events'
				);
				setLoadedEvents(responseData.events);
			} catch (err) {}
		};
		fectchEvents();
	}, [sendRequest]);

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
				<EventsList items={loadedEvents} />
			)}
		</React.Fragment>
	);
};

export default Events;
