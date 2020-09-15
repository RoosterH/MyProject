import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import UserGarage from '../../users/pages/UserGarage';
import { UserAuthContext } from '../../shared/context/auth-context';

import './Entry.css';

// Calling ClubEvents
const CarSelector = props => {
	let userId = props.userId;
	const userAuthContext = useContext(UserAuthContext);
	if (
		!userAuthContext ||
		!userAuthContext.userId ||
		userAuthContext.userId !== userId
	) {
		return (
			<div className="list-header clearfix">
				<div className="selector-title">
					Not authorized to access garage
				</div>
			</div>
		);
	}

	const getCarId = carId => {
		props.carIdHandler(carId);
	};

	const carSelectorStatus = status => {
		props.carSelectorStatus(status);
	};

	const carIdHandler = carId => {
		props.carIdHandler(carId);
	};

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="selector-title">Select a car</div>
			</div>
			<UserGarage
				carSelector={true}
				userId={userId}
				getCarId={getCarId}
				carSelectorStatus={carSelectorStatus}
				carIdHandler={carIdHandler}
			/>
		</React.Fragment>
	);
};

export default CarSelector;
