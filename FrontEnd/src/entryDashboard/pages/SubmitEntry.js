import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';

import Button from '../../shared/components/FormElements/Button';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

const SubmitEntry = props => {
	const history = useHistory();
	let entryId = props.entryId;
	let eventId = props.eventId;
	let eventName = props.eventName;
	let carId = props.carId;
	let carNumber = props.carNumber;
	let raceClass = props.raceClass;
	let formAnswer = props.formAnswer;
	const editingMode = props.editingMode;

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// controller of DELETE event modal
	const [showDELModal, setShowDELModal] = useState(false);
	const openDELHandler = () => {
		setShowDELModal(true);
	};
	const closeDELHandler = () => {
		setShowDELModal(false);
	};

	const [initialized, setInitialized] = useState(false);
	const userAuthContext = useContext(UserAuthContext);
	const formContext = useContext(FormContext);
	const [fullMessage, setFullMessage] = useState('');

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
		acceptDisclaimer: editingMode ? true : false
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
		let disclaimer = values.acceptDisclaimer;

		try {
			// we need to use JSON.stringify to send array objects.
			// FormData with JSON.stringify not working
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
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
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);

			console.log('responseData = ', responseData);
			console.log('responseStatus = ', responseStatus);
			console.log('responseMessage = ', responseMessage);
			if (responseData.entry) {
				// add entry to localStrorage, in EventItem.js, we look for entries from there
				// to identify entry status. This is for performance boost.
				const userData = JSON.parse(localStorage.getItem('userData'));
				console.log('userData = ', userData);
				if (userData) {
					userData.userEntries.push(responseData.entry);
					localStorage.setItem('userData', JSON.stringify(userData));
				}
				// add entry to userAuthContext to have data persistency.
				userAuthContext.userEntries.push(responseData.entry);
			}

			if (responseStatus === 202) {
				console.log('inside 202');
				// either group is full or event is full
				setFullMessage(responseMessage);
			}
		} catch (err) {
			console.log('err = ', err);
		}
	};

	const deleteHandler = async () => {
		setShowDELModal(false);
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/entries/${entryId}`,
				'DELETE',
				null,
				{
					// No need for content-type since body is null,
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);

			if (responseStatus === 200) {
				// remove entry from localStorage
				let userData = JSON.parse(localStorage.getItem('userData'));
				let index = userData.userEntries.indexOf(entryId);
				userData.userEntries.splice(index, 1);
				localStorage.setItem('userData', JSON.stringify(userData));
			}

			// after deleting event, forward to eventManager, we do not want to send null event back
			// even we have a callback from EditEventManager
			history.push(`/users/events/${userAuthContext.userId}`);
		} catch (err) {}
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
							By registering for this event, you acknowledge that all
							the charges are handled by event organizers.
							MySeatTime.com does not handle transaction thus makes no
							refunds of any kind. View the MySeatTime.com terms for
							details.{' '}
						</label>
						<br />
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
								disabled={editingMode}
							/>
							&nbsp; I accept the charge and cancellation terms and
							conditions.
						</label>
						{!editingMode && (
							<Button
								type="submit"
								size="small-block"
								margin-left="1.5rem"
								disabled={
									isSubmitting || !(isValid && dirty) || submitted
								}>
								SUBMIT
							</Button>
						)}
						{editingMode && (
							<Button
								type="button"
								size="small-block"
								margin-left="1.5rem"
								disabled={isSubmitting}
								onClick={openDELHandler}>
								CANCEL REGISTRATION
							</Button>
						)}
						<Link
							to={{
								pathname: `/events/entrylist/${eventId}`,
								state: {
									displayName: true,
									eventName: eventName,
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
						<div className="event-form-errmsg">
							{fullMessage && <p> {fullMessage} </p>}
						</div>
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
			{showDELModal && (
				<Modal
					className="modal-delete"
					show={showDELModal}
					contentClass="event-item__modal-delete"
					onCancel={closeDELHandler}
					header="Warning!"
					footerClass="event-item__modal-actions"
					footer={
						<React.Fragment>
							<Button inverse onClick={closeDELHandler}>
								NO
							</Button>
							<Button danger onClick={deleteHandler}>
								YES
							</Button>
						</React.Fragment>
					}>
					<p className="modal__content">
						Do you really want to cancel registration of {eventName}?
						It cannot be recovered after cancellation.
					</p>
				</Modal>
			)}
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
