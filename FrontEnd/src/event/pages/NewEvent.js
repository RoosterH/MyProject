import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
	VALIDATOR_FILE
} from '../../shared/util/validators';
import './EventForm.css';

const NewEvent = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [formState, inputHandler] = useForm(
		{
			// validity of individual input
			name: {
				value: '',
				isValid: false
			},
			image: {
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

	const history = useHistory();
	const eventSubmitHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();

		try {
			await sendRequest(
				'http://localhost:5000/api/events',
				'POST',
				{
					'Content-Type': 'application/json'
				},
				JSON.stringify({
					name: formState.inputs.name.value,
					startDate: formState.inputs.startDate.value,
					endDate: formState.inputs.endDate.value,
					venue: formState.inputs.venue.value,
					address: formState.inputs.address.value,
					description: formState.inputs.description.value,
					image: formState.inputs.image.value,
					courseMap: formState.inputs.courseMap.value,
					clubId: clubAuthContext.clubId
				})
			);
			// Redirect the club to a diffrent page
			history.push(`/club/${clubAuthContext.clubId}`);
		} catch (err) {}
	};

	// the purpose of onInput is to enter back the value after been validated to NewEvent
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<form className="event-form" onSubmit={eventSubmitHandler}>
				{isLoading && <LoadingSpinner asOverlay />}
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
					id="image"
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
					label="Starting Date (Future date from today)"
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
		</React.Fragment>
	);
};

export default NewEvent;
