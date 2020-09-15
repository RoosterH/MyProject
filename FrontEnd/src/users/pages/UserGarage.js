import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import UserCarsList from '../components/UserCarsList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';
import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';

import '../../shared/css/Events.css';

// Events is called in App.js where the route been defined
const UserGarage = props => {
	// check if the caller is CarSelector
	const carSelector = props.carSelector;
	const userId = props.userId;

	const [loadedCars, setLoadedCars] = useState();
	const userAuthContext = useContext(UserAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// useParams().{Id} Id need to match what defines in <Route path="/cars/users/:userId" exact>

	// We don't need to take care of page refreshing here because <Route path="/cars/users/:userId" exact>
	// is added even if user is not logged in
	// If User is not logged in, we will re-direct to user login page.
	// authentication check. remember current path. We will use it to check if we are in the re-direct loop to
	// avoid validation loop
	useUserLoginValidation(`/users/garage/${userId}`);
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
				let responseData;
				if (carSelector) {
					responseData = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/cars/users/${userId}`,
						'POST',
						JSON.stringify({ active: true }),
						{
							'Content-type': 'application/json',
							Authorization: 'Bearer ' + userAuthContext.userToken
						}
					);
				} else {
					responseData = await sendRequest(
						process.env.REACT_APP_BACKEND_URL +
							`/cars/users/${userId}`,
						'POST',
						JSON.stringify({ active: false }),
						{
							'Content-type': 'application/json',
							Authorization: 'Bearer ' + userAuthContext.userToken
						}
					);
				}
				setLoadedCars(responseData.cars);
				// Check who's viewing the garage. If it's from owner, store data under localStorage 'userData'
				// otherwise store in 'garages' with different userId
				if (userId === userAuthContext.userId) {
					let userData = JSON.parse(localStorage.getItem('userData'));
					userData.garage = responseData.cars;
					localStorage.setItem('userData', JSON.stringify(userData));
				} else {
					console.log('not the owner');
					let garages = JSON.parse(localStorage.getItem('garages'))
						? JSON.parse(localStorage.getItem('garages'))
						: [];
					garages.push({ userId: responseData.cars });
					localStorage.setItem('garages', JSON.stringify(garages));
				}
			} catch (err) {
				console.log('err = ', err);
			}
		};
		fetechEvents();
	}, [sendRequest, userId, userAuthContext]);

	const carSelectorStatus = status => {
		props.carSelectorStatus(status);
	};

	const carIdHandler = carId => {
		props.carIdHandler(carId);
	};

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
			{!isLoading && loadedCars && !carSelector && (
				<UserCarsList items={loadedCars} carSelector={false} />
			)}
			{!isLoading && loadedCars && carSelector && (
				<UserCarsList
					items={loadedCars}
					carSelector={true}
					carSelectorStatus={carSelectorStatus}
					carIdHandler={carIdHandler}
				/>
			)}
			{!isLoading && !loadedCars && !carSelector && (
				<div>
					<p> &nbsp; &nbsp; &nbsp;No car in the garage. </p>
				</div>
			)}
			{!isLoading && !loadedCars && carSelector && (
				<div>
					<p>
						{' '}
						&nbsp; &nbsp; &nbsp;No car in the garage. You must add a
						car to enter the event.
					</p>
				</div>
			)}
		</React.Fragment>
	);
};

export default UserGarage;
