import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EventsList from '../../events/components/EventsList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import '../../shared/css/EventItem.css';

// Events is called in App.js where the route been defined
// From <ClubProfileViewerForUsers/ >, we use <Link>, use props.location.state to pass params
const ClubEventsForUsers = props => {
	const [clubId, setClubId] = useState();
	const [clubImage, setClubImage] = useState();
	const [clubName, setClubName] = useState();

	useEffect(() => {
		if (props && props.location && props.location.state) {
			setClubId(props.location.state.clubId);
			setClubName(props.location.state.clubName);
			setClubImage(props.location.state.clubImage);
		}
	}, [props, setClubId, setClubName, setClubImage]);

	const [loadedEvents, setLoadedEvents] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	useEffect(() => {
		const fetechEvents = async () => {
			try {
				let responseData;
				let responseStatus;
				let responseMessage;

				// This route only gets published events
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/events/club/${clubId}`
				);
				setLoadedEvents(responseData.events);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		if (clubId) {
			fetechEvents();
		}
	}, [sendRequest, clubId]);

	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && <LoadingSpinner asOverlay />}
			<div className="event-pages">
				<section id="header" title="">
					<div className="section-container">
						<div className="logo-container ">
							<img
								src={
									// props.event.clubImage
									clubImage
								}
								// alt={props.event.clubName}
								alt={clubName}
							/>
						</div>
						<div className="primary-info">
							{/* <h3 className="header-title">{props.event.name}</h3> */}
							{/* <h3 className="header-title">{eventName}</h3> */}
						</div>
						<div className="clubname-container">
							From{' '}
							<Link
								to={{
									pathname: `/clubs/${clubId}`,
									state: {
										clubName: clubName
									}
								}}>
								{clubName}{' '}
							</Link>
						</div>
					</div>

					<br />
					{/* displayPublished: print PUBLISHED on images
				    readOnly true- for Club ViewEvent; false- for all others
				    registration: true- Club Registration Manager */}
					{!isLoading && loadedEvents && (
						<div>
							<EventsList
								items={loadedEvents}
								displayPublished={false}
								readOnly={true}
							/>
						</div>
					)}
				</section>
			</div>
		</React.Fragment>
	);
};

export default ClubEventsForUsers;
