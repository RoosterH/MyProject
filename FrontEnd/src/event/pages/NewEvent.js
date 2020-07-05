import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUpload from '../../shared/components/FormElements/ImageUpload.js';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import './EventForm.css';

const NewEvent = () => {
	const clubAuth = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [formState, inputHandler, setFormData] = useForm(
		{
			// validity of individual input
			name: {
				value: '',
				isValid: false
			},
			image: {
				value: null, // need to use null because it's a binary file
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
				value: null,
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
		setFormData(
			{
				...formState.inputs
			},
			formState.inputs.name.isValid &&
				formState.inputs.startDate.isValid &&
				formState.inputs.endDate.isValid &&
				formState.inputs.venue.isValid &&
				formState.inputs.address.isValid &&
				formState.inputs.description.isValid &&
				formState.inputs.image.isValid
		);

		try {
			// FormData() is a browser API. We can append text or binary data to FormData
			const formData = new FormData();
			formData.append('name', formState.inputs.name.value);
			formData.append(
				'startDate',
				moment(formState.inputs.startDate.value)
			);
			formData.append(
				'endDate',
				moment(formState.inputs.endDate.value)
			);
			formData.append('venue', formState.inputs.venue.value);
			formData.append('address', formState.inputs.address.value);
			formData.append(
				'description',
				formState.inputs.description.value
			);
			formData.append('image', formState.inputs.image.value);
			formData.append('courseMap', formState.inputs.courseMap.value);

			await sendRequest(
				'http://localhost:5000/api/events',
				'POST',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuth.clubToken
				}
			);
			// Redirect the club to a diffrent page
			history.push(`/events/club/${clubAuth.clubId}`);
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
					errorText="Please enter a valid name."
					onInput={inputHandler}
				/>
				<ImageUpload
					center
					id="image"
					onInput={inputHandler}
					errorText="Please provide an event image."
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
					validators={[VALIDATOR_MINLENGTH(10)]}
					errorText="Please enter a valid description with min length 10 chars."
					onInput={inputHandler}
				/>
				<ImageUpload center id="courseMap" onInput={inputHandler} />
				<Button type="submit" disabled={!formState.isValid}>
					Add Event
				</Button>
			</form>
		</React.Fragment>
	);
};

export default NewEvent;
