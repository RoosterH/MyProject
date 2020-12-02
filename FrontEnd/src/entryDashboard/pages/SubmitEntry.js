import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';
import Cleave from 'cleave.js/react';

import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';

import Button from '../../shared/components/FormElements/Button';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

import STRIPE from '../../shared/utils/webp/Stripe.webp';
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

	console.log('editingMode = ', editingMode);
	// entry fee for the event
	const [entryFee, setEntryFee] = useState(0);
	// club payment options
	const [stripe, setStripe] = useState(false);
	const [onSite, setOnSite] = useState(false);
	const [hideCCField, setHideCCField] = useState(true);
	const [succeed, setSucceed] = useState(false);

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
	const [statusMessage, setStatusMessage] = useState('');

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

	useEffect(() => {
		const getEntryFeePaymentOption = async () => {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/entries/entryFee/${eventId}`,
				'POST',
				JSON.stringify({
					answer: formAnswer
				}),
				{
					'Content-type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			setEntryFee(responseData.entryFee);
			let paymentOptions = responseData.paymentOptions;
			if (paymentOptions.indexOf('onSite') > -1) {
				setOnSite(true);
			}
			if (paymentOptions.indexOf('stripe') > -1) {
				setStripe(true);
				setHideCCField(false);
			}
		};
		if (!editingMode) {
			getEntryFeePaymentOption();
		}
	}, [
		editingMode,
		sendRequest,
		setEntryFee,
		setOnSite,
		setStripe,
		eventId,
		formAnswer,
		userAuthContext.userToken
	]);

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
		acceptDisclaimer: editingMode ? true : false,
		paymentMethod: stripe ? 'stripe' : 'onSite',
		creditCard: '',
		expirationDate: '',
		cvc: ''
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
	const [validatePaymentMethod, setValidatePaymentMethod] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'You must select a payment method.';
			}
			return error;
		}
	);

	const [validateCreditCard, setValidateCreditCard] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Please provide credit card number';
			}
			return error;
		}
	);

	const [
		validateExpirationDate,
		setValidateExpirationDate
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Please enter expiration date';
		}
		return error;
	});

	const [validateCVC, setValidateCVC] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Please enter CVC';
		}
		return error;
	});

	const submitHandler = async values => {
		// return back to NewEntryManager
		let disclaimer = values.acceptDisclaimer;
		let paymentMethod = values.paymentMethod;
		let creditCard = values.creditCard;
		let expDate = values.expirationDate;
		let cvc = values.cvc;
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
					disclaimer: disclaimer,
					paymentMethod: paymentMethod,
					creditCard: creditCard,
					expDate: expDate,
					cvc: cvc,
					entryFee: entryFee
				}),
				{
					'Content-type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			if (responseData.entry) {
				// add entry to localStrorage, in EventItem.js, we look for entries from there
				// to identify entry status. This is for performance boost.
				const userData = JSON.parse(localStorage.getItem('userData'));
				if (userData) {
					userData.userEntries.push(responseData.entry);
					localStorage.setItem('userData', JSON.stringify(userData));
				}
				// add entry to userAuthContext to have data persistency.
				userAuthContext.userEntries.push(responseData.entry);
			}
			setEntryFee(responseData.entryFee);

			if (responseStatus === 202) {
				// either group is full or event is full
				setStatusMessage(responseMessage);
				setSucceed(true);
			} else if (responseStatus === 200) {
				setStatusMessage('Registration Submitted Successfully.');
				setSucceed(true);
			}

			setContinueStatus(true);
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

	const creditCardComponent = ({
		field,
		handleBlur,
		handleChange,
		form: { touched, errors }
	}) => {
		return (
			<React.Fragment>
				<div className="event-form__field-creditcard">
					<Cleave
						{...field}
						placeholder="Credit card number"
						options={{ creditCard: true }}
					/>
				</div>
				{touched[field.name] && errors[field.name] && (
					<div className="event-form__field-creditcard-error">
						{errors[field.name]}
					</div>
				)}
			</React.Fragment>
		);
	};

	const expirationDateComponent = ({
		field,
		handleBlur,
		handleChange,
		form: { touched, errors }
	}) => {
		return (
			<React.Fragment>
				<div className="event-form__field-creditcard">
					<Cleave
						{...field}
						placeholder="Exp Date MM/YY"
						options={{ date: true, datePattern: ['m', 'y'] }}
					/>
				</div>
				{touched[field.name] && errors[field.name] && (
					<div className="event-form__field-creditcard-error">
						{errors[field.name]}
					</div>
				)}
			</React.Fragment>
		);
	};

	const [submitButtonClass, setSubmitButtonClass] = useState(
		'small-block'
	);
	useEffect(() => {
		if (onSite && stripe) {
			setSubmitButtonClass('small-block-onsite-stripe');
		} else if (stripe) {
			setSubmitButtonClass('small-block-stripe');
		} else {
			// onSite
			setSubmitButtonClass('small-block');
		}
	}, [stripe, onSite, setSubmitButtonClass]);

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
					if (!actions.isSubmitting) {
						setValidateDisclaimer(() => value => {
							let error;
							if (!value) {
								console.log('error disclaimer');
								error =
									'You must agree with disclaimer to register event.';
							}
							return error;
						});
						setValidatePaymentMethod(() => value => {
							let error;
							if (!value) {
								console.log('error payment');
								error = 'You must select a payment method.';
							}
							return error;
						});
						setValidateCreditCard(() => value => {
							let error;
							if (!value) {
								error = 'Please provide credit card number';
							}
							return error;
						});
						setValidateExpirationDate(() => value => {
							let error;
							if (!value) {
								error = 'Please enter expiration date';
							}
							return error;
						});
						setValidateCVC(() => value => {
							let error;
							if (!value) {
								error = 'Please enter CVC';
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
					dirty,
					setFieldValue,
					submitted,
					touched,
					handleBlur,
					handleChange
				}) => (
					<Form className="event-form-container">
						<label className="event-form__paymentmethod">
							MySeatTime waiver <br />
							By registering for this event, you acknowledge that all
							the charges are handled by event organizers.
							MySeatTime.com does not handle transaction thus makes no
							refunds of any kind. View the MySeatTime.com terms for
							details.{' '}
						</label>
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
						<label className="event-form__checkbox">
							<b>Total Entry Due: ${entryFee}</b>
						</label>
						{stripe && onSite && (
							<div
								id="paymentMethod"
								className="event-form__paymentmethod">
								Please Select Payment Methord:
								<div role="group" aria-labelledby="paymentMethod">
									<label className="event-form__field_radio">
										<Field
											type="radio"
											name="paymentMethod"
											value="onSite"
											validate={validatePaymentMethod}
											onChange={event => {
												handleChange(event);
												setHideCCField(true);
											}}
										/>
										&nbsp;&nbsp;&nbsp;&nbsp;
										<i className="fal fa-money-bill fa-2x " />
										&nbsp;&nbsp; On-Site
									</label>
									<label className="event-form__field_radio">
										<Field
											type="radio"
											name="paymentMethod"
											value="stripe"
											validate={validatePaymentMethod}
											onChange={event => {
												handleChange(event);
												setHideCCField(false);
											}}
										/>{' '}
										<img
											src={STRIPE}
											alt="Stripe"
											className="stripe"
										/>
									</label>
									{!hideCCField && (
										<React.Fragment>
											<Field
												id="creditCard"
												name="creditCard"
												values={values}
												label="creditCard"
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
												handleChange={event => {
													console.log('name = ', event.name);
													console.log(
														'value1 = ',
														event.target.rawValue
													);
													handleChange(event.target.rawValue);
												}}
												component={creditCardComponent}
												validate={validateCreditCard}
											/>
											<Field
												id="expirationDate"
												name="expirationDate"
												values={values}
												label="expirationDate"
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
												handleChange={event => {
													handleChange(event.target.rawValue);
												}}
												component={expirationDateComponent}
												validate={validateExpirationDate}
											/>
											<div className="event-form__field-creditcard">
												<Field
													id="cvc"
													name="cvc"
													type="text"
													placeholder="CVC"
													validate={validateCVC}
													onBlur={event => {
														handleBlur(event);
														setOKLeavePage(false);
													}}
												/>
											</div>
											{touched.cvc && errors.cvc && (
												<div className="event-form__field-creditcard-error">
													{errors.cvc}
												</div>
											)}
										</React.Fragment>
									)}
								</div>
							</div>
						)}
						{stripe && !onSite && (
							<React.Fragment>
								<div
									id="paymentMethod"
									className="event-form__paymentmethod">
									Please Select Payment Methord:
									<div role="group" aria-labelledby="paymentMethod">
										<label className="event-form__field_radio">
											<Field
												type="radio"
												name="paymentMethod"
												value="stripe"
												validate={validatePaymentMethod}
											/>{' '}
											<img
												src={STRIPE}
												alt="Stripe"
												className="stripe"
											/>
										</label>
										<Field
											id="creditCard"
											name="creditCard"
											values={values}
											label="creditCard"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											handleChange={event => {
												console.log('name = ', event.name);
												console.log(
													'value1 = ',
													event.target.rawValue
												);
												handleChange(event.target.rawValue);
											}}
											component={creditCardComponent}
											validate={validateCreditCard}
										/>
										<Field
											id="expirationDate"
											name="expirationDate"
											values={values}
											label="expirationDate"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											handleChange={event => {
												handleChange(event.target.rawValue);
											}}
											component={expirationDateComponent}
											validate={validateExpirationDate}
										/>
										<div className="event-form__field-creditcard">
											<Field
												id="cvc"
												name="cvc"
												type="text"
												placeholder="CVC"
												validate={validateCVC}
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
											/>
										</div>
										{touched.cvc && errors.cvc && (
											<div className="event-form__field-creditcard-error">
												{errors.cvc}
											</div>
										)}
									</div>
								</div>
							</React.Fragment>
						)}
						{!stripe && onSite && (
							<div
								id="paymentMethod"
								className="event-form__checkbox">
								Please Select Payment Methord:
								<div role="group" aria-labelledby="paymentMethod">
									<label className="event-form__field_radio">
										<Field
											type="radio"
											name="paymentMethod"
											value="onSite"
											validate={validatePaymentMethod}
										/>
										&nbsp;&nbsp;&nbsp;&nbsp;
										<i className="fal fa-money-bill fa-2x " />
										&nbsp;&nbsp; On-Site
									</label>
								</div>
							</div>
						)}
						{/* !dirty is to grey out button when the form first gets loaded */}
						{!editingMode && (
							<Button
								type="submit"
								size="small-block-payment"
								disabled={
									isSubmitting || !isValid || !dirty || submitted
								}>
								SUBMIT
							</Button>
						)}
						{editingMode && (
							<Button
								type="button"
								size="small-block-warning"
								margin-left="1.5rem"
								disabled={isSubmitting || !isValid}
								onClick={openDELHandler}>
								CANCEL REGISTRATION
							</Button>
						)}
						{(editingMode || succeed) && (
							<Link
								to={{
									pathname: `/events/entrylist/${eventId}`,
									state: {
										displayName: true,
										eventName: eventName,
										eventId: eventId
									}
								}}
								className="event-form__link">
								<Button
									type="button"
									size="small-block"
									margin-left="1.5rem"
									disabled={!continueStatus && !editingMode}>
									VIEW EVENT ENTRY LIST
								</Button>
							</Link>
						)}
						<div className="event-form-errmsg">
							{statusMessage && <p> {statusMessage} </p>}
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
								// remove UserRedirectURL from memory
								userAuthContext.setUserRedirectURL(null);
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

	// Error in submission, we will forward page to users events
	const onclearCallBack = () => {
		clearError();
		history.push(`/users/events/${userAuthContext.userId}`);
	};

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
			<ErrorModal error={error} onClear={onclearCallBack} />
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
