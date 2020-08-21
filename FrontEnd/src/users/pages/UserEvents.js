import React, { useEffect, useState, useContext } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import EventsList from '../../events/components/EventsList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';
import { UserAuthContext } from '../../shared/context/auth-context';

import '../../events/pages/Events.css';

// Events is called in App.js where the route been defined
const UserEvents = () => {
	const userAuth = useContext(UserAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [loadedEvents, setLoadedEvents] = useState();
	const uId = useParams().userId;
	useEffect(() => {
		const fetechEvents = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/users/events/${uId}`,
					'GET',
					null,
					{ Authorization: 'Bearer ' + userAuth.userToken }
				);
				setLoadedEvents(responseData);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		fetechEvents();
	}, [sendRequest, uId, userAuth.userToken]);

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
				<EventsList items={loadedEvents} displayPublished={false} />
			)}
		</React.Fragment>
	);
};

export default UserEvents;
