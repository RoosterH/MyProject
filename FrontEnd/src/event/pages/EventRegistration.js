import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Field, Form, Formik, ErrorMessage } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

// import { EditorState } from 'draft-js';
// import { RichEditorExample } from '../components/RichEditor';
import 'draft-js/dist/Draft.css';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
// import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

const EventRegistration = props => {
	let eventId = props.eventId;
	const [initialized, setInitialized] = useState(false);
	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;
	const formContext = useContext(FormContext);

	const [continueStatus, setContinueStatus] = useState(false);
	// publishButton controls when to enable CONTINUE button, set to true after saveHandler() succeeds
	const [publishButton, setPublishButton] = useState(false);
	// set PUBLISH button name
	const [publishBtnName, setPublishBtnName] = useState('PUBLISH');

	// this is the return function that passes finishing status back to NewEventManager
	useEffect(() => {
		props.registrationStatus(continueStatus);
	}, [continueStatus, props]);

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
	useClubLoginValidation('/clubs/events/registration');

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

	const [totalCap, setTotalCap] = useState('');
	const [numGroups, setNumGroups] = useState('');
	const [capDistribution, setCapDistribution] = useState(false);
	const [multiDayEvent, setMultiDayEvent] = useState(false);
	const [privateEvent, setPrivateEvent] = useState(false);

	// initialize local storage
	// Get the existing data
	var eventFormData = localStorage.getItem('eventFormData');

	// If no existing data, create an array; otherwise retrieve it
	eventFormData = eventFormData ? JSON.parse(eventFormData) : {};

	const [OKLeavePage, setOKLeavePage] = useState(true);

	// get clubEventSettings from backend to determine wheather to display private event checkbox
	const [hostPrivateEvent, setHostPrivateEvent] = useState(false);
	useEffect(() => {
		const getClubEventSettings = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/eventSettings/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				setHostPrivateEvent(
					responseData.clubEventSettings.hostPrivateEvent
				);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		getClubEventSettings();
	}, []);
	// local storage gets the higest priority
	// get from localStorage
	if (
		!initialized &&
		eventFormData &&
		moment(eventFormData.expirationDate) > moment()
	) {
		setInitialized(true);
		// Form data
		if (eventFormData.totalCap) {
			setTotalCap(eventFormData.totalCap);
		}
		if (eventFormData.numGroups) {
			setNumGroups(eventFormData.numGroups);
		}
		if (eventFormData.capDistribution) {
			setCapDistribution(eventFormData.capDistribution);
		}
		if (eventFormData.multiDayEvent) {
			setMultiDayEvent(eventFormData.multiDayEvent);
		}
		if (eventFormData.privateEvent) {
			setPrivateEvent(eventFormData.privateEvent);
		}
	} else if (!initialized) {
		setInitialized(true);
		// initialize localStorage
		eventFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		eventFormData['totalCap'] = '';
		eventFormData['numGroups'] = '';
		eventFormData['capDistribution'] = false;
		eventFormData['multiDayEvent'] = false;
		eventFormData['privateEvent'] = false;
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(eventFormData)
		);
	}

	const removeEventFormData = () => {
		localStorage.removeItem('eventFormData');
	};

	const initialValues = {
		// editorState: new EditorState.createEmpty(),
		totalCap: totalCap,
		numGroups: numGroups,
		capDistribution: capDistribution,
		multiDayEvent: multiDayEvent,
		privateEvent: privateEvent
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

	const [
		capDistributionClicked,
		setCapDistributionClicked
	] = useState(false);

	const togglecapDistribution = event => {
		setCapDistributionClicked(event.target.checked);
	};

	const history = useHistory();
	const saveHandler = async (values, actions) => {
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/events/registration/${eventId}`,
				'PATCH',
				JSON.stringify({
					totalCap: values.totalCap,
					numGroups: values.numGroups,
					capDistribution: values.capDistribution,
					multiDayEvent: values.multiDayEvent,
					privateEvent: values.privateEvent
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setOKLeavePage(true);
			setContinueStatus(true);
			setPublishButton(true);
			props.saveStatus(true);
		} catch (err) {}
	};

	/***** Form Validation Section  *****/
	const [validateTotalCap, setValidateTotalCap] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Total participants is required.';
			}
			let numVal = parseInt(value);
			if (isNaN(numVal)) {
				error = 'Please inputer a number.';
			}
			return error;
		}
	);

	const [validateNumGroups, setValidateNumGroups] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Number of groups is required.';
			}
			let numVal = parseInt(value);
			if (isNaN(numVal)) {
				error = 'Please inputer a number.';
			}
			return error;
		}
	);

	const publishHandler = async () => {
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/publish/${eventId}`,
				'PATCH',
				JSON.stringify({ published: true }),
				{
					// No need for content-type since body is null,
					// adding JWT to header for authentication
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setPublishButton(false);
			setPublishBtnName('PUBLISHED');
		} catch (err) {}
	};

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter event registration information</h4>
				<h5>
					&nbsp;Values cannot be modified after event been saved.
				</h5>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					saveHandler(values);
					if (!actions.isSubmitting) {
						setValidateTotalCap(() => value => {
							let error;
							if (!value) {
								error = 'Total number of participants is required.';
							}
							let numVal = parseInt(value);
							if (isNaN(numVal)) {
								error = 'Please inputer a number.';
							}
							return error;
						});
						setValidateNumGroups(() => value => {
							let error;
							if (!value) {
								error = 'Number of groups is required.';
							}
							let numVal = parseInt(value);
							if (isNaN(numVal)) {
								error = 'Please inputer a number.';
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
						<label htmlFor="totalCap" className="event-form__label">
							<i className="fal fa-users"></i>
							&nbsp; Total Participants
						</label>
						<Field
							id="totalCap"
							name="totalCap"
							type="text"
							className="event-form__field_quarter"
							validate={validateTotalCap}
							onBlur={event => {
								// without handBlure(event) touched.name will not work
								handleBlur(event);
								updateEventFormData('totalCap', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.totalCap && errors.totalCap && (
							<div className="event-form__field-error_quarter">
								{errors.totalCap}
							</div>
						)}
						<label htmlFor="numGroups" className="event-form__label">
							<i className="fal fa-users-class"></i>
							&nbsp; Number of Groups
						</label>
						<Field
							id="numGroups"
							name="numGroups"
							type="text"
							className="event-form__field_quarter"
							validate={validateNumGroups}
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('numGroups', event.target.value);
								setOKLeavePage(false);
							}}></Field>
						{touched.numGroups && errors.numGroups && (
							<div className="event-form__field-error_quarter">
								{errors.numGroups}
							</div>
						)}
						<label className="event-form__checkbox">
							<Field
								id="capDistribution"
								name="capDistribution"
								type="checkbox"
								// validate={validateCapDistribution(values)}
								onBlur={event => {
									handleBlur(event);
									setOKLeavePage(false);
								}}
							/>
							&nbsp; Check the box if you want to evenly distribute
							total participant number to each group.
						</label>
						{props.multiDayEvent && (
							<label className="event-form__checkbox">
								<Field
									id="multiDayEvent"
									name="multiDayEvent"
									type="checkbox"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
									}}
								/>
								&nbsp; You are creating a multiple day event. Please
								check the box if each day represent a single event.
							</label>
						)}
						{hostPrivateEvent && (
							<label className="event-form__checkbox">
								<Field
									id="privateEvent"
									name="privateEvent"
									type="checkbox"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
									}}
								/>
								&nbsp; Check the box if this is a private event. (A
								private event is only visivle with the event link.)
							</label>
						)}
						{/* error message not working */}
						{/* {touched.capDistribution && errors.capDistribution && (
							<div className="event-form__field-error">
								{errors.capDistribution}
							</div>
						)}
						<ErrorMessage
							name="capDistribution"
							className="event-form__field-error-quarter"
						/> */}
						<br />
						<Button
							type="submit"
							size="medium-block"
							margin-left="1.5rem"
							disabled={isSubmitting || !isValid}>
							SAVE
						</Button>
						<Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							disabled={!publishButton}
							onClick={publishHandler}>
							{publishBtnName}
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								formContext.setIsInsideForm(false);
								removeEventFormData();
							}}
							// Confirm navigation if going to a path that does not start with current path.
							// We don't want to confirm navigation when OKLeavePage === true and redirect to '/clubs/auth' due to
							// authentication issue
							when={(crntLocation, nextLocation) => {
								// remove ClubRedirectURL from memory
								clubAuthContext.setClubRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
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

export default EventRegistration;
