import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';
import * as Yup from 'yup';

// import { EditorState } from 'draft-js';
// import { RichEditorExample } from '../components/RichEditor';
// import 'draft-js/dist/Draft.css';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';
import { eventTypes } from '../../event/components/EventTypes';

const NewEvent = props => {
	const [initialized, setInitialized] = useState(false);
	const clubAuthContext = useContext(ClubAuthContext);
	const formContext = useContext(FormContext);

	// contButton controls when to enable CONTINUE button, set to true after submitHandler() succeeds
	// const [contButton, setContButton] = useState(false);
	// continueStatus controls when to return props.newEventStatus back to NewEventManager
	const [continueStatus, setContinueStatus] = useState(false);
	const [eventId, setEventId] = useState();

	// const continueHandler = () => {
	// 	setContinueStatus(true);
	// };
	// this is the return function that passes finishing status back to NewEventManager
	useEffect(() => {
		props.newEventStatus(continueStatus);
	}, [continueStatus, props]);

	// return eventId to NewEventManager
	useEffect(() => {
		props.eventIdHandler(eventId);
	}, [eventId, props]);

	useEffect(() => {
		let mounted = true;
		if (mounted) {
			formContext.setIsInsideForm(true);
		}
		return () => {
			mounted = false;
		};
	}, [formContext]);

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// authentication check
	useClubLoginValidation('/clubs/events/new');

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	React.useEffect(() => {
		let path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location, clubAuthContext]);

	let tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
	const [name, setName] = useState('');
	const [type, setType] = useState('Autocross');
	const [startDate, setStartDate] = useState(tomorrow);
	const [endDate, setEndDate] = useState(tomorrow);
	const [regStartDate, setRegStartDate] = useState(tomorrow);
	const [regEndDate, setRegEndDate] = useState(tomorrow);
	const [venue, setVenue] = useState('');
	const [address, setAddress] = useState('');
	const [description, setDescription] = useState('');
	const [instruction, setInstruction] = useState('');
	// todo: retrieve file from Reader: const [image, setImage] = useState();
	// todo: const [courseMap, setCourseMap] = useState('');
	// let image = undefined;
	// let courseMap = undefined;

	// initialize local storage
	// Get the existing data
	var eventFormData = localStorage.getItem('eventFormData');

	// If no existing data, create an array; otherwise retrieve it
	eventFormData = eventFormData ? JSON.parse(eventFormData) : {};

	const [OKLeavePage, setOKLeavePage] = useState(true);
	// local storage gets the higest priority
	// get from localStorage
	if (
		!initialized &&
		eventFormData &&
		moment(eventFormData.expirationDate) > moment()
	) {
		setInitialized(true);
		// Form data
		if (eventFormData.name) {
			setName(eventFormData.name);
		}
		if (eventFormData.type) {
			setType(eventFormData.type);
		}
		if (eventFormData.startDate) {
			setStartDate(eventFormData.startDate);
		}
		if (eventFormData.endDate) {
			setEndDate(eventFormData.endDate);
		}
		if (eventFormData.regStartDate) {
			setRegStartDate(eventFormData.regStartDate);
		}
		if (eventFormData.regEndDate) {
			setRegEndDate(eventFormData.regEndDate);
		}
		if (eventFormData.venue) {
			setVenue(eventFormData.venue);
		}
		if (eventFormData.address) {
			setAddress(eventFormData.address);
		}
		if (eventFormData.description) {
			setDescription(eventFormData.description);
		}
		if (eventFormData.instruction) {
			setInstruction(eventFormData.instruction);
		}
		// if (eventFormData.image) {
		//  //setImage(eventFormData.image);
		// //setImageOK(false);
		// }
		// if (eventFormData.courseMap) {
		// setCourseMap(eventFormData.courseMap);
		// setCourseMapOK(false);
		// }
	} else if (!initialized) {
		setInitialized(true);
		// initialize localStorage
		eventFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		eventFormData['name'] = '';
		eventFormData['type'] = 'Autocross';
		eventFormData['startDate'] = tomorrow;
		eventFormData['endDate'] = tomorrow;
		eventFormData['regStartDate'] = tomorrow;
		eventFormData['regEndDate'] = tomorrow;
		eventFormData['venue'] = '';
		eventFormData['address'] = '';
		eventFormData['description'] = '';
		eventFormData['instruction'] = '';
		// eventFormData['image'] = undefined;
		// eventFormData['courseMap'] = undefined;
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(eventFormData)
		);
	}

	const removeEventFormData = () => {
		localStorage.removeItem('eventFormData');
		// history.push(`/events/club/${clubAuthContext.clubId}`);
	};

	const initialValues = {
		// editorState: new EditorState.createEmpty(),
		name: name,
		type: type,
		// image: image,
		startDate: startDate,
		endDate: endDate,
		regStartDate: regStartDate,
		regEndDate: regEndDate,
		venue: venue,
		address: address,
		description: description,
		instruction: instruction
		// courseMap: courseMap
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
	const submitHandler = async (values, actions) => {
		try {
			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('type', values.type);
			formData.append(
				'startDate',
				moment(values.startDate, moment.ISO_8601)
			);
			formData.append(
				'endDate',
				moment(values.endDate, moment.ISO_8601)
			);
			formData.append(
				'regStartDate',
				moment(values.regStartDate, moment.ISO_8601)
			);
			formData.append(
				'regEndDate',
				moment(values.regEndDate, moment.ISO_8601)
			);
			formData.append('venue', values.venue);
			formData.append('address', values.address);
			formData.append('description', values.description);
			formData.append('instruction', values.instruction);
			// formData.append('image', values.image);
			// formData.append('courseMap', values.courseMap);
			const responseData = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + '/events',
				'POST',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setOKLeavePage(true);
			setEventId(responseData.event.id);
			// move to next stage
			setContinueStatus(true);
		} catch (err) {}
	};

	/***** Form Validation Section  *****/
	// 1. Field level: Field validate={validateName}. This validates when Field is onBlur
	// 2. startDate, endDate, regStartDate, and regEndDate use Yup beacuse Yup.ref makes it convenient to check peer fields
	// 3. Submit: use Formik isValid to enable the button.  Formik submission will validate everything.
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
			.when('startDate', (startDate, schema) => {
				let dayBefore = moment(startDate)
					.add(-1, 'days')
					.format('YYYY-MM-DD');
				return schema.max(
					dayBefore,
					'Registration start date needs to be earlier event start date'
				);
			})
			.required(),
		regEndDate: Yup.date()
			.min(
				Yup.ref('regStartDate'),
				'Registration end date cannot be earlier than registration start date'
			)
			.when('startDate', (startDate, schema) => {
				let dayBefore = moment(startDate)
					.add(-1, 'days')
					.format('YYYY-MM-DD');
				return schema.max(
					dayBefore,
					'Registration end date needs to be earlier event start date'
				);
			})
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

	const validateImageSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		}
		return error;
	};

	const validateCourseMapSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		}
		return error;
	};
	/***** End of Form Validation *****/

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter event information</h4>
				<h5>&nbsp;All fields are required</h5>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				validationSchema={dateValidationSchema}
				onSubmit={(values, actions) => {
					submitHandler(values);
					if (!actions.isSubmitting) {
						setValidateName(() => value => {
							let error;
							if (!value) {
								error = 'Event Name is required.';
							}
							return error;
						});
						setValidateVenue(() => value => {
							let error;
							if (!value) {
								error = 'Event Venue is required.';
							}
							return error;
						});
						setValidateAddress(() => value => {
							let error;
							if (!value) {
								error = 'Event Address is required.';
							}
							return error;
						});
						setValidateDescription(() => value => {
							let error;
							if (!value) {
								error = 'Event description is required.';
							}
							return error;
						});
						setValidateInstruction(() => value => {
							let error;
							if (!value) {
								error = 'Event instruction is required.';
							}
							return error;
						});
					}
				}}>
				{({
					values,
					errors,
					isSubmitting,
					isValid,
					setFieldValue,
					submitted,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						<label htmlFor="name" className="event-form__label">
							<i className="fal fa-file-alt" />
							&nbsp; Event Name
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
								setOKLeavePage(false);
							}}
						/>
						{touched.name && errors.name && (
							<div className="event-form__field-error">
								{errors.name}
							</div>
						)}
						<label htmlFor="eventType" className="event-form__label">
							<i className="fal fa-flag-checkered" />
							&nbsp; Event Type
						</label>
						<Field
							id="type"
							name="type"
							as="select"
							className="event-form__eventtype"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('type', event.target.value);
								setOKLeavePage(false);
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
							<i className="fal fa-calendar-alt" />
							&nbsp; Start Date
						</label>
						<label
							htmlFor="endDate"
							className="event-form__label_enddate">
							<i className="fal fa-calendar-alt" />
							&nbsp; End Date
						</label>
						<br />
						<Field
							id="startDate"
							name="startDate"
							type="date"
							min={tomorrow}
							max="2030-12-31"
							className="event-form__startdate"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('startDate', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="endDate"
							name="endDate"
							type="date"
							min={tomorrow}
							max="2030-12-31"
							className="event-form__enddate"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('endDate', event.target.value);
								setOKLeavePage(false);
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
							<i className="fal fa-calendar-alt" />
							&nbsp; Registration Start Date
						</label>
						<label
							htmlFor="regEndDate"
							className="event-form__label_enddate">
							<i className="fal fa-calendar-alt" />
							&nbsp; Registration End Date
						</label>
						<Field
							id="regStartDate"
							name="regStartDate"
							type="date"
							min={tomorrow}
							max="2030-12-31"
							className="event-form__startdate"
							onBlur={event => {
								handleBlur(event);
								updateEventFormData(
									'regStartDate',
									event.target.value
								);
								setOKLeavePage(false);
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
								updateEventFormData('regEndDate', event.target.value);
								setOKLeavePage(false);
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
							<i className="fal fa-plane-alt"></i>
							&nbsp; Venue
						</label>
						<Field
							id="venue"
							name="venue"
							type="text"
							placeholder="ex: Crows Landing"
							className="event-form__field"
							validate={validateVenue}
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('venue', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.venue && errors.venue && (
							<div className="event-form__field-error">
								{errors.venue}
							</div>
						)}
						<label htmlFor="address" className="event-form__label">
							<i className="far fa-map-marker-alt" />
							&nbsp; Venue Address
						</label>
						<Field
							id="address"
							name="address"
							type="text"
							placeholder="ex: Crows Landing, CA"
							className="event-form__field"
							validate={validateAddress}
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('address', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.address && errors.address && (
							<div className="event-form__field-error">
								{errors.address}
							</div>
						)}
						{/* <label
							htmlFor="description"
							className="event-form__label">
							Event Description
						</label>
						<RichEditorExample
							editorState={values.editorState}
							onChange={setFieldValue}
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
						/> */}
						<label
							htmlFor="description"
							className="event-form__label">
							<i className="fal fa-edit" />
							&nbsp; Event Description
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
								setOKLeavePage(false);
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
							<i className="fal fa-list-alt" />
							&nbsp; Event Instruction
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
								setOKLeavePage(false);
							}}
						/>
						{touched.instruction && errors.instruction && (
							<div className="event-form__field-error">
								{errors.instruction}
							</div>
						)}
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={isSubmitting || !isValid}>
							SAVE &amp; CONTINUE
						</Button>
						{/* <Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							disabled={!contButton}
							onClick={continueHandler}>
							CONTINUE
						</Button> */}
						<NavigationPrompt
							afterConfirm={() => {
								formContext.setIsInsideForm(false);
								removeEventFormData();
							}}
							// Confirm navigation if going to a path that does not start with current path.
							// We don't want to confirm navigation when OKLeavePage === true and redirect to '/clubs/auth' due to
							// authentication issue
							when={(crntLocation, nextLocation) => {
								if (OKLeavePage) {
									formContext.setIsInsideForm(false);
									removeEventFormData();
									return false;
								} else {
									// nextLocation.pathname !== '/clubs/auth' &&  --- adding this line causing state update on an
									// unmounted component issue.  Without it, confirmation modal will pop up
									// always gives the warning, because we want to be able to
									// clear localStorage after confirm
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
											contentclassName="event-item__modal-content"
											footerclassName="event-item__modal-actions"
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
