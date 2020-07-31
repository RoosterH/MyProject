import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

import { EventAuth } from '../../shared/hooks/eventAuth-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

import './EventForm.css';
import { eventTypes } from '../../event/components/EventTypes';

let initialized = false;
const NewEvent = setFieldValue => {
	const clubAuth = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// authentication check
	EventAuth();

	let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
	const [name, setName] = useState('');
	const [type, setType] = useState('Autocross');
	const [startDate, setStartDate] = useState(tomorrow);
	const [endDate, setEndDate] = useState(tomorrow);
	const [venue, setVenue] = useState('');
	const [address, setAddress] = useState('');
	const [description, setDescription] = useState('');
	const [instruction, setInstruction] = useState('');
	// todo: retrive file from Reader: const [image, setImage] = useState();
	// todo: const [courseMap, setCourseMap] = useState('');
	let image = undefined;
	let courseMap = undefined;

	// initialize local storage
	// Get the existing data
	var eventFormData = localStorage.getItem('eventFormData');

	// If no existing data, create an array; otherwise retrieve it
	eventFormData = eventFormData ? JSON.parse(eventFormData) : {};

	/***** OKLeavePage Section *****/
	const [nameOK, setNameOK] = useState(true);
	const [typeOK, setTypeOK] = useState(true);
	const [venueOK, setVenueOK] = useState(true);
	const [addressOK, setAddressOK] = useState(true);
	const [startDateOK, setStartDateOK] = useState(true);
	const [endDateOK, setEndDateOK] = useState(true);
	const [descriptionOK, setDescriptionOK] = useState(true);
	const [instructionOK, setInstructionOK] = useState(true);
	const [imageOK, setImageOK] = useState(true);
	const [courseMapOK, setCourseMapOK] = useState(true);
	const [OKLeavePage, setOKLeavePage] = useState(true);

	useEffect(() => {
		setOKLeavePage(
			nameOK &&
				typeOK &&
				venueOK &&
				addressOK &&
				startDateOK &&
				endDateOK &&
				descriptionOK &&
				instructionOK &&
				imageOK &&
				courseMapOK
		);
	}, [
		nameOK,
		typeOK,
		venueOK,
		addressOK,
		startDateOK,
		endDateOK,
		descriptionOK,
		instructionOK,
		imageOK,
		courseMapOK
	]);
	/***** End of OKLeavePage Section *****/

	// local storage gets the higest priority
	// get from localStorage
	if (
		!initialized &&
		eventFormData &&
		moment(eventFormData.expirationDate) > moment()
	) {
		initialized = true;
		// Form data
		if (eventFormData.name) {
			setName(eventFormData.name);
			setNameOK(false);
		}
		if (eventFormData.type) {
			setType(eventFormData.type);
			setTypeOK(false);
		}
		if (eventFormData.startDate) {
			setStartDate(eventFormData.startDate);
			setStartDateOK(false);
		}
		if (eventFormData.endDate) {
			setEndDate(eventFormData.endDate);
			setEndDateOK(false);
		}
		if (eventFormData.venue) {
			setVenue(eventFormData.venue);
			setVenueOK(false);
		}
		if (eventFormData.address) {
			setAddress(eventFormData.address);
			setAddressOK(false);
		}
		if (eventFormData.description) {
			setDescription(eventFormData.description);
			setDescriptionOK(false);
		}
		if (eventFormData.instruction) {
			setInstruction(eventFormData.instruction);
			setDescriptionOK(false);
		}
		if (eventFormData.image) {
			//setImage(eventFormData.image);
			setImageOK(false);
		}
		if (eventFormData.courseMap) {
			// setCourseMap(eventFormData.courseMap);
			setCourseMapOK(false);
		}
	} else if (!initialized) {
		initialized = true;
		// initialize localStorage
		eventFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		eventFormData['name'] = '';
		eventFormData['type'] = 'Autocross';
		eventFormData['startDate'] = tomorrow;
		eventFormData['endDate'] = tomorrow;
		eventFormData['venue'] = '';
		eventFormData['address'] = '';
		eventFormData['description'] = '';
		eventFormData['instruction'] = '';
		eventFormData['image'] = undefined;
		eventFormData['courseMap'] = undefined;
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(eventFormData)
		);

		// reach out DB to get saved data
	}

	const removeEventFormData = () => {
		localStorage.removeItem('eventFormData');
		history.push(`/events/club/${clubAuth.clubId}`);
	};

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

	const updateEventFormData = (key, value) => {
		const storageData = JSON.parse(
			localStorage.getItem('eventFormData')
		);
		storageData[key] = value;
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(storageData)
		);
	};

	const history = useHistory();
	const submitHandler = (values, actions) => {
		console.log('values = ', values);
		const createNewEvent = async () => {
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
			// history.push(`/events/club/${clubAuth.clubId}`);
		};
		createNewEvent();
	};

	/***** Form Validation Section  *****/
	// 3 levels of validation here.
	// 1. Field level: Field validate={validateName}. This validates when Field is onBlur
	// 2. Save:  Check against image and courseMap sizes only
	// 3. Submit: Check against startDate vs. endDate, text/texArea required, image required,
	//    image/courseMap sizes
	const [startDateValid, setStartDateValid] = useState(true);
	const [endDateValid, setEndDateValid] = useState(true);

	const validateName = value => {
		let error;
		if (!value) {
			error = 'Event Name is required.';
		}
		return error;
	};
	const validateVenue = value => {
		let error;
		if (!value) {
			error = 'Event Venue is required.';
		}
		return error;
	};
	const validateAddress = value => {
		let error;
		if (!value) {
			error = 'Event Address is required.';
		}
		return error;
	};
	const validateStartDate = value => {
		setStartDate(moment(value).format('YYYY-MM-DD'));
		let error;
		if (
			moment(value).format('YYYY-MM-DD') >
			moment(endDate).format('YYYY-MM-DD')
		) {
			error = 'Start Date must be earlier than End Date.';
			setStartDateValid(false);
		} else {
			setStartDateValid(true);
		}
		return error;
	};
	const validateEndDate = value => {
		setEndDate(moment(value).format('YYYY-MM-DD'));
		let error;
		if (
			moment(value).format('YYYY-MM-DD') <
			moment(startDate).format('YYYY-MM-DD')
		) {
			error = 'End Date must be later than Start Date.';
			setEndDateValid(false);
		} else {
			setEndDateValid(true);
		}
		return error;
	};
	const validateDescription = value => {
		let error;
		if (!value) {
			error = 'Event Description is required.';
		}
		return error;
	};
	const validateInstruction = value => {
		let error;
		if (!value) {
			error = 'Event Instruction is required.';
		}
		return error;
	};

	// To save, we only care about image sizes
	const [imageValid, setImageValid] = useState(true);
	const [courseMapValid, setCourseMapValid] = useState(true);
	// for Save validation
	const [saveIsValid, setSaveIsValid] = useState(true);

	useEffect(() => {
		let valid =
			imageValid && courseMapValid && startDateValid && endDateValid;
		setSaveIsValid(valid);
	}, [imageValid, courseMapValid, startDateValid, endDateValid]);

	const validateImageSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
			setImageValid(false);
		} else {
			setImageValid(true);
		}
		return error;
	};

	const validateCourseMapSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
			setCourseMapValid(false);
		} else {
			setCourseMapValid(true);
		}
		return error;
	};
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
					isValidating,
					setFieldValue,
					validateField,
					touched,
					handleBlur,
					obBlur
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
								// without handBlure(event) touched.name will not work
								handleBlur(event);
								updateEventFormData('name', event.target.value);
								if (event.target.value) {
									setNameOK(false);
								} else {
									setNameOK(true);
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
							id="type"
							name="type"
							as="select"
							className="event-form__eventtype"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('type', event.target.value);
								if (event.target.value !== 'Autocross') {
									setTypeOK(false);
								} else {
									setTypeOK(true);
								}
							}}>
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
							validate={validateStartDate}
							min={tomorrow}
							max="2030-12-31"
							className="event-form__startdate"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('startDate', event.target.value);
								if (event.target.value !== tomorrow) {
									setStartDateOK(false);
								} else {
									setStartDateOK(true);
								}
							}}
						/>
						<Field
							id="endDate"
							name="endDate"
							type="date"
							validate={validateEndDate}
							min={tomorrow}
							max="2030-12-31"
							className="event-form__enddate"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('endDate', event.target.value);
								if (event.target.value !== tomorrow) {
									setEndDateOK(false);
								} else {
									setEndDateOK(true);
								}
							}}
						/>
						{touched.startDate && errors.startDate && (
							<div className="event-form__field-error-startDate">
								{errors.startDate}
							</div>
						)}
						{touched.endDate && errors.endDate && (
							<div className="event-form__field-error-endDate">
								{errors.endDate}
							</div>
						)}
						<label htmlFor="venue" className="event-form__label">
							Venue
						</label>
						<Field
							id="venue"
							name="venue"
							type="text"
							className="event-form__field"
							validate={validateVenue}
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('venue', event.target.value);
								if (event.target.value) {
									setVenueOK(false);
								} else {
									setVenueOK(true);
								}
							}}
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
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('address', event.target.value);
								if (event.target.value) {
									setAddressOK(false);
								} else {
									setAddressOK(true);
								}
							}}
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
							onBlur={event => {
								handleBlur(event);
								updateEventFormData(
									'description',
									event.target.value
								);
								if (event.target.value) {
									setDescriptionOK(false);
								} else {
									setDescriptionOK(true);
								}
							}}
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
							onBlur={event => {
								handleBlur(event);
								updateEventFormData(
									'instruction',
									event.target.value
								);
								if (event.target.value) {
									setInstructionOK(false);
								} else {
									setInstructionOK(true);
								}
							}}
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
							onBlur={event => {
								handleBlur(event);
								if (event.target.value) {
									setImageOK(false);
								} else {
									setImageOK(true);
								}
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/>
						<Field
							id="courseMap"
							name="courseMap"
							title="courseMap"
							component={ImageUploader}
							validate={validateCourseMapSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.courseMap ? errors.courseMap : ''}
							onBlur={event => {
								handleBlur(event);
								if (event.target.value) {
									setCourseMapOK(false);
								} else {
									setCourseMapOK(true);
								}
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/>
						<Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							disabled={isSubmitting || !saveIsValid}
							onClick={() => {
								validateField('name');
								validateField('venue');
								if (isValid) {
									submitHandler(values);
								}
							}}>
							Save
						</Button>
						<Button
							type="button"
							size="medium"
							onClick={() => {
								validateField('name');
								validateField('venue');
							}}
							disabled={isSubmitting || !isValid}>
							Submit
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								removeEventFormData();
							}}
							// Confirm navigation if going to a path that does not start with current path:
							when={!OKLeavePage}>
							{({ isActive, onCancel, onConfirm }) => {
								if (isActive) {
									return (
										<PromptModal
											onCancel={onCancel}
											onConfirm={onConfirm}
											contentClass="event-item__modal-content"
											footerClass="event-item__modal-actions"
											error="You sure want to leave? Unsaved data will be lost.">
											{/* render props.children */}
										</PromptModal>
									);
								}
								return (
									<div>
										This is probably an anti-pattern but ya know...
									</div>
								);
							}}
						</NavigationPrompt>
					</Form>
				)}
			</Formik>
		</div>
	);

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
