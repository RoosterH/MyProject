import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
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

const UpdateEventPhotos = props => {
	let eId = props.event.id;
	const [initialized, setInitialized] = useState(false);
	const clubAuthContext = useContext(ClubAuthContext);
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

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// authentication check
	useClubLoginValidation('/clubs/events/photos');

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

	// initialize local storage
	// Get the existing data
	// var eventFormData = localStorage.getItem('eventFormData');

	// If no existing data, create an array; otherwise retrieve it
	// eventFormData = eventFormData ? JSON.parse(eventFormData) : {};

	const [OKLeavePage, setOKLeavePage] = useState(true);

	const initialValues = {
		image: props.event.image,
		courseMap: props.event.courseMap
	};

	const updateEventFormData = (key, value) => {
		const storageData = JSON.parse(
			localStorage.getItem('eventFormData')
		);
		storageData[key] = value;
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(storageData)
		);
	};

	const history = useHistory();
	const submitHandler = async (values, actions) => {
		try {
			const formData = new FormData();
			formData.append('eventImage', values.image);
			formData.append('courseMap', values.courseMap);

			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + '/events/photos/' + eId,
				'PATCH',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setOKLeavePage(true);
			console.log('return new event');
			props.returnNewEvent(responseData.event);
		} catch (err) {}
	};

	const validateImageSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		}
		return error;
	};

	const validateCourseMapSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		}
		return error;
	};
	/***** End of Form Validation *****/

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please upload event image and course map</h4>
				<h5>Course map is optional</h5>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
					if (!actions.isSubmitting) {
					}
				}}>
				{({
					dirty,
					values,
					errors,
					isSubmitting,
					isValid,
					setFieldValue,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						<Field
							id="image"
							name="image"
							title="Event Image"
							component={ImageUploader}
							validate={validateImageSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.image ? errors.image : ''}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/>
						<Field
							id="courseMap"
							name="courseMap"
							title="Course Map (Optional)"
							component={ImageUploader}
							validate={validateCourseMapSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.courseMap ? errors.courseMap : ''}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/>
						<Button
							type="submit"
							size="medium-block"
							margin-left="1.5rem"
							disabled={isSubmitting || (!isValid && dirty)}>
							SAVE
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								formContext.setIsInsideForm(false);
								// removeEventFormData();
							}}
							// Confirm navigation if going to a path that does not start with current path.
							// We don't want to confirm navigation when OKLeavePage === true and redirect to '/clubs/auth' due to
							// authentication issue
							when={(crntLocation, nextLocation) => {
								// remove ClubRedirectURL from memory
								clubAuthContext.setClubRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
								if (OKLeavePage) {
									formContext.setIsInsideForm(false);
									// removeEventFormData();
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

export default UpdateEventPhotos;
