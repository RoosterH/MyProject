import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import NavigationPrompt from 'react-router-navigation-prompt';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

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

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	useEffect(() => {
		let path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location, clubAuthContext]);

	const [OKLeavePage, setOKLeavePage] = useState(true);
	let initialValues = {
		onSitePayment: 'false',
		stripePayment: 'true',
		hostPrivateEvent: false
	};

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
	}, [clubId, setLoadedClubAccount, sendRequest, clubAuthContext]);

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
					hostPrivateEvent: values.hostPrivateEvent
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the loadedClubAccount so we will set initialValues again.
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
			hostPrivateEvent: loadedClubAccount.hostPrivateEvent
		};
	}

	const accountForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Select Customer Payment Methods</h4>
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
							Stripe Payment: (Stripe Connect Account Required)
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
						<div id="my-radio-group" className="event-form__label">
							<label>
								<Field
									id="hostPrivateEvent"
									name="hostPrivateEvent"
									type="checkbox"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp; Check the box if your club hosts private events
								that will be only shared by event link.
							</label>
						</div>
						<br />
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
