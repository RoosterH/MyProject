import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import Button from '../../shared/components/FormElements/Button';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';
import EntryReportForUsers from '../../clubDashboard/components/EntryReportForUsers';

import '../../shared/css/EventForm.css';

const SubmitEntry = props => {
	let eventId = props.eventId;
	let carId = props.carId;
	let carNumber = props.carNumber;
	let raceClass = props.raceClass;
	let formAnswer = props.formAnswer;

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [initialized, setInitialized] = useState(false);
	const userAuthContext = useContext(UserAuthContext);
	const formContext = useContext(FormContext);

	// continueStatus controls when to return props.newEventStatus back to NewEventManager
	const [continueStatus, setContinueStatus] = useState(false);

	// this is the return function that passes finishing status back to NewEventManager
	useEffect(() => {
		if (continueStatus) {
			props.submitStatus(continueStatus);
		}
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

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	React.useEffect(() => {
		let path = location.pathname;
		let userRedirectURL = userAuthContext.userRedirectURL;
		if (path === userRedirectURL) {
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [location, userAuthContext]);

	const [disclaimer, setDisclaimer] = useState(false);

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
		if (eventFormData.disclaimer) {
			setDisclaimer(eventFormData.disclaimer);
		}
	} else if (!initialized) {
		setInitialized(true);
		// initialize localStorage
		eventFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		eventFormData['disclaimer'] = false;
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(eventFormData)
		);
	}

	const removeEventFormData = () => {
		localStorage.removeItem('eventFormData');
	};

	const initialValues = {
		disclaimer: false
	};

	const [validateDisclaimer, setValidateDisclaimer] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'You must agree with disclaimer to register event.';
			}
			return error;
		}
	);

	const submitHandler = async values => {
		// return back to NewEntryManager
		setContinueStatus(true);
		let disclaimer = values.disclaimer;

		try {
			console.log('in submit');
			// we need to use JSON.stringify to send array objects.
			// FormData with JSON.stringify not working
			let responseData = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/entries/submit/${eventId}`,
				'POST',
				JSON.stringify({
					carId: carId,
					carNumber: carNumber,
					raceClass: raceClass,
					answer: formAnswer,
					disclaimer: disclaimer
				}),
				{
					'Content-type': 'application/json',
					// adding JWT to header for authentication
					// Authorization: 'Bearer ' + storageData.userToken
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			console.log('responseData = ', responseData);
			if (responseData.entry) {
				const userData = JSON.parse(localStorage.getItem('userData'));
				if (userData) {
					userData.userEntries.push(responseData.entry);
					localStorage.setItem('userData', JSON.stringify(userData));
				}
			}
		} catch (err) {
			console.log('err = ', err);
		}
	};

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Event Submission</h4>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
				}}>
				{({
					values,
					errors,
					isSubmitting,
					isValid,
					dirty,
					setFieldValue,
					submitted,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						<label className="event-form__checkbox">
							MySeatTime waiver <br />
							By registering for this event, you acknowledge that
							MySeatTime.com makes no refunds of any kind. View the
							MySeatTime.com terms for details.{' '}
						</label>
						<br />
						<br />
						<label className="event-form__checkbox">
							<Field
								name="acceptDisclaimer"
								validate={validateDisclaimer}
								type="checkbox"
								onBlur={event => {
									handleBlur(event);
								}}
							/>
							&nbsp; I accept the cancellation terms and conditions.
						</label>
						<Button
							type="submit"
							size="small-block"
							margin-left="1.5rem"
							disabled={
								isSubmitting || !(isValid && dirty) || submitted
							}>
							SUBMIT
						</Button>
						<Link
							to={{
								pathname: `/events/entrylistforusers/${eventId}`,
								state: {
									displayName: true,
									eventName: 'GGLC 123',
									eventId: eventId
								}
							}}>
							<Button
								type="button"
								size="small-block"
								margin-left="1.5rem"
								disabled={!continueStatus}>
								VIEW EVENT ENTRY LIST
							</Button>
						</Link>

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

export default SubmitEntry;
