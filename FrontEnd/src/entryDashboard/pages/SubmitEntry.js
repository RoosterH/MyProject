import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';
// import Cleave from 'cleave.js/react';

import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';

import Button from '../../shared/components/FormElements/Button';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';
import './Entry.css';

import { Elements } from '@stripe/react-stripe-js';
import STRIPE from '../../shared/utils/webp/Stripe.webp';
import CardSetupForm from '../components/CardSetupForm';
import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(
// 	// process.env.STRIPE_PUBLISHABLE_KEY
// 	'pk_test_51HpjVQG10ZElXQJ4LAk8pnnOuC23BzzmIBwNdIQgZf8ZjbLg5XjelbRjRP2pUWfDY556b3Y8JpJKG2hXXvBIxr830094NIq6Vu'
// );

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

	const [stripePromise, setStripePromise] = useState(
		loadStripe(
			// process.env.STRIPE_PUBLISHABLE_KEY
			'pk_test_51HpjVQG10ZElXQJ4LAk8pnnOuC23BzzmIBwNdIQgZf8ZjbLg5XjelbRjRP2pUWfDY556b3Y8JpJKG2hXXvBIxr830094NIq6Vu'
		)
	);

	// entry fee for the event
	const [entryFee, setEntryFee] = useState(0);
	// club payment options
	const [stripe, setStripe] = useState(false);
	const [onSite, setOnSite] = useState(false);
	// initial values for payment method, this is where we want to set the radio button initially
	const [paymentMethodInit, setPaymentMethodInit] = useState(
		'stripe'
	);
	// For EditingMode, user previously select payment method
	const [paymentMethod, setPaymentMethod] = useState();
	const [creditCard, setCreditCard] = useState('');
	const [expDate, setExpDate] = useState('');
	const [cvc, setCVC] = useState('');
	const [hideCCField, setHideCCField] = useState(true);
	const [succeed, setSucceed] = useState(false);
	const [email, setEmail] = useState('');
	const [
		stripePaymentMethodId,
		setStripePaymentMethodId
	] = useState();
	const [stripeError, setStripeError] = useState();
	const [stripeSetupIntentId, setStripeSetupIntentId] = useState();

	// clear error modal
	const clearErrorCallback = () => {
		setFoundError(null);
	};

	// This section controls hide/show credit card/exp date/cvc
	const [showPublicKey, setShowPublicKey] = useState(false);
	const [showPublicKeyButton, setShowPublicKeyButton] = useState(
		<i className="fa fa-eye-slash" />
	);
	useEffect(() => {
		if (showPublicKey) {
			setShowPublicKeyButton(<i className="fa fa-eye" />);
		} else {
			setShowPublicKeyButton(<i className="fa fa-eye-slash " />);
		}
	}, [showPublicKey, setShowPublicKeyButton]);

	const [foundError, setFoundError] = useState();

	useEffect(() => {
		if (error) {
			console.log('http error');
			setFoundError(error);
		}
		if (stripeError) {
			console.log('stripe error');
			setFoundError(stripeError.message);
		}
	}, [error, stripeError]);

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

	const userName = userAuthContext.userName;

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

			// for EditingMode
			// paymentMethod is what user chose how to pay for the entry fee
			let paymentMethod = responseData.paymentMethod;
			setPaymentMethod(paymentMethod);

			// paymentOptions is the payment options offered by club that contains "stripe" and/or "onSite"
			let paymentOptions = responseData.paymentOptions;
			if (paymentOptions.indexOf('onSite') > -1) {
				setOnSite(true);
			}
			if (paymentOptions.indexOf('stripe') > -1) {
				setStripe(true);
			}
			setCreditCard(responseData.creditCard);
			setExpDate(responseData.expDate);
			setCVC(responseData.cvc);
		};
		getEntryFeePaymentOption();
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

	useEffect(() => {
		if (paymentMethod) {
			setPaymentMethodInit(paymentMethod);
			if (paymentMethod === 'stripe') {
				setHideCCField(false);
			} else {
				setHideCCField(true);
			}
		} else if (stripe) {
			setPaymentMethodInit('stripe');
			setHideCCField(false);
		} else {
			setPaymentMethodInit('onSite');
			setHideCCField(true);
		}
	}, [stripe, onSite, paymentMethod]);

	console.log('paymentMethodInit = ', paymentMethodInit);
	const initialValues = {
		acceptDisclaimer: editingMode ? true : false,
		paymentMethod: paymentMethodInit
		// creditCardField: creditCard,
		// expDateField: expDate,
		// cvcField: cvc
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

	const [validateExpDate, setValidateExpDate] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Please enter expiration date';
			}
			return error;
		}
	);

	const [validateCVC, setValidateCVC] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Please enter CVC';
		}
		return error;
	});

	const submitHandler = async values => {
		// wipe out credit card info if paymentMethod is onSite
		let disclaimer = values.acceptDisclaimer;
		let paymentMethod = values.paymentMethod;
		let creditCard =
			paymentMethod === 'stripe' ? values.creditCardField : '';
		let expDate =
			paymentMethod === 'stripe' ? values.expDateField : '';
		let cvc = paymentMethod === 'stripe' ? values.cvcField : '';
		if (editingMode) {
			try {
				// we need to use JSON.stringify to send array objects.
				// FormData with JSON.stringify not working
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/entries/payment/${entryId}`,
					'PATCH',
					JSON.stringify({
						paymentMethod: paymentMethod,
						stripeSetupIntentId: stripeSetupIntentId,
						stripePaymentMethodId: stripePaymentMethodId
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
					const userData = JSON.parse(
						localStorage.getItem('userData')
					);
					if (userData) {
						userData.userEntries.push(responseData.entry);
						localStorage.setItem(
							'userData',
							JSON.stringify(userData)
						);
					}
					// add entry to userAuthContext to have data persistency.
					userAuthContext.userEntries.push(responseData.entry);
				}
				if (responseStatus === 200) {
					setStatusMessage(
						'Registration Payment Method Changed Successfully.'
					);
					setSucceed(true);
				}
			} catch (err) {
				console.log('err = ', err);
			}
		} else {
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
						entryFee: entryFee,
						stripeSetupIntentId: stripeSetupIntentId,
						stripePaymentMethodId: stripePaymentMethodId
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
					const userData = JSON.parse(
						localStorage.getItem('userData')
					);
					if (userData) {
						userData.userEntries.push(responseData.entry);
						localStorage.setItem(
							'userData',
							JSON.stringify(userData)
						);
					}
					// add entry to userAuthContext to have data persistency.
					userAuthContext.userEntries.push(responseData.entry);
				}
				setEntryFee(responseData.entryFee);
				setEmail(responseData.email);

				if (responseStatus === 202) {
					// either group is full or event is full
					setStatusMessage(responseMessage);
					setSucceed(true);
				} else if (responseStatus === 200) {
					setStatusMessage('Registration Submitted Successfully.');
					setSucceed(true);
				}
			} catch (err) {
				console.log('err = ', err);
			}
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

	// const CustomField = ({ label, ...props }) => {
	// 	const [field, meta, helpers] = useField(props);
	// 	return (
	// 		<>
	// 			<Cleave
	// 				{...field}
	// 				placeholder={props.placeholder}
	// 				options={props.options}
	// 				type={props.type}
	// 				className={props.className}
	// 			/>
	// 			{props.icon && (
	// 				<span onClick={toggleShowPublicKeyButton}>
	// 					{showPublicKeyButton}
	// 				</span>
	// 			)}
	// 			{meta.touched && meta.error ? (
	// 				<div className={props.errorClassName}>{meta.error}</div>
	// 			) : null}
	// 		</>
	// 	);
	// };

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

	console.log(
		'stripe && !stripePaymentMethodId = ',
		stripe && !stripePaymentMethodId
	);

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				{!editingMode && <h4>Event Submission</h4>}
				{editingMode && <h4>Payment Method</h4>}
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
						setValidateExpDate(() => value => {
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
					handleChange,
					validate
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
						<label className="event-form__paymentmethod">
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
						<b className="event-form__checkbox">
							Total Entry Due: ${entryFee}
						</b>
						{stripe && onSite && (
							<div
								id="paymentMethod"
								className="event-form__paymentmethod">
								Please Select Payment Methord:
								<div role="group" aria-labelledby="paymentMethod">
									<label className="event-form__field_paymentOption">
										<Field
											lable="On-Site Payment"
											type="radio"
											name="paymentMethod"
											value="onSite"
											validate={validatePaymentMethod}
											disabled={stripe && stripePaymentMethodId}
											checked={values.paymentMethod === 'onSite'}
											onChange={event => {
												setFieldValue('paymentMethod', 'onSite');
												handleChange(event);
												setHideCCField(true);
											}}
										/>
										&nbsp;&nbsp; On-Site Payment &nbsp;&nbsp;
										<i className="fal fa-money-bill fa-2x " />
									</label>
									<label className="event-form__field_paymentOption">
										<Field
											label="Stripe"
											type="radio"
											name="paymentMethod"
											value="stripe"
											validate={validatePaymentMethod}
											disabled={stripe && stripePaymentMethodId}
											checked={values.paymentMethod === 'stripe'}
											onChange={event => {
												setFieldValue('paymentMethod', 'stripe');
												handleChange(event);
												setHideCCField(false);
											}}
										/>{' '}
										Stripe &nbsp;
										<img
											src={STRIPE}
											alt="Stripe"
											className="stripe"
										/>
									</label>
									{!hideCCField && (
										<div className="">
											<label className="event-form__label">
												Charge will be made by event organizer. Credit
												card information is saved at Stripe.
												MYSeatTime does not store credit card
												information.{' '}
											</label>
											<Elements stripe={stripePromise}>
												<CardSetupForm
													userName={userName}
													email={email}
													eventId={eventId}
													getStripePaymentMethodId={
														getStripePaymentMethodId
													}
													getStripeError={getStripeError}
													getStripeSetupIntentId={
														getStripeSetupIntentId
													}
												/>
											</Elements>
										</div>
									)}
									{/* {!hideCCField && (
										<React.Fragment>
											<div style={{ position: 'relative' }}>
												// To set type as text or password, Formik CustomField works but not with component
												<CustomField
													name="creditCardField"
													type={showPublicKey ? 'text' : 'password'}
													placeholder="Credit Card Number"
													values={values}
													validate={validateCreditCard}
													options={{ creditCard: true }}
													icon={true}
													onBlur={event => {
														handleBlur(event);
														setOKLeavePage(false);
													}}
													className="event-form__field-creditcard-inline"
													errorClassName="event-form__field-creditcard-error"
												/>
											</div>
											<CustomField
												name="expDateField"
												type={showPublicKey ? 'text' : 'password'}
												placeholder="Exp Date MM/YY"
												options={{
													date: true,
													datePattern: ['m', 'y']
												}}
												values={values}
												validate={validateExpDate}
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
												className="event-form__field-expdate"
												errorClassName="event-form__field-creditcard-error"
											/>
											<CustomField
												name="cvcField"
												type={showPublicKey ? 'text' : 'password'}
												placeholder="CVC"
												values={values}
												validate={validateCVC}
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
												className="event-form__field-cvc"
												errorClassName="event-form__field-creditcard-error"
											/>
										</React.Fragment>
									)} */}
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
									</div>
								</div>
								{/* {!hideCCField && (
									<React.Fragment>
										<div style={{ position: 'relative' }}>
											<CustomField
												name="creditCardField"
												type={showPublicKey ? 'text' : 'password'}
												placeholder="Credit Card Number"
												values={values}
												validate={validateCreditCard}
												options={{ creditCard: true }}
												icon={true}
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
												className="event-form__field-creditcard-inline"
												errorClassName="event-form__field-creditcard-error"
											/>
										</div>
										<CustomField
											name="expDateField"
											type={showPublicKey ? 'text' : 'password'}
											placeholder="Exp Date MM/YY"
											options={{
												date: true,
												datePattern: ['m', 'y']
											}}
											values={values}
											validate={validateExpDate}
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											className="event-form__field-expdate"
											errorClassName="event-form__field-creditcard-error"
										/>
										<CustomField
											name="cvcField"
											type={showPublicKey ? 'text' : 'password'}
											placeholder="CVC"
											values={values}
											validate={validateCVC}
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											className="event-form__field-cvc"
											errorClassName="event-form__field-creditcard-error"
										/>
									</React.Fragment>
								)} */}
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
						{/* cannot add !dirty here because Stripe Element is not part of our form*/}
						<Button
							type="submit"
							size="small-block-payment"
							disabled={
								isSubmitting ||
								!isValid ||
								submitted ||
								(values.paymentMethod === 'stripe' &&
									stripe &&
									!stripePaymentMethodId)
							}>
							SUBMIT
						</Button>
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
									disabled={!editingMode && !succeed}>
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

	const getStripeSetupIntentId = setupIntentId => {
		// send back to backend to save for future payment
		if (setupIntentId) {
			setStripeSetupIntentId(setupIntentId);
		}
	};

	const getStripePaymentMethodId = paymentMethodId => {
		// send back to backend to save for future payment
		if (paymentMethodId) {
			console.log('payment_methodID = ', paymentMethodId);
			setStripePaymentMethodId(paymentMethodId);
		}
	};

	const getStripeError = error => {
		// send back to backend to save for future payment
		if (error) {
			console.log('stripeError = ', error);
			setStripeError(error);
		}
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
			<ErrorModal error={foundError} onClear={clearErrorCallback} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{eventForm()}
			{/* {!redirectStripe && eventForm()} */}
			{/* {redirectStripe && (
				<div className="">
					<label className="event-form__label">
						Your credit card information will be saved to Stripe.
						MYSeatTime does not save it.{' '}
					</label>
					<Elements stripe={stripePromise}>
						<CardSetupForm
							userName={userName}
							email={email}
							clientSecret={clientSecret}
							getStripePaymentMethod={getStripePaymentMethod}
							getStripeError={getStripeError}
						/>
					</Elements>
				</div>
			)} */}
		</React.Fragment>
	);
};

export default SubmitEntry;
