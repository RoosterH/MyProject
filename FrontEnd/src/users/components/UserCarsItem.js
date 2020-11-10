import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventsItem.css';
import './UserCarsItem.css';

// UserCarItem renders a card for each event
const UserCarsItem = props => {
	let carSelector = props.carSelector;
	console.log('props.image = ', props.image);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const userAuthContext = useContext(UserAuthContext);
	const [overlay, setOverlay] = useState();

	useEffect(() => {
		// if props.entryCar is true meaning this car is used for event entry
		if (props.isEntryCar) {
			setOverlay('ON DUTY');
		} else {
			if (props.active) {
				setOverlay('ACTIVE');
			} else {
				setOverlay('RETIRED');
			}
		}
	}, [props.isEntryCar, props.active, setOverlay]);

	const submitHandler = () => {
		props.carSelectorStatus(true);
		props.carIdHandler(props.id);
	};

	const [newEntry, setNewEntry] = useState();

	const changeCarHandler = async () => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/entries/car/${props.entryId}`,
				'PATCH',
				JSON.stringify({ carId: props.id }),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			console.log('new Entry = ', responseData.entry);
			setNewEntry(responseData.entry);
			props.getNewEntry(responseData.entry);
		} catch (err) {}
	};

	return (
		<li className="events-item">
			<Card className="events-item__content">
				{/* Display car in User garage */}
				{!carSelector && (
					<Link to={`/users/cars/${props.id}`}>
						<div className="events-item__image">
							<Avatar
								image={props.image}
								alt={props.model}
								className="avatar__event"
								// for car published is always true
								published={true}
								publishDescription={overlay}
							/>
						</div>
						<div className="events-item__info">
							<h2>{props.year}</h2>
							<h1>
								{props.make}&nbsp;{props.model}&nbsp;{props.trimLevel}
							</h1>
							{/* <h1>{props.model}</h1> */}
							{/* <h4>by {props.clubName}</h4> */}
							<h2></h2>
						</div>
					</Link>
				)}
				{/* <Link to={`/users/cars/${props.id}`}> */}
				{/* Create buttion for selecting a car to enter an event */}
				{carSelector && props.isNewEntry && (
					<button
						className="carselector-button"
						onClick={submitHandler}>
						<div className="events-item__image">
							<Avatar
								image={props.image}
								alt={props.model}
								className="avatar__event"
								// for car published is always true
								published={true}
								publishDescription={overlay}
							/>
						</div>
						<div className="events-item__info">
							<h2>{props.year}</h2>
							<h1>
								{props.make}&nbsp;{props.model}&nbsp;{props.trimLevel}
							</h1>
							{/* <h1>{props.model}</h1> */}
							{/* <h4>by {props.clubName}</h4> */}
							<h2></h2>
						</div>
					</button>
				)}
				{/* This is the car been entered to the event. We don't want to create a link for it*/}
				{carSelector && props.isEntryCar && !props.isNewEntry && (
					<button className="pickedcar-button">
						<div className="events-item__image">
							<Avatar
								image={props.image}
								alt={props.model}
								className="avatar__event"
								// for car published is always true
								published={true}
								publishDescription={overlay}
							/>
						</div>
						<div className="events-item__info">
							<h2>{props.year}</h2>
							<h1>
								{props.make}&nbsp;{props.model}&nbsp;{props.trimLevel}
							</h1>
							{/* <h1>{props.model}</h1> */}
							{/* <h4>by {props.clubName}</h4> */}
							<h2></h2>
						</div>
					</button>
				)}
				{carSelector && !props.isEntryCar && !props.isNewEntry && (
					<button
						className="carselector-button"
						onClick={changeCarHandler}>
						<div className="events-item__image">
							<Avatar
								image={props.image}
								alt={props.model}
								className="avatar__event"
								// for car published is always true
								published={true}
								publishDescription={overlay}
							/>
						</div>
						<div className="events-item__info">
							<h2>{props.year}</h2>
							<h1>
								{props.make}&nbsp;{props.model}&nbsp;{props.trimLevel}
							</h1>
							{/* <h1>{props.model}</h1> */}
							{/* <h4>by {props.clubName}</h4> */}
							<h2></h2>
						</div>
					</button>
				)}
			</Card>
		</li>
	);
};

export default UserCarsItem;
