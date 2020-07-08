import React, { useEffect, useState } from 'react';
import moment from 'moment';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import EventsList from '../components/EventsList';
import Input from '../../shared/components/FormElements/Input';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';

import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';

import './Events.css';

// Events is called in App.js where the route been defined
// @to-do
const Events = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [loadedEvents, setLoadedEvents] = useState();
	useEffect(() => {
		const fectchEvents = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/events'
				);

				setLoadedEvents(responseData.events);
			} catch (err) {}
		};

		fectchEvents();
	}, [sendRequest]);

	const [formState, inputHandler, setFormData] = useForm(
		{
			type: {
				value: '',
				isValid: false
			},
			startDate: {
				value: '',
				isValid: false
			},
			endDate: {
				value: '',
				isValid: false
			},
			zip: {
				value: '',
				isValid: false
			},
			distance: {
				value: '',
				isValid: false
			}
		},
		false
	);

	const eventSubmitHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();
		setFormData(
			{
				...formState.inputs
			},
			formState.inputs.type.isValid &&
				formState.inputs.startDate.isValid &&
				formState.inputs.endDate.isValid &&
				formState.inputs.zip.isValid &&
				formState.inputs.distamce.isValid
		);

		try {
			// FormData() is a browser API. We can append text or binary data to FormData
			const formData = new FormData();
			formData.append('type', formState.inputs.type.value);
			formData.append(
				'startDate',
				moment(formState.inputs.startDate.value)
			);
			formData.append(
				'endDate',
				moment(formState.inputs.endDate.value)
			);
			formData.append('zip', formState.inputs.zip.value);
			formData.append('distance', formState.inputs.address.value);

			await sendRequest(
				process.env.REACT_APP_BACKEND_URL + '/events',
				'POST',
				formData
				// {
				// 	// adding JWT to header for authentication
				// 	Authorization: 'Bearer ' + clubAuth.clubToken
				// }
			);
			// Redirect the club to a diffrent page
			// history.push(`/events/club/${clubAuth.clubId}`);
		} catch (err) {}
	};
	const searchForm = () => {
		return (
			<div className="search-frame">
				<form
					className="search-form-inline"
					onSubmit={eventSubmitHandler}>
					<Input
						id="eventType"
						element="input"
						type="text"
						label="Event Type"
						// className="search-form-inline"
						className="search-form-inline"
						initialValue="Autocross"
						validators={[VALIDATOR_REQUIRE()]}
						onInput={inputHandler}
					/>
					<Input
						className="search-form-inline"
						id="startDate"
						element="input"
						type="date"
						label="Start Date"
						initialValue={moment().format('YYYY-MM-DD')}
						min="2020-07-01"
						max="2020-08-31"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid date."
						onInput={inputHandler}
					/>
					<Input
						className="search-form-inline"
						id="endDate"
						element="input"
						type="date"
						label="End Date "
						initialValue={moment().format('YYYY-MM-DD')}
						min="2020-07-01"
						max="2020-08-31"
						size="15"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid date."
						onInput={inputHandler}
					/>
					<Input
						className="search-form-inline"
						id="startDate"
						element="input"
						type="text"
						label="Zip"
						initialValue="95132"
						validators={[VALIDATOR_REQUIRE()]}
						onInput={inputHandler}
					/>
					<Input
						className="search-form-inline"
						id="startDate"
						element="input"
						type="text"
						label="Distance"
						initialValue="100 miles"
						validators={[VALIDATOR_REQUIRE()]}
						onInput={inputHandler}
					/>
					<Button
						size="small"
						type="submit"
						disabled={!formState.isValid}>
						Find Events
					</Button>
				</form>
			</div>
		);
	};

	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<div className="search-page-header">
				<h4>
					<span
						// class="search-heading"
						data-original-title="Driving Events">
						Find driving events near you
					</span>
				</h4>
			</div>
			{searchForm()}
			{/* {isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedEvents && (
				<EventsList items={loadedEvents} />
			)} */}
		</React.Fragment>
	);
};

export default Events;
