import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import NavigationPrompt from 'react-router-navigation-prompt';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

const ClubCredential = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;

	// authentication check check whether club has logged in
	useClubLoginValidation(`/clubs/accountManager/${clubId}`);

	const [showEmail, setShowEmail] = useState(false);
	const toggleShowEmailButton = () => {
		if (showEmail === false) {
			setShowEmail(true);
		} else {
			setShowEmail(false);
		}
	};
	const [showEmailButton, setShowEmailButton] = useState(
		<i className="fal fa-eye-slash fa-lg" />
	);
	useEffect(() => {
		if (showEmail) {
			setShowEmailButton(<i className="fal fa-eye fa-lg" />);
		} else {
			setShowEmailButton(<i className="fal fa-eye-slash fa-lg" />);
		}
	}, [showEmail, setShowEmailButton]);

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	let path;
	useEffect(() => {
		path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location]);

	const [OKLeavePage, setOKLeavePage] = useState('true');
	let initialValues = {
		email: '',
		password: '******',
		oldPassword: '',
		newPassword: '',
		passwordValidation: ''
	};

	const validateEmail = value => {
		let error;
		if (!value) {
			error = 'Email is required.';
		} else {
			const pattern = /[a-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
			if (!pattern.test(value)) {
				error = 'Please enter a valid email';
			}
		}
		return error;
	};

	const [validatePassword, setValidatePassword] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Password is required.';
			} else if (value.length < 6) {
				error = 'Minimum password length is 6 characters.';
			}
			return error;
		}
	);

	const [loadedClubCredential, setLoadedClubCredential] = useState();
	useEffect(() => {
		const fetchClubCredential = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/credential/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				// Need to set the loadedClubProfile so we will set initialValues again.
				// Without it, form will keep the old initial values.
				setLoadedClubCredential(responseData.clubCredential);
			} catch (err) {}
		};
		fetchClubCredential();
	}, [clubId, setLoadedClubCredential]);

	const [verification, setVerification] = useState(false);
	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
	const submitHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + '/clubs/credential',
				'PATCH',
				JSON.stringify({
					oldPassword: values.oldPassword,
					newPassword: values.newPassword,
					passwordValidation: values.passwordValidation
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the loadedClubProfile so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setVerification(responseData.verification);
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

	if (loadedClubCredential) {
		initialValues = {
			email: loadedClubCredential.email,
			password: '******',
			oldPassword: '',
			newPassword: '',
			passwordValidation: ''
		};
	}

	const credentialForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Club Credentials</h4>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
					if (actions.isSubmitting) {
						actions.setSubmitting(false);
					}
					if (!actions.isSubmitting) {
						setValidatePassword(() => value => {
							let error;
							if (!value) {
								error = 'Password is required.';
							} else if (value.length < 6) {
								error = 'Minimum password length is 6 characters.';
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
						<label
							htmlFor="stripePublicKey"
							className="event-form__label_inline">
							Email
						</label>
						<button
							type="button"
							className="showPasswordButton"
							onClick={toggleShowEmailButton}>
							{showEmailButton}
						</button>
						<fieldset disabled>
							<Field
								id="email"
								name="email"
								type={showEmail ? 'text' : 'password'}
								className="event-form__field"
							/>
						</fieldset>
						<label htmlFor="password" className="event-form__label">
							Password (For security, password will not be displayed)
						</label>
						<fieldset disabled>
							<Field
								id="password"
								name="password"
								type="password"
								className="event-form__field"
							/>
						</fieldset>
						<label
							htmlFor="oldPassword"
							className="event-form__label">
							Please Enter Old Password
						</label>
						<Field
							id="oldPassword"
							name="oldPassword"
							type="password"
							validate={validatePassword}
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<label
							htmlFor="newPassword"
							className="event-form__label">
							Please Enter New Password (Minimum 6 characters)
						</label>
						<Field
							id="newPassword"
							name="newPassword"
							type="password"
							validate={validatePassword}
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.newPassword && errors.newPassword && (
							<div className="event-form__field-error">
								{errors.newPassword}
							</div>
						)}
						<label
							htmlFor="passwordValidation"
							className="event-form__label">
							Re-Enter New Password
						</label>
						<Field
							id="passwordValidation"
							name="passwordValidation"
							type="password"
							validate={validatePassword}
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.passwordValidation &&
							errors.passwordValidation && (
								<div className="event-form__field-error">
									{errors.passwordValidation}
								</div>
							)}
						<label
							htmlFor="forgotPassword"
							className="event-form__label">
							Forgot Password? Please ask our admin for help.
						</label>
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
							Change Password
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								// localStorage.removeItem('eventID');
							}}
							// Confirm navigation if going to a path that does not start with current path:
							when={(crntLocation, nextLocation) => {
								// remove ClubRedirectURL from memory
								clubAuthContext.setClubRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
								if (
									OKLeavePage ||
									nextLocation.pathname === '/clubs/auth'
								) {
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

export default ClubCredential;
