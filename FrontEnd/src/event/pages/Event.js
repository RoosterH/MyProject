import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';

import EventItem from '../components/EventItem';
import EditEventItem from '../components/EditEventItem';
// import EntryReportManager from '../components/EntryReportEventItem';
import { ClubAuthContext } from '../../shared/context/auth-context';
import EntryReportEventItem from '../components/EntryReportEventItem';
import PaymentCenterEventItem from '../components/PaymentCenterEventItem';
import RefundCenterEventItem from '../components/RefundCenterEventItem';
import DataCenterEventItem from '../components/DataCenterEventItem';

// Events is called in App.js where the route been defined
// 2 routes to call Event component
// 1. path={'/events/:id'}
// 2. In EventsItem <Link to={{pathname: `/events/${props.id}`, state: {props: props}}}> via EventWrapper
const Event = props => {
	// if useParams() has id meaning, this is called by pasting an event link in the browser
	// use case such as a private event
	let eId = useParams().id;
	const clubAuthContext = useContext(ClubAuthContext);
	// props is passed via Link in the format of state: {props: props}
	// we need to get the props value using props.location.state.props.id
	let clubId,
		readOnly,
		entryReportManager,
		paymentCenter,
		refundCenter,
		dataCenter;
	// if called by pasting event link to the browser, props.location.state === undefined
	if (props.location.state !== undefined) {
		eId = props.location.state.props.id;
		clubId = props.location.state.props.clubId;

		// readOnly is to control OwnerClub View Events, we do not want to go to <EditEventItem> route
		readOnly = props.location.state.props.readOnly;
		// entryReportManager is to direct the path to Entry Report Manager
		entryReportManager =
			props.location.state.props.entryReportManager;
		paymentCenter = props.location.state.props.paymentCenter;
		refundCenter = props.location.state.props.refundCenter;
		dataCenter = props.location.state.props.dataCenter;
	}

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
					!entryReportManager &&
					!paymentCenter &&
					!refundCenter &&
					!dataCenter
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
				} else if (
					clubId === clubAuthContext.clubId &&
					paymentCenter
				) {
					// This route is for owner club to query payment report
					[
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/paymentReport/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + clubAuthContext.clubToken
						}
					);
					setClubOwnerRequest(true);
					setLoadedEntryData(responseData);
				} else if (
					clubId === clubAuthContext.clubId &&
					refundCenter
				) {
					// This route is for owner club to query payment report
					[
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/paymentReport/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + clubAuthContext.clubToken
						}
					);
					setClubOwnerRequest(true);
					setLoadedEntryData(responseData);
				} else if (clubId === clubAuthContext.clubId && dataCenter) {
					// This route is for owner club to query payment report
					[
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/events/paymentReport/${eId}`,
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
				!entryReportManager &&
				!paymentCenter &&
				!refundCenter && <EditEventItem event={loadedEvent} />}
			{/* For Entry Report readOnly = true && entryReportManager = true */}
			{!isLoading &&
				loadedEntryData &&
				clubOwnerRequest &&
				readOnly &&
				entryReportManager && (
					<EntryReportEventItem entryReportData={loadedEntryData} />
				)}
			{/* For Payment Center Report readOnly = true && paymentCenter = true */}
			{!isLoading &&
				loadedEntryData &&
				clubOwnerRequest &&
				readOnly &&
				paymentCenter && (
					<PaymentCenterEventItem
						paymentCenterData={loadedEntryData}
					/>
				)}
			{/* For Refund Center Report readOnly = true && refundCenter = true */}
			{!isLoading &&
				loadedEntryData &&
				clubOwnerRequest &&
				readOnly &&
				refundCenter && (
					<RefundCenterEventItem refundCenterData={loadedEntryData} />
				)}
			{/* For Data Center Report readOnly = true && dataCenter = true */}
			{!isLoading &&
				loadedEntryData &&
				clubOwnerRequest &&
				readOnly &&
				dataCenter && (
					<DataCenterEventItem dataCenterData={loadedEntryData} />
				)}
			{/* For users, clubs don't own the event, and OwnerClub wants to view event, we will go to
			EventItem */}
			{!isLoading &&
				loadedEvent &&
				clubOwnerRequest &&
				readOnly &&
				!entryReportManager && (
					<EventItem event={loadedEvent} clubReadOnly={true} />
				)}
			{/* For users, clubs don't own the event, and OwnerClub wants to view event, we will go to
			EventItem */}
			{!isLoading && loadedEvent && !clubOwnerRequest && (
				<EventItem event={loadedEvent} />
			)}
		</React.Fragment>
	);
};

export default Event;
