import React, { useEffect, useState } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import UserCarsItem from './UserCarsItem';
import '../../shared/css/EventsList.css';

// treat this as a function looks like
// EventList(props.items), caller will call as <EventList items=(value to be passed in) \>
const UserCarsList = props => {
	if (props.items.length === 0) {
		return (
			<div className="center">
				<Card>
					<h2>No car found. Please click to create a new car</h2>
					<Button to="/users/cars/new">Add a car</Button>
				</Card>
			</div>
		);
	}

	const carSelectorStatus = status => {
		props.carSelectorStatus(status);
	};

	const carIdHandler = carId => {
		props.carIdHandler(carId);
	};

	const getNewEntry = entry => {
		props.getNewEntry(entry);
	};

	return (
		<ul className="events-list">
			{props.items.map(car => (
				<UserCarsItem
					// In React, each child in the array should have a unique "key" prop
					// so when render it will only render one element not the whole array
					key={car.id}
					id={car.id}
					active={car.active}
					year={car.year}
					make={car.make}
					model={car.model}
					trimLevel={car.trimLevel}
					// image={process.env.REACT_APP_ASSET_URL + `/${car.image}`}
					image={car.image}
					tireBrand={car.tireBrand}
					tireName={car.tireName}
					tireFrontWidth={car.tireFrontWidth}
					tireFrontDiameter={car.tireFrontDiameter}
					tireFrontRatio={car.tireFrontRatio}
					tireRearWidth={car.tireRearWidth}
					tireRearDiameter={car.tireRearDiameter}
					tireRearRatio={car.tireRearRatio}
					FrontPressure={car.FrontPressure}
					RearPressure={car.RearPressure}
					LFCamber={car.LFCamber}
					RFCamber={car.RFCamber}
					LRCamber={car.LRCamber}
					RRCamber={car.RRCamber}
					LFCaster={car.LFCaster}
					RFCaster={car.RFCaster}
					LFToe={car.LFToe}
					RFToe={car.RFToe}
					LRToe={car.LRToe}
					RRToe={car.RRToe}
					FBar={car.FBar}
					RBar={car.RBar}
					FRebound={car.FRebound}
					RRebound={car.RRebound}
					FCompression={car.FCompression}
					RCompression={car.RCompression}
					note={car.note}
					carSelector={props.carSelector}
					carSelectorStatus={carSelectorStatus}
					carIdHandler={carIdHandler}
					isEntryCar={props.entryCarId === car.id}
					isNewEntry={props.isNewEntry}
					entryId={props.entryId}
					getNewEntry={getNewEntry}
				/>
			))}
		</ul>
	);
};

export default UserCarsList;
