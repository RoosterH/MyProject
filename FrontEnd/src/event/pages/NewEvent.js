import React, { useContext, useEffect, useState } from 'react';
import { Prompt } from 'react-router';
import { useHistory } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

import './EventForm.css';
import { eventTypes } from '../../event/components/EventTypes';

const NewEvent = setFieldValue => {
	const clubAuth = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. If club not logging in, re-direct to auth page
	let storageData = JSON.parse(localStorage.getItem('userData'));
	if (
		!storageData ||
		!storageData.clubId ||
		storageData.clubId !== clubAuth.clubId
	) {
		history.push('/clubs/auth');
	}

	let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
	let name = '';
	let type = 'Autocross';
	let image = undefined;
	let startDate = tomorrow;
	let endDate = tomorrow;
	let venue = '';
	let address = '';
	let description = '';
	let instruction = '';
	let courseMap = undefined;

	// local storage gets the higest priority
	storageData = JSON.parse(localStorage.getItem('evenFormData'));
	// get from localStorage
	if (storageData && moment(storageData.expiration) > moment()) {
		name = storageData.name;
		type = storageData.type;
		image = storageData.image;
		startDate = storageData.startDate;
		endDate = storageData.endDate;
		venue = storageData.venue;
		address = storageData.address;
		description = storageData.description;
		instruction = storageData.instruction;
		courseMap = storageData.courseMap;
	} else {
		// reach out DB to get saved data
	}

	const initialValues = {
		name: name,
		type: type,
		image: image,
		startDate: startDate,
		endDate: endDate,
		venue: venue,
		address: address,
		description: description,
		instruction: instruction,
		courseMap: courseMap
	};

	const submitHandler = (values, actions) => {
		const fetchEvents = async () => {
			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('type', values.type);
			formData.append('startDate', moment(values.startDate));
			formData.append('endDate', moment(values.endDate));
			formData.append('venue', values.venue);
			formData.append('address', values.address);
			formData.append('description', values.description);
			formData.append('image', values.image);
			formData.append('courseMap', values.courseMap);

			await sendRequest(
				process.env.REACT_APP_BACKEND_URL + '/events',
				'POST',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuth.clubToken
				}
			);
			// Redirect the club to a diffrent page
			history.push(`/events/club/${clubAuth.clubId}`);
		};
		fetchEvents();
	};

	/***** Form Validation Section  *****/
	// 3 levels of validation here.
	// 1. Field level: Field validate={validateName}. This validates when Field is onBlur
	// 2. Save:  Check against image and courseMap sizes only
	// 3. Submit: Check against startDate vs. endDate, text/texArea required, image required,
	//    image/courseMap sizes
	function validateName(value) {
		let error;
		console.log('value = ', value);
		if (!value) {
			error = 'Event Name is required.';
			console.log('validateName = ', error);
		}
		return error;
	}
	function validateVenue(value) {
		let error;
		if (!value) {
			error = 'Event Venue is required.';
			console.log('validateName = ', error);
		}
		return error;
	}
	function validateAddress(value) {
		let error;
		if (!value) {
			error = 'Event Address is required.';
			console.log('validateName = ', error);
		}
		return error;
	}
	function validateDescription(value) {
		let error;
		if (!value) {
			error = 'Event Description is required.';
			console.log('validateName = ', error);
		}
		return error;
	}
	function validateInstruction(value) {
		let error;
		if (!value) {
			error = 'Event Instruction is required.';
			console.log('validateName = ', error);
		}
		return error;
	}

	// To save, we only care about image sizes
	const [imageValid, setImageValid] = useState(true);
	const [courseMapValid, setCourseMapValid] = useState(true);
	// for Save validation
	const [saveIsValid, setSaveIsValid] = useState(true);
	const [saved, setSaved] = useState(true);
	useEffect(() => {
		let valid = imageValid && courseMapValid;
		setSaveIsValid(valid);
	}, [imageValid, courseMapValid]);

	function validateImageSize(value) {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
			setImageValid(false);
		} else {
			setImageValid(true);
		}
		return error;
	}
	function validateCourseMapSize(value) {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
			setCourseMapValid(false);
		} else {
			setCourseMapValid(true);
		}
		return error;
	}
	/***** End of Form Validation *****/

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter event information</h4>
				<hr className="event-form__hr" />
			</div>
			<Formik initialValues={initialValues}>
				{({
					values,
					errors,
					isSubmitting,
					isValid,
					setFieldValue,
					validateForm,
					validateField,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						<label htmlFor="name" className="event-form__label">
							Event Name
						</label>
						<Field
							id="name"
							name="name"
							type="text"
							className="event-form__field"
							validate={validateName}
							onBlur={event => {
								handleBlur(event);
								if (event.target.value) {
									setSaved(false);
								}
							}}
						/>
						{touched.name && errors.name && (
							<div className="event-form__field-error">
								{errors.name}
							</div>
						)}
						<label htmlFor="eventType" className="event-form__label">
							Event Type
						</label>
						<Field
							id="eventType"
							name="eventType"
							as="select"
							className="event-form__eventtype"
							onBlur={() => setSaved(false)}>
							<option value="Event Type" disabled>
								Event Type
							</option>
							{eventTypes.map(option => {
								let res = option.split(':');
								return (
									<option name={res[0]} key={res[0]}>
										{res[1]}
									</option>
								);
							})}
						</Field>
						<label
							htmlFor="startDate"
							className="event-form__label_startdate">
							Start Date
						</label>
						<label
							htmlFor="endDate"
							className="event-form__label_enddate">
							End Date
						</label>
						<br />
						<Field
							id="startDate"
							name="startDate"
							type="date"
							placeholder={tomorrow}
							min={tomorrow}
							max="2030-12-31"
							className="event-form__startdate"
							onBlur={() => setSaved(false)}
						/>
						<Field
							id="endDate"
							name="endDate"
							type="date"
							placeholder={tomorrow}
							min={tomorrow}
							max="2030-12-31"
							className="event-form__enddate"
							onBlur={() => setSaved(false)}
						/>
						<label htmlFor="venue" className="event-form__label">
							Venue
						</label>
						<Field
							id="venue"
							name="venue"
							type="text"
							className="event-form__field"
							validate={validateVenue}
							onBlur={() => setSaved(false)}
						/>
						{touched.venue && errors.venue && (
							<div className="event-form__field-error">
								{errors.venue}
							</div>
						)}
						<label htmlFor="address" className="event-form__label">
							Venue Address
						</label>
						<Field
							id="address"
							name="address"
							type="text"
							placeholder="Crows Landing, CA"
							className="event-form__field"
							validate={validateAddress}
							onBlur={() => setSaved(false)}
						/>
						{touched.address && errors.address && (
							<div className="event-form__field-error">
								{errors.address}
							</div>
						)}
						<label
							htmlFor="description"
							className="event-form__label">
							Event Description
						</label>
						<Field
							id="decription"
							name="description"
							as="textarea"
							rows="15"
							cols="50"
							placeholder="Please enter event description"
							className="event-form__field-textarea"
							validate={validateDescription}
							onBlur={() => setSaved(false)}
						/>
						{touched.description && errors.description && (
							<div className="event-form__field-error">
								{errors.description}
							</div>
						)}
						<label
							htmlFor="instruction"
							className="event-form__label">
							Event Instruction
						</label>
						<Field
							id="instruction"
							name="instruction"
							as="textarea"
							rows="15"
							cols="50"
							placeholder="Please enter event instruction"
							className="event-form__field-textarea"
							validate={validateInstruction}
							onBlur={() => setSaved(false)}
						/>
						{touched.instruction && errors.instruction && (
							<div className="event-form__field-error">
								{errors.instruction}
							</div>
						)}
						<Field
							id="image"
							name="image"
							title="image"
							component={ImageUploader}
							validate={validateImageSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.image ? errors.image : ''}
							onBlur={() => setSaved(false)}
						/>
						<Field
							id="courseMap"
							name="courseMap"
							title="courseMap"
							component={ImageUploader}
							validate={validateCourseMapSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.courseMap ? errors.courseMap : ''}
							onBlur={() => setSaved(false)}
						/>
						<Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							disabled={isSubmitting || !saveIsValid}
							onClick={() => {
								validateField('name');
								validateField('venue');
							}}>
							Save & Continue
						</Button>
						{/* <Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							onClick={() => {
								validateField('name');
								validateField('venue');
							}}
							disabled={isSubmitting || !isValid}
							className="file-upload-button">
							Submit
						</Button> */}
						<Prompt
							when={!saved}
							message="Form has not been saved, you sure you want to leave?"
						/>
					</Form>
				)}
			</Formik>
		</div>
	);

	// // the purpose of onInput is to enter back the value after been validated to NewEvent
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{eventForm()}
		</React.Fragment>
	);
};

export default NewEvent;
