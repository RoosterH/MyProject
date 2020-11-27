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

const ClubPhotos = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;
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
	useClubLoginValidation(`/clubs/photos/${clubId}`);

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
	const [loadedImage, setLoadedImage] = useState('');
	const [loadedProfileImage, setLoadedProfileImage] = useState('');
	const [loadedClubProfile, setLoadedClubProfile] = useState('');
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
				setLoadedImage(responseData.image);
				setLoadedClubProfile(responseData.clubProfile);
				setLoadedProfileImage(responseData.clubProfile.profileImage);
			} catch (err) {}
		};
		fetchClubProfile();
	}, [clubId, setLoadedImage, setLoadedProfileImage]);

	const initialValues = {
		image: loadedImage,
		profileImage: loadedProfileImage
	};

	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
	const submitHandler = async (values, actions) => {
		try {
			const formData = new FormData();
			formData.append('webPage', loadedClubProfile.webPage);
			formData.append('faceBook', loadedClubProfile.faceBook);
			formData.append('youTube', loadedClubProfile.youTube);
			formData.append('contactEmail', loadedClubProfile.contactEmail);
			formData.append('description', loadedClubProfile.description);
			formData.append('clubImage', values.image);
			formData.append('clubProfileImage', values.profileImage);
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/clubs/profile`,
				'PATCH',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setOKLeavePage(true);
			setSaveButtonEnabled(false);
		} catch (err) {}
	};

	// const validateImageSize = value => {
	// 	let error;
	// 	if (value && value.size > 1500000) {
	// 		error = 'File size needs to be smaller than 1.5MB';
	// 	} else {
	// 		setSaveButtonEnabled(true);
	// 	}
	// 	return error;
	// };

	// const validateProfileImageSize = value => {
	// 	let error;
	// 	if (value && value.size > 1500000) {
	// 		error = 'File size needs to be smaller than 1.5MB';
	// 	} else {
	// 		setSaveButtonEnabled(true);
	// 	}
	// 	return error;
	// };

	const [validateImageSize, setValidateImageSize] = useState(
		() => value => {
			let error;
			if (value && value.size > 1500000) {
				error = 'File size needs to be smaller than 1.5MB';
			} else {
				setSaveButtonEnabled(true);
			}
			return error;
		}
	);

	const [
		validateProfileImageSize,
		setValidateProfileImageSize
	] = useState(() => value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		} else {
			setSaveButtonEnabled(true);
		}
		return error;
	});

	/***** End of Form Validation *****/

	const clubPhotosForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please upload club logo and profile photo</h4>
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
						setValidateImageSize(() => value => {
							let error;
							if (value && value.size > 1500000) {
								error = 'File size needs to be smaller than 1.5MB';
							} else {
								setSaveButtonEnabled(true);
							}
							return error;
						});
						setValidateProfileImageSize(() => value => {
							let error;
							if (value && value.size > 1500000) {
								error = 'File size needs to be smaller than 1.5MB';
							} else {
								setSaveButtonEnabled(true);
							}
							return error;
						});
					}
				}}>
				{({
					values,
					errors,
					handleChange,
					handleSubmit,
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
							title="Club Logo"
							component={ImageUploader}
							validate={validateImageSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.image ? errors.image : ''}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/>
						<Field
							id="profileImage"
							name="profileImage"
							title="Profile Image"
							component={ImageUploader}
							validate={validateProfileImageSize}
							setFieldValue={setFieldValue}
							errorMessage={
								errors.profileImage ? errors.profileImage : ''
							}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
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
							// cannot put isValid because not necessary to have both images uploaded at the same time
							disabled={isSubmitting || !saveButtonEnabled}>
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
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{clubPhotosForm()}
		</React.Fragment>
	);
};

export default ClubPhotos;
