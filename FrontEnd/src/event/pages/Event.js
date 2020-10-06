import React, { useState, useEffect, useContext } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';

import EventItem from '../components/EventItem';
import EditEventItem from '../components/EditEventItem';
// import EntryReportManager from '../components/EntryReportEventItem';
import { ClubAuthContext } from '../../shared/context/auth-context';
import EntryReportEventItem from '../components/EntryReportEventItem';

// Events is called in App.js where the route been defined
// 2 routes to call Event component
// 1. path={'/events/:id'}
// 2. In EventsItem <Link to={{pathname: `/events/${props.id}`, state: {props: props}}}> via EventWrapper
const Event = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	// props is passed via Link in the format of state: {props: props}
	// we need to get the props value using props.location.state.props.id
	const eId = props.location.state.props.id;
	const clubId = props.location.state.props.clubId;
	// readOnly is to control OwnerClub View Events, we do not want to go to <EditEventItem> route
	const readOnly = props.location.state.props.readOnly;
	// entryReportManager is to direct the path to Entry Report Manager
	const entryReportManager =
		props.location.state.props.entryReportManager;

	const [clubOwnerRequest, setClubOwnerRequest] = useState(false);
	const [loadedEvent, setLoadedEvent] = useState();
	const [loadedEventName, setLoadedEventName] = useState();
	const [loadedEntryData, setLoadedEntryData] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// 3 different routes here.
	// 1. Request from owner club for the event, backend returns all the event information for furture editing.
	//    This avoids multiple requests to the backend.
	// 2. Owner club gets event entry report
	// 3. The other is the general request.  This request will get limited info from backend.
	// *** No dependency here as intended.  This is to avoid re-renderng in EditEventManager to send request to backend again
	useEffect(() => {
		const fetechEvents = async () => {
			try {
				let responseData, responseStatus, responseMessage;
				if (
					clubId === clubAuthContext.clubId &&
					!entryReportManager
				) {
					// this route is for owner club to query an owned event
					[
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/ownerClubEvent/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + clubAuthContext.clubToken
						}
					);
					setClubOwnerRequest(true);
					setLoadedEvent(responseData.event);
				} else if (
					clubId === clubAuthContext.clubId &&
					entryReportManager
				) {
					// This route is for owner club to query entry report
					[
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/entryreport/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + clubAuthContext.clubToken
						}
					);
					setClubOwnerRequest(true);
					setLoadedEntryData(responseData);
				} else {
					// this route is to query an event from users
					[
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL + `/events/${eId}`
					);
					setLoadedEvent(responseData.event);
				}
			} catch (err) {}
		};
		fetechEvents();
	}, []);

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
			{/* For club who owns the event, we will go to EditEventItem */}
			{!isLoading &&
				loadedEvent &&
				clubOwnerRequest &&
				!readOnly &&
				!entryReportManager && <EditEventItem event={loadedEvent} />}
			{/* For Entry Report readOnly = true && entryReportManager = true */}
			{!isLoading &&
				loadedEntryData &&
				clubOwnerRequest &&
				readOnly &&
				entryReportManager && (
					<EntryReportEventItem entryReportData={loadedEntryData} />
				)}
			{/* For users, clubs don't own the event, and OwnerClub wants to view event, we will go to
			EventItem */}
			{!isLoading &&
				loadedEvent &&
				(!clubOwnerRequest ||
					(clubOwnerRequest && readOnly && !entryReportManager)) && (
					<EventItem event={loadedEvent} />
				)}
		</React.Fragment>
	);
};

export default Event;
