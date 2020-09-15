import React, { useContext, useState, useEffect } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';
import { UserAuthContext } from '../../shared/context/auth-context';
import CarItem from '../components/CarItem';

// Cars is called in App.js where the route been defined
// path={'/cars/:id'}
const Car = () => {
	const userAuthContext = useContext(UserAuthContext);
	const [loadedCar, setLoadedCar] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const cId = useParams().carId;

	// check localStorage for saved garage data to avoid querying from backend
	let userData = JSON.parse(localStorage.getItem('userData'));
	let garage = userData.garage ? userData.garage : [];

	useEffect(() => {
		let foundCar = false;
		garage.map(car => {
			if (car.id === cId) {
				setLoadedCar(car);
				foundCar = true;
			}
		});

		const fetchCar = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/cars/${cId}`,
					'GET',
					null,
					{
						// No need for content-type since body is null,
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				setLoadedCar(responseData.car);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		if (!foundCar) {
			fetchCar();
		}
	}, [sendRequest, cId, setLoadedCar]);

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
