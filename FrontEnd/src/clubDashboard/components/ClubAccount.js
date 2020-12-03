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
import './ClubManager.css';

const ClubAccount = () => {
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

	const [showPublicKey, setShowPublicKey] = useState(false);
	const toggleShowPublicKeyButton = () => {
		if (showPublicKey === false) {
			setShowPublicKey(true);
		} else {
			setShowPublicKey(false);
		}
	};
	const [showPublicKeyButton, setShowPublicKeyButton] = useState(
		<i className="fal fa-eye-slash fa-lg" />
	);
	useEffect(() => {
		if (showPublicKey) {
			setShowPublicKeyButton(<i className="fal fa-eye fa-lg" />);
		} else {
			setShowPublicKeyButton(
				<i className="fal fa-eye-slash fa-lg" />
			);
		}
	}, [showPublicKey, setShowPublicKeyButton]);

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
		onSitePayment: 'false',
		stripePayment: 'true',
		stripePublicKey: '',
		stripeSecretKey: ''
	};

	const [
		validateStripePublicKey,
		setValidateStripePublicKey
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Stripe Publishable Key is required.';
		}
		return error;
	});

	const [
		validateStripeSecretKey,
		setValidateStripeSecretKey
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Stripe Secret Key is required.';
		}
		return error;
	});

	const [loadedClubAccount, setLoadedClubAccount] = useState();
	useEffect(() => {
		const fetchClubAccount = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/account/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				// Need to set the loadedClubProfile so we will set initialValues again.
				// Without it, form will keep the old initial values.
				setLoadedClubAccount(responseData.clubAccount);
			} catch (err) {}
		};
		fetchClubAccount();
	}, [clubId, setLoadedClubAccount]);

	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
	const submitHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/clubs/account`,
				'PATCH',
				JSON.stringify({
					onSitePayment:
						values.onSitePayment === 'true' ? true : false,
					stripePayment:
						values.stripePayment === 'true' ? true : false,
					stripePublicKey: values.stripePublicKey,
					stripeSecretKey: values.stripeSecretKey
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the loadedClubProfile so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setLoadedClubAccount(responseData.clubAccount);
			setOKLeavePage(true);
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

	if (loadedClubAccount) {
		initialValues = {
			onSitePayment: loadedClubAccount.onSitePayment
				? 'true'
				: 'false',
			stripePayment: loadedClubAccount.stripePayment
				? 'true'
				: 'false',
			stripePublicKey: loadedClubAccount.stripePublicKey,
			stripeSecretKey: loadedClubAccount.stripeSecretKey
		};
	}

	const accountForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter club payment information</h4>
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
						setValidateStripePublicKey(() => value => {
							console.log('ValidateStripePublicKey');
							let error;
							if (!value) {
								error = 'Stripe Publishable Key is required.';
							}
							return error;
						});
						setValidateStripeSecretKey(() => value => {
							console.log('ValidateStripeSecretKey');
							let error;
							if (!value) {
								error = 'Stripe Secret Key is required.';
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
						<div id="my-radio-group" className="event-form__label">
							On-Site Payment:{' '}
						</div>
						<div
							role="group"
							aria-labelledby="my-radio-group"
							className="event-form__field_radio">
							<label>
								<Field
									type="radio"
									name="onSitePayment"
									value="true"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp;Yes
							</label>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<label>
								<Field
									type="radio"
									name="onSitePayment"
									value="false"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp;No
							</label>
						</div>
						<br />
						<div id="my-radio-group" className="event-form__label">
							Stripe Payment:
						</div>
						<div
							role="group"
							aria-labelledby="my-radio-group"
							className="event-form__field_radio">
							<label>
								<Field
									type="radio"
									name="stripePayment"
									value="true"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp;Yes
							</label>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<label>
								<Field
									type="radio"
									name="stripePayment"
									value="false"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp;No
							</label>
						</div>
						<br />
						<label
							htmlFor="stripePublicKey"
							className="event-form__label_inline">
							Stripe Publishable Key
						</label>
						<span
							type="button"
							className="showPasswordButton"
							onClick={toggleShowPublicKeyButton}>
							{showPublicKeyButton}
						</span>
						<Field
							id="stripePublicKey"
							name="stripePublicKey"
							type={showPublicKey ? 'text' : 'password'}
							className="event-form__field"
							validate={validateStripePublicKey}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.stripePublicKey && errors.stripePublicKey && (
							<div className="event-form__field-error">
								{errors.stripePublicKey}
							</div>
						)}
						<label
							htmlFor="stripeSecretKey"
							className="event-form__label">
							Stripe Secret Key (For security, this key will not be
							displayed. )
						</label>
						<Field
							id="stripeSecretKey"
							name="stripeSecretKey"
							type="password"
							className="event-form__field"
							validate={validateStripeSecretKey}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.stripeSecretKey && errors.stripeSecretKey && (
							<div className="event-form__field-error">
								{errors.stripeSecretKey}
							</div>
						)}
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
			{!isLoading && accountForm()}
		</React.Fragment>
	);
};

export default ClubAccount;
