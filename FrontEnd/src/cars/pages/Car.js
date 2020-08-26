import React, { useState, useEffect } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';

import CarItem from '../components/CarItem';

// Cars is called in App.js where the route been defined
// path={'/cars/:id'}
const Car = () => {
	const [loadedCar, setLoadedCar] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const cId = useParams().id;
	useEffect(() => {
		const fetechEvents = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/cars/${cId}`
				);
				setLoadedCar(responseData.car);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		fetechEvents();
	}, [sendRequest, cId]);

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
			{!isLoading && loadedCar && <CarItem event={loadedCar} />}
		</React.Fragment>
	);
};

export default Car;
