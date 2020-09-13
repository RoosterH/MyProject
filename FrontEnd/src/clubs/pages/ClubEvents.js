import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import EventsList from '../../events/components/EventsList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

// Events is called in App.js where the route been defined
const ClubEvents = props => {
	// readoOnly false is for Club EditEvents; true is for Club EventManager View Events and users and non-owner club
	let readOnly = props.readOnly ? props.readOnly : false;
	// registration is true is for Registration Manager
	let entryReportManager = props.entryReportManager
		? props.entryReportManager
		: false;

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
				// ownerClubEvent gets all events, published/unpublished
				// non-owner gets only published events
				if (ownerClubEvent) {
					// for registration reports, we will only query published events
					if (entryReportManager) {
						responseData = await sendRequest(
							process.env.REACT_APP_BACKEND_URL +
								`/events/ownerClubPublished/${clubId}`,
							'GET',
							null,
							{
								Authorization: 'Bearer ' + clubAuthContext.clubToken
							}
						);
					} else {
						responseData = await sendRequest(
							process.env.REACT_APP_BACKEND_URL +
								`/events/ownerClub/${clubId}`,
							'GET',
							null,
							{
								Authorization: 'Bearer ' + clubAuthContext.clubToken
							}
						);
					}
				} else {
					console.log('clubId = ', clubId);
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
	}, [sendRequest, clubId, entryReportManager]);

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
				// displayPublished: print PUBLISHED on images
				// readOnly true- for Club ViewEvent; false- for all others
				// registration: true- Club Registration Manager
				<EventsList
					items={loadedEvents}
					displayPublished={true}
					readOnly={readOnly}
					entryReportManager={entryReportManager}
				/>
			)}
		</React.Fragment>
	);
};

export default ClubEvents;
