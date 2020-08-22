import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import EventsList from '../../events/components/EventsList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';
import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';

import '../../events/pages/Events.css';

// Events is called in App.js where the route been defined
const UserEvents = () => {
	const [loadedEvents, setLoadedEvents] = useState();
	const userAuthContext = useContext(UserAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// useParams().{Id} Id need to match what defines in <Route path="/events/user/:userId" exact>
	let uId = useParams().userId;

	// We don't need to take care of page refreshing here because <Route path="/users/events/:userId" exact>
	// is added even if user is not logged in
	// If User is not logged in, we will re-direct to user login page.
	// authentication check. remember current path. We will use it to check if we are in the re-direct loop to
	// avoid validation loop
	useUserLoginValidation(`/users/events/${uId}`);
	let location = useLocation();
	useEffect(() => {
		// get current URL path
		let path = location.pathname;
		let userRedirectURL = userAuthContext.userRedirectURL;
		if (path === userRedirectURL) {
			// If we are re-directing to this page, we want to clear up userRedirectURL
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [userAuthContext, location]);

	useEffect(() => {
		const fetechEvents = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/users/events/${uId}`,
					'GET',
					null,
					{ Authorization: 'Bearer ' + userAuthContext.userToken }
				);
				setLoadedEvents(responseData.events);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		fetechEvents();
	}, [sendRequest, uId, userAuthContext]);

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
