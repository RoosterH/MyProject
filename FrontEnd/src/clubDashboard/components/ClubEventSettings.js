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

const ClubEventSettings = () => {
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
		memberSystem: 'false',
		hostPrivateEvent: 'false',
		carNumber: 'true'
	};

	const [
		loadedClubEventSettings,
		setLoadedClubEventSettings
	] = useState();
	useEffect(() => {
		const fetchClubEventSettings = async () => {
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
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				// Need to set the loadedClubEventSettings so we will set initialValues again.
				// Without it, form will keep the old initial values.
				setLoadedClubEventSettings(responseData.clubEventSettings);
			} catch (err) {}
		};
		fetchClubEventSettings();
	}, [
		clubId,
		setLoadedClubEventSettings,
		sendRequest,
		clubAuthContext
	]);

	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
	const submitHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/clubs/eventSettings`,
				'PATCH',
				JSON.stringify({
					memberSystem: values.memberSystem === 'true' ? true : false,
					hostPrivateEvent:
						values.hostPrivateEvent === 'true' ? true : false,
					carNumber: values.carNumber === 'true' ? true : false
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the loadedClubEventSettings so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setLoadedClubEventSettings(responseData.clubEventSettings);
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

	if (loadedClubEventSettings) {
		initialValues = {
			memberSystem: loadedClubEventSettings.memberSystem
				? 'true'
				: 'false',
			hostPrivateEvent: loadedClubEventSettings.hostPrivateEvent
				? 'true'
				: 'false',
			carNumber: loadedClubEventSettings.carNumber ? 'true' : 'false'
		};
	}

	const accountForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Select Event Settings</h4>
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
							Club has memberships:{' '}
						</div>
						<div
							role="group"
							aria-labelledby="my-radio-group"
							className="event-form__field_radio">
							<label>
								<Field
									type="radio"
									name="memberSystem"
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
									name="memberSystem"
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
							Enable Prive Event:{' '}
						</div>
						<div
							role="group"
							aria-labelledby="my-radio-group"
							className="event-form__field_radio">
							<label>
								<Field
									type="radio"
									name="hostPrivateEvent"
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
									name="hostPrivateEvent"
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
							Car Number:
						</div>
						<div
							role="group"
							aria-labelledby="my-radio-group"
							className="event-form__field_radio">
							<label>
								<Field
									type="radio"
									name="carNumber"
									value="true"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp;No Duplicated Numbers
							</label>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<label>
								<Field
									type="radio"
									name="carNumber"
									value="false"
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
										setSaveButtonEnabled(true);
									}}
								/>
								&nbsp;Sharing Numbers
							</label>
						</div>
						<br />
						{/* <div id="my-radio-group" className="event-form__label">
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
						</div> */}
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

export default ClubEventSettings;
