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

	const cId = useParams().carId;
	console.log('cId = ', cId);
	useEffect(() => {
		console.log('fetching');
		const fetechCars = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/cars/${cId}`
				);
				setLoadedCar(responseData.car);
				console.log('responseData = ', responseData);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		console.log('fetching2');
		fetechCars();
	}, [sendRequest, cId]);

	// calling CarsList from CarsList.js where it passes CARS to child CarsList
	// just treat the following call as CarsList(items = CARS); items is the props
	// name defined in CarsList
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedCar && <CarItem car={loadedCar} />}
		</React.Fragment>
	);
};

export default Car;
