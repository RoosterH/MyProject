import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import NavigationPrompt from 'react-router-navigation-prompt';
import isEmail from 'validator/lib/isEmail';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventForm.css';

const ClubSES = () => {
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
		email: ''
	};

	const validateEmail = value => {
		let error;
		if (!value) {
			error = 'Email is required.';
		} else {
			if (!isEmail(value)) {
				error = 'Please enter a valid email';
			}
		}
		return error;
	};

	const [sesEmail, setSesEmail] = useState();
	const [verificationStatus, setVerificationStatus] = useState(
		'SUCCESS'
	);
	const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
	const [resendButtonEnabled, setResendButtonEnabled] = useState(
		true
	);
	useEffect(() => {
		const fetchSesEmail = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/sesEmail/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				// Need to set the sesEmail so we will set initialValues again.
				// Without it, form will keep the old initial values.
				setSesEmail(responseData.sesEmail);
				setVerificationStatus(responseData.verificationStatus);
				if (responseData.verificationStatus === 'SUCCESS') {
					// if email is already verified at AWS, disable both SAVE and RESEND button
					setSaveButtonEnabled(false);
					setResendButtonEnabled(false);
				} else if (responseData.verificationStatus === 'NOTFOUND') {
					// if email is not yet sent to AWS for verification, enable SAVE button, disable RESEND button
					setSaveButtonEnabled(true);
					setResendButtonEnabled(false);
				} else if (responseData.verificationStatus === 'RESEND') {
					// if email is sent to AWS for verification, disable SAVE button, enable RESEND button
					setSaveButtonEnabled(false);
					setResendButtonEnabled(true);
				}
			} catch (err) {}
		};
		fetchSesEmail();
	}, [clubId, setSesEmail]);

	const submitHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/sesEmail/${clubId}`,
				'PATCH',
				JSON.stringify({
					email: values.email,
					resend: false
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the sesEmail so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setSesEmail(responseData.sesEmail);
			setSaveButtonEnabled(false);
		} catch (err) {}
	};
	const resendHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/sesEmail/${clubId}`,
				'PATCH',
				JSON.stringify({
					email: values.email,
					resend: true
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the sesEmail so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setSesEmail(responseData.sesEmail);
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

	if (sesEmail) {
		initialValues = {
			email: sesEmail
		};
	}

	const emailVerificationForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Setup Email for Communication Center</h4>
				{verificationStatus !== 'SUCCESS' && (
					<div className="h4red">
						After saving the email address, we will send you a
						verification email. Please verify it to activate your
						communication center services.
					</div>
				)}
				{verificationStatus === 'SUCCESS' && (
					<div className="h4green">
						Email verification succeeded. Communication Center is now
						activated.
					</div>
				)}
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
							htmlFor="email"
							className="event-form__label_inline">
							Email (Can be different from club email)
						</label>
						<button
							type="button"
							className="showPasswordButton"
							onClick={toggleShowEmailButton}>
							{showEmailButton}
						</button>
						{/* <fieldset disabled> */}
						<Field
							id="email"
							name="email"
							type={showEmail ? 'text' : 'password'}
							className="event-form__field"
							validate={validateEmail}
						/>
						{touched.email && errors.email && (
							<div className="event-form__field-error">
								{errors.email}
							</div>
						)}
						{/* </fieldset> */}
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
							Save
						</Button>
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={!resendButtonEnabled}
							onClick={e => {
								resendHandler('isSaveButton', false, false);
							}}>
							Resend Verification Email
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
			{!isLoading && emailVerificationForm()}
		</React.Fragment>
	);
};

export default ClubSES;
