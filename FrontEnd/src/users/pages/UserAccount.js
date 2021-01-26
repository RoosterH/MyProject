import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import NavigationPrompt from 'react-router-navigation-prompt';
import validator from 'validator';

import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { FormContext } from '../../shared/context/form-context';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import './UserAccount.css';
import '../../shared/css/EventForm.css';

const UserAccount = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const formContext = useContext(FormContext);
	useEffect(() => {
		let mounted = true;
		if (mounted) {
			formContext.setIsInsideForm(true);
		}
		return () => {
			mounted = false;
		};
	}, [formContext]);

	const userAuthContext = useContext(UserAuthContext);
	const userId = userAuthContext.userId;

	// authentication check check whether user has logged in
	useUserLoginValidation(`/users/credential/${userId}`);

	// If we are re-directing to this page, we want to clear up userRedirectURL
	let location = useLocation();
	let path;
	useEffect(() => {
		path = location.pathname;
		let userRedirectURL = userAuthContext.userRedirectURL;
		if (path === userRedirectURL) {
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [location]);

	const [OKLeavePage, setOKLeavePage] = useState('true');
	let initialValues = {
		lastname: '.',
		firstname: '.',
		username: '.',
		phone: '0000000000',
		address: '.',
		city: '.',
		state: '.',
		zip: '.',
		emergency: '.',
		emergencyPhone: '0000000000'
	};

	const validatePhoneNumber = value => {
		let error;
		if (!value) {
			error = 'Phone number is required.';
		} else {
			// validate format 1234567890
			if (value.length !== 10) {
				error = 'Please use format 1234567890.';
			} else {
				// check phone number format, must be 1234567890
				if (!validator.isMobilePhone(value, 'en-US')) {
					error = 'Please enter a valid US mobile phone number';
				}
			}
		}
		return error;
	};

	const validateZipCode = value => {
		let error;
		if (!value) {
			error = 'zip code is required.';
		} else {
			if (!validator.isPostalCode(value, 'US')) {
				error = 'Please enter a valid US zip code';
			}
		}
		return error;
	};

	const validateDriver = value => {
		let error;
		if (!value) {
			error =
				'You must be at least 16 years old with a valid driver license to register events.';
		}
		return error;
	};

	const validateDisclaimer = value => {
		let error;
		if (!value) {
			error =
				'You must agree to share information with registered event organizers.';
		}
		return error;
	};

	const [loadedUserAccount, setLoadedUserAccount] = useState();
	const [validDriver, setValidDriver] = useState(false);
	const [disclaimer, setDisclaimer] = useState(false);
	// check whether the accout info has been completed yet. Give warning message if not.
	const [completed, setCompleted] = useState(false);
	useEffect(() => {
		const fetchUserAccount = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/users/account/${userId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains userId
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				// Need to set the loadeUserProfile so we will set initialValues again.
				// Without it, form will keep the old initial values.
				setLoadedUserAccount(responseData);
				setValidDriver(responseData.validDriver);
				setDisclaimer(responseData.disclaimer);
				setCompleted(responseData.completed);
			} catch (err) {}
		};
		fetchUserAccount();
	}, [userId, setLoadedUserAccount]);

	const [verification, setVerification] = useState(false);
	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
	const submitHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/users/account/${userId}`,
				'PATCH',
				JSON.stringify({
					phone: values.phone,
					address: values.address,
					city: values.city,
					state: values.state,
					zip: values.zip,
					emergency: values.emergency,
					emergencyPhone: values.emergencyPhone,
					validDriver: values.validDriver,
					disclaimer: values.disclaimer
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains userId
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			// Need to set the loadedUserAccount so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setLoadedUserAccount(responseData);
			setValidDriver(responseData.validDriver);
			setDisclaimer(responseData.disclaimer);
			setSaveButtonEnabled(false);
		} catch (err) {}
	};

	if (isLoading) {
		return (
			<div className="center">
				<LoadingSpinner />
			</div>
		);
	}

	if (loadedUserAccount) {
		initialValues = {
			lastname: loadedUserAccount.lastName,
			firstname: loadedUserAccount.firstName,
			username: loadedUserAccount.userName,
			phone: loadedUserAccount.phone,
			address: loadedUserAccount.address,
			city: loadedUserAccount.city,
			state:
				loadedUserAccount.state === '.'
					? ''
					: loadedUserAccount.state,
			zip: loadedUserAccount.zip === '.' ? '' : loadedUserAccount.zip,
			emergency:
				loadedUserAccount.emergency === '.'
					? ''
					: loadedUserAccount.emergency,
			emergencyPhone: loadedUserAccount.emergencyPhone,
			validDriver: loadedUserAccount.validDriver,
			disclaimer: loadedUserAccount.disclaimer
		};
	}

	const credentialForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				{!completed && (
					<div className="useraccount-error">
						Please complete your account information before
						registering events.
					</div>
				)}
				<h4>Driver Account</h4>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
					setOKLeavePage(true);
					if (actions.isSubmitting) {
						actions.setSubmitting(false);
					}
					if (!actions.isSubmitting) {
						// 	setValidatePassword(() => value => {
						// 		let error;
						// 		if (!value) {
						// 			error = 'Password is required.';
						// 		} else if (value.length < 6) {
						// 			error = 'Minimum password length is 6 characters.';
						// 		}
						// 		return error;
						// 	});
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
					values,
					validateForm
				}) => (
					<Form className="event-form-container">
						<label
							htmlFor="lastname"
							className="event-form__label_inline">
							Last Name
						</label>
						<fieldset disabled>
							<Field
								id="lastname"
								name="lastname"
								className="event-form__field"
							/>
						</fieldset>
						<label
							htmlFor="firstname"
							className="event-form__label_inline">
							First Name
						</label>
						<fieldset disabled>
							<Field
								id="firstname"
								name="firstname"
								className="event-form__field"
							/>
						</fieldset>
						<label
							htmlFor="username"
							className="event-form__label_inline">
							User Name
						</label>
						<fieldset disabled>
							<Field
								id="username"
								name="username"
								className="event-form__field"
							/>
						</fieldset>
						<label
							htmlFor="phone"
							className="event-form__label_inline">
							Mobile Phone Number
						</label>
						<Field
							id="phone"
							name="phone"
							className="event-form__field"
							placeholder="1234567890"
							validate={validatePhoneNumber}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.phone && errors.phone && (
							<div className="event-form__field-error">
								{errors.phone}
							</div>
						)}
						<label htmlFor="address" className="event-form__label">
							Street Address
						</label>
						<Field
							id="address"
							name="address"
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<label htmlFor="city" className="event-form__label">
							City
						</label>
						<Field
							id="city"
							name="city"
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<label htmlFor="state" className="event-form__label">
							State
						</label>
						<Field
							id="state"
							name="state"
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<label htmlFor="zip" className="event-form__label">
							Zip Code
						</label>
						<Field
							id="zip"
							name="zip"
							className="event-form__field"
							validate={validateZipCode}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.zip && errors.zip && (
							<div className="event-form__field-error">
								{errors.zip}
							</div>
						)}
						<label htmlFor="emergency" className="event-form__label">
							Emergency Contact
						</label>
						<Field
							id="emergency"
							name="emergency"
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<label
							htmlFor="emergencyPhone"
							className="event-form__label_inline">
							Emergency Contact Mobile Phone Number
						</label>
						<Field
							id="emergencyPhone"
							name="emergencyPhone"
							validate={validatePhoneNumber}
							className="event-form__field"
							placeholder="1234567890"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.emergencyPhone && errors.emergencyPhone && (
							<div className="event-form__field-error">
								{errors.emergencyPhone}
							</div>
						)}
						<label className="event-form__useraccount_checkbox">
							<Field
								name="validDriver"
								// validate={validateDriver}
								type="checkbox"
								onBlur={event => {
									handleBlur(event);
									setOKLeavePage(false);
									setSaveButtonEnabled(true);
								}}
							/>
							&nbsp; I am at least 16 years old with a valid driver
							license.
						</label>
						{!disclaimer && (
							<label className="event-form__useraccount_checkbox">
								<Field
									name="disclaimer"
									type="checkbox"
									validate={validateDisclaimer}
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp; I agree to share my personal information with
								registered event organizers.
							</label>
						)}
						{disclaimer && (
							<fieldset disabled>
								<label className="event-form__useraccount_checkbox">
									<Field
										name="disclaimer"
										type="checkbox"
										validate={validateDisclaimer}
										onBlur={event => {
											handleBlur(event);
										}}
									/>
									&nbsp; I agree to share my personal information with
									registered event organizers.
								</label>{' '}
							</fieldset>
						)}

						{touched.disclaimer && errors.disclaimer && (
							<div className="event-form__field-error">
								{errors.disclaimer}
							</div>
						)}
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={
								isSubmitting || !isValid || !saveButtonEnabled
							}
							onClick={() =>
								validateForm().then(
									() => setFieldValue('isSaveButton', false, false)
									// setFieldValue('isSaveButton', false, false);
								)
							}>
							SAVE
						</Button>
						{/* only display error after patch request */}
						{loadedUserAccount && !validDriver && (
							<div className="event-form__field-error">
								You must be at least 16 years old with a valid driver
								license to register events.
							</div>
						)}
						<NavigationPrompt
							afterConfirm={() => {
								// localStorage.removeItem('eventID');
								formContext.setIsInsideForm(false);
							}}
							// Confirm navigation if going to a path that does not start with current path:
							when={(crntLocation, nextLocation) => {
								// remove UserRedirectURL from memory
								userAuthContext.setUserRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
								if (
									OKLeavePage ||
									(nextLocation &&
										nextLocation.pathname === '/users/auth')
								) {
									formContext.setIsInsideForm(false);
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
											error="You sure want to leave? Unsaved data will be lost."></PromptModal>
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

			{!isLoading && credentialForm()}
		</React.Fragment>
	);
};

export default UserAccount;
