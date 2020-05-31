import React, { useContext } from 'react';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
	VALIDATOR_FILE
} from '../../shared/util/validators';
import './EventForm.css';

const NewEvent = () => {
	const clubAuthContext = useContext(ClubAuthContext);

	const [formState, inputHandler] = useForm(
		{
			// validity of individual input
			name: {
				value: '',
				isValid: false
			},
			title: {
				value: '',
				isValid: false
			},
			eventImage: {
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
			venue: {
				value: '',
				isValid: false
			},
			address: {
				value: '',
				isValid: false
			},
			coordinate: {
				value: '',
				isValid: false
			},
			description: {
				value: '',
				isValid: false
			},
			courseMap: {
				value: '',
				isValid: false
			}
		},
		false
	);

	const eventSubmitHandler = event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();
		// we will send the form inputs to back end later
		console.log(formState.inputs);
	};

	// the purpose of onInput is to enter back the value after been validated to NewEvent
	return (
		<form className="event-form" onSubmit={eventSubmitHandler}>
			<Input
				id="name"
				element="input"
				type="text"
				label="Name"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid title."
				onInput={inputHandler}
			/>
			<Input
				id="title"
				element="input"
				type="text"
				label="Title"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid title."
				onInput={inputHandler}
			/>
			<Input
				id="eventImage"
				element="input"
				type="file"
				label="Event Image (optional in jpg or png)"
				validators={[VALIDATOR_FILE()]}
				errorText="Please select a jpg or png file."
				onInput={inputHandler}
			/>
			<Input
				id="startDate"
				element="input"
				type="date"
				label="Starting Date"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid date."
				onInput={inputHandler}
			/>
			<Input
				id="endDate"
				element="input"
				type="date"
				label="End Date"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid date."
				onInput={inputHandler}
			/>
			<Input
				id="venue"
				element="input"
				type="text"
				label="Venue"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid venue."
				onInput={inputHandler}
			/>
			<Input
				id="address"
				element="input"
				type="text"
				label="Address"
				validators={[VALIDATOR_MINLENGTH(10)]}
				errorText="Please enter a valid address."
				onInput={inputHandler}
			/>
			<Input
				id="coordinate"
				element="input"
				type="text"
				label="Coordinate format(log, ltg): 37.4015069, -121.1059222"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid coordinate."
				onInput={inputHandler}
			/>
			<Input
				id="description"
				element="textarea"
				label="Description"
				validators={[VALIDATOR_MINLENGTH(5)]}
				errorText="Please enter a valid description with min length 5 chars."
				onInput={inputHandler}
			/>
			<Input
				id="courseMap"
				element="input"
				type="file"
				label="Course Map (optional in jpg or png)"
				validators={[VALIDATOR_FILE()]}
				errorText="Please select a jpg or png file."
				onInput={inputHandler}
			/>
			<Button type="submit" disabled={!formState.isValid}>
				Add Event
			</Button>
		</form>
	);
};

export default NewEvent;
