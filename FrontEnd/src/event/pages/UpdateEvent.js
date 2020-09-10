import React, { useContext, useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';
import * as Yup from 'yup';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import Modal from '../../shared/components/UIElements/Modal';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import '../../shared/css/EventForm.css';
import '../../event/components/EventItem.css';
import { eventTypes } from '../../event/components/EventTypes';

const UpdateEvent = props => {
	const [loadedEvent, setLoadedEvent] = useState(props.event);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const clubAuthContext = useContext(ClubAuthContext);

	let eventId = props.event.id;
	// authentication check
	useClubLoginValidation(`/events/form/${eventId}`);

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	let path;
	React.useEffect(() => {
		path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location]);

	let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
	const history = useHistory();

	// Modal section
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	const [showCourse, setShowCourse] = useState(false);
	const openCourseHandler = () => {
		openModalHandler();
		setShowCourse(true);
	};
	const closeCourseHandler = () => setShowCourse(false);

	const [showImage, setShowImage] = useState(false);
	const openImageHandler = () => {
		openModalHandler();
		setShowImage(true);
	};
	const closeImageHandler = () => setShowImage(false);

	const closeMapContainer = () => {
		showCourse && closeCourseHandler();
		showImage && closeImageHandler();
	};

	if (!eventId || eventId === 'error') {
		// possibly page refresh, look for localStorage
		const storageData = JSON.parse(localStorage.getItem('eventID'));
		if (storageData && storageData.eventId) {
			eventId = storageData.eventId;
		}
	} else {
		// set eventId to localStorage for potential page refresh
		// we will remove it when the form gets submitted
		// @todo remove data when user leaves this page
		localStorage.setItem(
			'eventID',
			JSON.stringify({
				eventId: eventId
			})
		);
	}

	const [OKLeavePage, setOKLeavePage] = useState(true);
	let initialValues = {
		name: '',
		type: 'Autocross',
		image: '',
		startDate: { tomorrow },
		endDate: { tomorrow },
		regStartDate: { tomorrow },
		regEndDate: { tomorrow },
		venue: '',
		address: '',
		description: '',
		instruction: '',
		courseMap: ''
		// isSaveButton: false
	};

	// GET event from server
	// useEffect(() => {
	// 	const fetchEvent = async () => {
	// 		try {
	// 			const responseData = await sendRequest(
	// 				process.env.REACT_APP_BACKEND_URL + `/events/${eventId}`
	// 			);
	// 			if (!responseData.event) {
	// 				throw new Error(
	// 					'Request error, previous event data was not found'
	// 				);
	// 			}
	// 			setLoadedEvent(responseData.event);
	// 		} catch (err) {}
	// 	};
	// 	fetchEvent();
	// }, [sendRequest, eventId]);

	/***** Form Validation Section  *****/
	// 1. Field level: Field validate={validateName}. This validates when Field is onBlur
	// 2. startDate, endDate, regStartDate, and regEndDate use Yup beacuse Yup.ref makes it convenient to check peer fields
	// 3. Save: useState to set validation function to no check.  After submitting, change state
	// back to original validation function.  Save is only not allowed if image/course map sizes are
	// too large.
	// 4. Submit: use Formik isValid to enable the button.  Formik submission will validate everything.

	const dateValidationSchema = Yup.object().shape({
		startDate: Yup.date()
			.min(tomorrow, 'Start date must be no later than end date')
			.max(
				Yup.ref('endDate'),
				'Start date must be no later than end date'
			)
			.required(),
		endDate: Yup.date()
			.min(
				Yup.ref('startDate'),
				'End date cannot be earlier than start date'
			)
			.max('2021-12-31')
			.required(),
		regStartDate: Yup.date()
			.min(
				tomorrow,
				'Registration start date cannot be earlier than tomorrow'
			)
			.max(
				Yup.ref('startDate'),
				'Registration start date must be earlier than event start date'
			)
			.required(),
		regEndDate: Yup.date()
			.min(
				Yup.ref('regStartDate'),
				'Registration end date cannot be earlier than registration start date'
			)
			.max(
				Yup.ref('startDate'),
				'Registration end date cannot be later than event start date'
			)
			.required()
	});

	const [validateName, setValidateName] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Event Name is required.';
		}
		return error;
	});

	const [validateVenue, setValidateVenue] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Event Venue is required.';
		}
		return error;
	});

	const [validateAddress, setValidateAddress] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Event Address is required.';
			}
			return error;
		}
	);

	const [validateDescription, setValidateDescription] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Event Description is required.';
			}
			return error;
		}
	);

	const [validateInstruction, setValidateInstruction] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Event Instruction is required.';
			}
			return error;
		}
	);

	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

	// To save, we only care about image sizes
	// const [imageValid, setImageValid] = useState(true);
	// const [courseMapValid, setCourseMapValid] = useState(true);

	// Save button is an intermediate stage so we will allow Save as long as
	// image size and course map size are valid
	// const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
	// useEffect(() => {
	// 	let valid = imageValid && courseMapValid;
	// 	setSaveButtonEnabled(valid);
	// }, [imageValid, courseMapValid]);

	// const [validateImageSize, setValidateImageSize] = useState(
	// 	() => value => {
	// 		let error;
	// 		if (value && value.size > 1500000) {
	// 			error = 'File size needs to be smaller than 1.5MB';
	// 			setImageValid(false);
	// 		} else {
	// 			setImageValid(true);
	// 		}
	// 		return error;
	// 	}
	// );

	// const [validateCourseMapSize, setValidateCourseMapSize] = useState(
	// 	() => value => {
	// 		let error;
	// 		if (value && value.size > 1500000) {
	// 			error = 'File size needs to be smaller than 1.5MB';
	// 			setCourseMapValid(false);
	// 		} else {
	// 			setCourseMapValid(true);
	// 		}
	// 		return error;
	// 	}
	// );
	/***** End of Form Validation *****/

	const submitHandler = async values => {
		try {
			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('type', values.type);
			formData.append('startDate', values.startDate); //format 2020-08-01
			formData.append('endDate', values.endDate);
			formData.append('regStartDate', values.regStartDate);
			formData.append('regEndDate', values.regEndDate);
			formData.append('venue', values.venue);
			formData.append('address', values.address);
			formData.append('description', values.description);
			formData.append('instruction', values.instruction);
			// formData.append('image', values.image);
			// formData.append('courseMap', values.courseMap);

			const responseData = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/events/${eventId}`,
				'PATCH',
				formData,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the loadedEvent so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setLoadedEvent(responseData.event);
			setOKLeavePage(true);
			setSaveButtonEnabled(false);
			console.log('return new event');
			props.returnNewEvent(responseData.event);
		} catch (err) {}
	};

	// const saveHandler = async values => {
	// 	try {
	// 		const formData = new FormData();
	// 		formData.append('name', values.name);
	// 		formData.append('type', values.type);
	// 		formData.append('startDate', values.startDate); //format 2020-08-01
	// 		formData.append('endDate', values.endDate);
	// 		formData.append('regStartDate', values.regStartDate);
	// 		formData.append('regEndDate', values.regEndDate);
	// 		formData.append('venue', values.venue);
	// 		formData.append('address', values.address);
	// 		formData.append('description', values.description);
	// 		formData.append('instruction', values.instruction);
	// 		// formData.append('image', values.image);
	// 		// formData.append('courseMap', values.courseMap);

	// 		const responseData = await sendRequest(
	// 			process.env.REACT_APP_BACKEND_URL + `/events/${eventId}`,
	// 			'PATCH',
	// 			formData,
	// 			{
	// 				// adding JWT to header for authentication, JWT contains clubId
	// 				Authorization: 'Bearer ' + clubAuthContext.clubToken
	// 			}
	// 		);
	// 		// Need to set the loadedEvent so we will set initialValues again.
	// 		// Without it, form will keep the old initial values.
	// 		setLoadedEvent(responseData.event);
	// 		setOKLeavePage(true);

	// 		console.log('eventId = ', eventId);
	// 		history.push('/events/' + eventId);
	// 	} catch (err) {}
	// };
	if (isLoading) {
		return (
			<div className="center">
				<LoadingSpinner />
			</div>
		);
	}
	if (!loadedEvent && !error) {
		return (
			<div className="center">
				<Card>
					<h2>Event not found!</h2>
				</Card>
			</div>
		);
	} else if (loadedEvent) {
		initialValues = {
			name: loadedEvent.name,
			type: loadedEvent.type,
			// image: loadedEvent.image,
			startDate: moment(loadedEvent.startDate).format('YYYY-MM-DD'),
			endDate: moment(loadedEvent.endDate).format('YYYY-MM-DD'),
			regStartDate: moment(loadedEvent.regStartDate).format(
				'YYYY-MM-DD'
			),
			regEndDate: moment(loadedEvent.regEndDate).format('YYYY-MM-DD'),
			venue: loadedEvent.venue,
			address: loadedEvent.address,
			description: loadedEvent.description,
			instruction: loadedEvent.instruction
			// courseMap: loadedEvent.courseMap,
			// isSaveButton: false
		};
	}

	const backHandler = () => {
		history.push(`/events/${eventId}`);
	};

	const eventForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter event information</h4>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				validationSchema={dateValidationSchema}
				onSubmit={(values, actions) => {
					// values.isSaveButton
					// 	? saveHandler(values)
					submitHandler(values);
					// if (values.isSaveButton) {
					// 	alert('Your form is saved.');
					// }
					if (actions.isSubmitting) {
						actions.setSubmitting(false);
					}
					if (!actions.isSubmitting) {
						setValidateName(() => value => {
							console.log('ValidateName');
							let error;
							if (!value) {
								error = 'Event Name is required.';
							}
							return error;
						});
						setValidateVenue(() => value => {
							console.log('ValidateVenue');
							let error;
							if (!value) {
								error = 'Event Venue is required.';
							}
							return error;
						});
						setValidateAddress(() => value => {
							console.log('ValidateAddress');
							let error;
							if (!value) {
								error = 'Event Address is required.';
							}
							return error;
						});
						setValidateDescription(() => value => {
							console.log('ValidateDescription');
							let error;
							if (!value) {
								error = 'Event description is required.';
							}
							return error;
						});
						setValidateInstruction(() => value => {
							console.log('ValidateInstruction');
							let error;
							if (!value) {
								error = 'Event instruction is required.';
							}
							return error;
						});
					}
				}}>
				{({
					errors,
					handleBlur,
					handleChange,
					handleSubmit,
					isSubmitting,
					isValid,
					setFieldValue,
					touched,
					values
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
							onChange={handleChange}
							value={values.name}
							onBlur={event => {
								// without handBlure(event) touched.name will not work
								// To take advantage of touched, we can pass formik.handleBlur to each input's onBlur prop.
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
							onChange={handleChange}
							value={values.type}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
							min={tomorrow}
							max="2030-12-31"
							className="event-form__startdate"
							value={values.startDate}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<Field
							id="endDate"
							name="endDate"
							type="date"
							min={tomorrow}
							max="2030-12-31"
							className="event-form__enddate"
							value={values.endDate}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{(touched.startDate || touched.endDate) &&
							(errors.sartDate || errors.endDate) && (
								<React.Fragment>
									<div className="event-form__field-error-startDate">
										{errors.startDate}
									</div>
									<div className="event-form__field-error-endDate">
										{errors.endDate}
									</div>
								</React.Fragment>
							)}
						<label
							htmlFor="regStartDate"
							className="event-form__label_startdate">
							Registration Start Date
						</label>
						<label
							htmlFor="regEndDate"
							className="event-form__label_enddate">
							Registration End Date
						</label>
						<br />
						<Field
							id="regStartDate"
							name="regStartDate"
							type="date"
							min={tomorrow}
							max="2030-12-31"
							className="event-form__startdate"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<Field
							id="regEndDate"
							name="regEndDate"
							type="date"
							min={tomorrow}
							max="2030-12-31"
							className="event-form__enddate"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{(touched.regStartDate || touched.regEndDate) &&
							(errors.regStartDate || errors.regEndDate) && (
								<React.Fragment>
									<div className="event-form__field-error-startDate">
										{errors.regStartDate}
									</div>
									<div className="event-form__field-error-endDate">
										{errors.regEndDate}
									</div>
								</React.Fragment>
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
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.instruction && errors.instruction && (
							<div className="event-form__field-error">
								{errors.instruction}
							</div>
						)}
						{/* <Field
							id="image"
							name="image"
							title="image"
							component={ImageUploader}
							validate={validateImageSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.image ? errors.image : ''}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/> */}
						{/* <Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={isSubmitting || !saveButtonEnabled}
							onClick={e => {
								setFieldValue('isSaveButton', true, false);
								setValidateName(() => () => {});
								setValidateVenue(() => () => {});
								setValidateAddress(() => () => {});
								setValidateDescription(() => () => {});
								setValidateInstruction(() => () => {});
							}}>
							Save
						</Button> */}
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={
								isSubmitting || !isValid || !saveButtonEnabled
							}
							onClick={e => {
								setFieldValue('isSaveButton', false, false);
							}}>
							SAVE
						</Button>
						{/* <Button type="button" size="medium" onClick={backHandler}>
							Back
						</Button> */}
						<NavigationPrompt
							afterConfirm={() => {
								localStorage.removeItem('eventID');
							}}
							// Confirm navigation if going to a path that does not start with current path:
							when={(crntLocation, nextLocation) => {
								if (
									OKLeavePage ||
									nextLocation.pathname === '/clubs/auth'
								) {
									localStorage.removeItem('eventID');
									return false;
								} else {
									return (
										!nextLocation ||
										!nextLocation.pathname.startsWith(
											crntLocation.pathname
										)
									);
								}
							}}>
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
			{!isLoading && loadedEvent && (
				<Modal
					show={showModal}
					onCancel={() => closeModalHandler()}
					header={
						showCourse
							? loadedEvent.name + ' course map'
							: loadedEvent.name
					}
					contentClass="event-item__modal__content"
					footerClass="event-item__modal-actions"
					headerClass="event-item__modal__header"
					footer={
						<Button onClick={() => closeModalHandler()}>CLOSE</Button>
					}>
					{/* render props.children */}
					{showCourse && (
						<div className="map-container">
							<img
								src={
									process.env.REACT_APP_ASSET_URL +
									`/${loadedEvent.courseMap}`
								}
								alt={loadedEvent.alt}
								className="map-container"></img>
						</div>
					)}
					{showImage && (
						<div className="map-container">
							<img
								src={
									process.env.REACT_APP_ASSET_URL +
									`/${loadedEvent.image}`
								}
								alt={loadedEvent.alt}
								className="map-container"></img>
						</div>
					)}
				</Modal>
			)}

			{!isLoading && loadedEvent && eventForm()}
		</React.Fragment>
	);
};

export default UpdateEvent;
