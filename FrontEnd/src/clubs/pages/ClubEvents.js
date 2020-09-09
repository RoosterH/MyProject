import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import EventsList from '../../events/components/EventsList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { UserAuthContext } from '../../shared/context/auth-context';

// Events is called in App.js where the route been defined
const ClubEvents = props => {
	const [loadedEvents, setLoadedEvents] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// let cid = useParams().clubId;
	// let clubId = props.clubId ? props.clubId : cid;
	let clubId = props.clubId;

	const clubAuthContext = useContext(ClubAuthContext);
	let ownerClubEvent = false;
	if (clubAuthContext && clubAuthContext.clubId === clubId) {
		ownerClubEvent = true;
	}

	useEffect(() => {
		const fetechEvents = async () => {
			try {
				let responseData;
				// For ownerClubEvent, use different route that will get all events owned by the club
				if (ownerClubEvent) {
					responseData = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/ownerClub/${clubId}`,
						'GET',
						null,
						{
							Authorization: 'Bearer ' + clubAuthContext.clubToken
						}
					);
				} else {
					// This route only gets published events
					responseData = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/club/${clubId}`
					);
				}
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
