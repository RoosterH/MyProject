import React, { useContext, useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { useLocation } from 'react-router-dom';
import NavigationPrompt from 'react-router-navigation-prompt';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { FormContext } from '../../shared/context/form-context';
import '../../shared/css/EventForm.css';
import '../../shared/css/EventItem.css';

const ClubProfile = () => {
	const [loadedClubProfile, setLoadedClubProfile] = useState();
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

	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;

	// authentication check check whether club has logged in
	useClubLoginValidation(`/clubs/profileManager/${clubId}`);

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	useEffect(() => {
		if (location) {
			let path = location.pathname;
			let clubRedirectURL = clubAuthContext.clubRedirectURL;
			if (path === clubRedirectURL) {
				// re-init redirectURL after re-direction route
				clubAuthContext.setClubRedirectURL(null);
			}
		}
	}, [location, clubAuthContext]);

	const [OKLeavePage, setOKLeavePage] = useState(true);
	let initialValues = {
		webPage: '',
		faceBook: '',
		youTube: '',
		contactEmail: '',
		description: '',
		schedule: ''
	};

	const [validateWebPage, setValidateWebPage] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Web page url is required.';
			}
			return error;
		}
	);

	const [validateFaceBook, setValidateFaceBook] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Facebook link is required.';
			}
			return error;
		}
	);

	const [validateContactEmail, setValidateContactEmail] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Contact email is required.';
			} else {
				const pattern = /[a-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
				if (!pattern.test(value)) {
					error = 'Please enter a valid email';
				}
			}
			return error;
		}
	);

	const [validateDescription, setValidateDescription] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Club Description is required.';
			}
			return error;
		}
	);

	const [validateSchedule, setValidateSchedule] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Club event schedule is required.';
			}
			return error;
		}
	);

	useEffect(() => {
		const fetchClubProfile = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/profile/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				// Need to set the loadedClubProfile so we will set initialValues again.
				// Without it, form will keep the old initial values.
				setLoadedClubProfile(responseData.clubProfile);
			} catch (err) {}
		};
		fetchClubProfile();
	}, [clubId, setLoadedClubProfile]);

	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
	const submitHandler = async values => {
		try {
			const formData = new FormData();
			formData.append('webPage', values.webPage);
			formData.append('faceBook', values.faceBook);
			formData.append('youTube', values.youTube);
			formData.append('contactEmail', values.contactEmail);
			formData.append('description', values.description);
			formData.append('schedule', values.schedule);
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/clubs/profile`,
				'PATCH',
				formData,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// Need to set the loadedClubProfile so we will set initialValues again.
			// Without it, form will keep the old initial values.
			setLoadedClubProfile(responseData.clubProfile);
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
	if (loadedClubProfile) {
		initialValues = {
			webPage: loadedClubProfile.webPage,
			faceBook: loadedClubProfile.faceBook,
			youTube: loadedClubProfile.youTube,
			contactEmail: loadedClubProfile.contactEmail,
			description: loadedClubProfile.description,
			schedule: loadedClubProfile.schedule
		};
	}

	const clubForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter club information</h4>
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
						setValidateWebPage(() => value => {
							console.log('ValidateWebPage');
							let error;
							if (!value) {
								error = 'Web page url is required.';
							}
							return error;
						});
						setValidateFaceBook(() => value => {
							console.log('ValidateFaceBook');
							let error;
							if (!value) {
								error = 'Facebook link is required.';
							}
							return error;
						});
						setValidateContactEmail(() => value => {
							console.log('ValidateContactEmail');
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
						});
						setValidateDescription(() => value => {
							console.log('ValidateDescription');
							let error;
							if (!value) {
								error = 'Club description is required.';
							}
							return error;
						});
						setValidateSchedule(() => value => {
							console.log('ValidateSchedule');
							let error;
							if (!value) {
								error = 'Club event schedule is required.';
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
						<label htmlFor="webPage" className="event-form__label">
							Web Page
						</label>
						<Field
							id="webPage"
							name="webPage"
							type="text"
							className="event-form__field"
							validate={validateWebPage}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.webPage && errors.webPage && (
							<div className="event-form__field-error">
								{errors.webPage}
							</div>
						)}
						<label htmlFor="faceBook" className="event-form__label">
							Facebook Page
						</label>
						<Field
							id="faceBook"
							name="faceBook"
							type="text"
							className="event-form__field"
							validate={validateFaceBook}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.faceBook && errors.faceBook && (
							<div className="event-form__field-error">
								{errors.faceBook}
							</div>
						)}
						<label htmlFor="youTube" className="event-form__label">
							YouTube Channel (Optional)
						</label>
						<Field
							id="youTube"
							name="youTube"
							type="text"
							className="event-form__field"
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						<label htmlFor="faceBook" className="event-form__label">
							Contact Email Address (Please do not use login email
							address)
						</label>
						<Field
							id="contactEmail"
							name="contactEmail"
							type="text"
							className="event-form__field"
							validate={validateContactEmail}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.contactEmail && errors.contactEmail && (
							<div className="event-form__field-error">
								{errors.contactEmail}
							</div>
						)}
						<label
							htmlFor="description"
							className="event-form__label">
							Club Description
						</label>
						<Field
							id="decription"
							name="description"
							as="textarea"
							rows="15"
							cols="50"
							placeholder="Please enter club description"
							className="event-form__field-textarea"
							validate={validateDescription}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
							placeholder="About the club"
						/>
						{touched.description && errors.description && (
							<div className="event-form__field-error">
								{errors.description}
							</div>
						)}
						<label htmlFor="schedule" className="event-form__label">
							Event Schedule
						</label>
						<Field
							id="schedule"
							name="schedule"
							as="textarea"
							rows="15"
							cols="50"
							placeholder="Please enter event schedule"
							className="event-form__field-textarea"
							validate={validateSchedule}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
							placeholder="TBD"
						/>
						{touched.schedule && errors.schedule && (
							<div className="event-form__field-error">
								{errors.schedule}
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
								formContext.setIsInsideForm(false);
							}}
							// Confirm navigation if going to a path that does not start with current path:
							when={(crntLocation, nextLocation) => {
								// remove ClubRedirectURL from memory
								clubAuthContext.setClubRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
								if (
									OKLeavePage ||
									(nextLocation &&
										nextLocation.pathname === '/clubs/auth')
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
			{!isLoading && clubForm()}
		</React.Fragment>
	);
};

export default ClubProfile;
