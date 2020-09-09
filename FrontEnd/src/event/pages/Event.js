import React, { useState, useEffect, useContext } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams, useLocation } from 'react-router-dom';

import EventItem from '../components/EventItem';
import { ClubAuthContext } from '../../shared/context/auth-context';

// Events is called in App.js where the route been defined
// path={'/events/:id'}
const Event = props => {
	const clubAuthContext = useContext(ClubAuthContext);

	// props is passed via Link in the format of state: {props: props}
	// we need to get the props value using props.location.state.props.id
	const eId = props.location.state.props.id;
	const clubId = props.location.state.props.clubId;
	const [clubOwnerRequest, setClubOwnerRequest] = useState(false);

	useEffect(() => {
		if (clubId === clubAuthContext.clubId) {
			setClubOwnerRequest(true);
		}
	}, [clubId, clubAuthContext, setClubOwnerRequest]);

	const [loadedEvent, setLoadedEvent] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// 2 different routes here.
	// 1. Request from owner club for the event, backend returns all the event information for furture editing.
	//    This avoids multiple requests to the backend.
	// 2. The other is the general request.  This request will get limited info from backend.
	useEffect(() => {
		const fetechEvents = async () => {
			try {
				let responseData;
				if (clubOwnerRequest) {
					responseData = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/ownerClubEvent/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + clubAuthContext.clubToken
						}
					);
				} else {
					responseData = await sendRequest(
						process.env.REACT_APP_BACKEND_URL + `/events/${eId}`
					);
				}
				setLoadedEvent(responseData.event);
				console.log('event = ', responseData.event);
			} catch (err) {}
		};
		fetechEvents();
	}, [sendRequest, eId, setLoadedEvent, clubOwnerRequest]);

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
