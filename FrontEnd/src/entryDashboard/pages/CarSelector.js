import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import UserGarage from '../../users/pages/UserGarage';
import { UserAuthContext } from '../../shared/context/auth-context';

import './Entry.css';

// CarSelector is called when user is entering an event that needs to pick up a car
const CarSelector = props => {
	let userId = props.userId;
	// entryCarId is the car that is picked for the entry
	let entryCarId = props.entryCarId;
	// flag to indicate the route is from newEntryManager
	let isNewEntry = props.isNewEntry;

	const [instructionMsg, setInstructionMsg] = useState(
		'Please Select A Car'
	);
	useEffect(() => {
		if (entryCarId) {
			setInstructionMsg('Please Pick A Car to Change Your Ride');
		}
	}, [entryCarId, setInstructionMsg]);

	const userAuthContext = useContext(UserAuthContext);
	if (
		!userAuthContext ||
		!userAuthContext.userId ||
		userAuthContext.userId !== userId
	) {
		return (
			<div className="list-header clearfix">
				{/* <div className="selector-title"> */}
				<div className="h3">Not authorized to access garage</div>
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

	// callback to get new entry from child, this is for EditEntryManager
	const getNewEntry = entry => {
		props.getNewEntry(entry);
	};
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				{/* <div className="selector-title">Select a car</div> */}
				<div className="h3">{instructionMsg}</div>
			</div>
			<UserGarage
				carSelector={true}
				userId={userId}
				getCarId={getCarId}
				carSelectorStatus={carSelectorStatus}
				carIdHandler={carIdHandler}
				isNewEntry={isNewEntry}
				entryCarId={entryCarId}
				entryId={props.entryId}
				getNewEntry={getNewEntry}
			/>
		</React.Fragment>
	);
};

export default CarSelector;
