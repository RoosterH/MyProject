import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

// import { EditorState } from 'draft-js';
// import { RichEditorExample } from '../components/RichEditor';
import 'draft-js/dist/Draft.css';

import Button from '../../shared/components/FormElements/Button';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

import '../../shared/css/EventForm.css';

const ClubInformation = props => {
	const eventId = props.eventId;
	const [initialized, setInitialized] = useState(false);
	const userAuthContext = useContext(UserAuthContext);
	const userId = userAuthContext.userId;
	const formContext = useContext(FormContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

	// continueStatus controls when to return props.newEventStatus back to NewEventManager
	const [continueStatus, setContinueStatus] = useState(false);
	const [formValues, setFormValues] = useState();

	// get membership information and car number from backend
	const [
		clubCollectMembershipFee,
		setClubCollectMembershipFee
	] = useState(false);
	const [membershipFee, setMembershipFee] = useState('0');
	const [memberExp, setMemberExp] = useState();
	const [clubName, setClubName] = useState('');
	useEffect(() => {
		const fetchMemberCarInfo = async () => {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/users/userClubInfo/${userId}/${eventId}`,
				'GET',
				null,
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			setClubCollectMembershipFee(responseData.collectMembershipFee);
			setMembershipFee(responseData.membershipFee);
			setMemberExp(responseData.memberExp);
			setClubName(responseData.clubName);
		};

		fetchMemberCarInfo();
	}, []);

	// this is the return function that passes finishing status back to NewEventManager
	useEffect(() => {
		if (continueStatus) {
			props.clubInformationStatus(continueStatus);
			if (formValues !== undefined && formValues) {
				props.carNumberHandler(formValues.carNumber);

				props.payMembershipHandler(
					formValues.membershipFee === 'true' ? true : false
				);
			}
		}
	}, [continueStatus, props, formValues]);

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

	const [carNumber, setCarNumber] = useState('');
	// const [raceClass, setRaceClass] = useState('');

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
		if (eventFormData.carNumber) {
			setCarNumber(eventFormData.carNumber);
		}
		// if (eventFormData.raceClass) {
		// 	setRaceClass(eventFormData.raceClass);
		// }
	} else if (!initialized) {
		setInitialized(true);
		// initialize localStorage
		eventFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		eventFormData['carNumber'] = '';
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(eventFormData)
		);
	}

	const removeEventFormData = () => {
		localStorage.removeItem('eventFormData');
	};

	const initialValues = {
		carNumber: carNumber,
		membershipFee: 'false'
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

	/***** Form Validation Section  *****/
	const [validateCarNumber, setValidateCarNumber] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Car number is required.';
			}
			let numVal = parseInt(value);
			if (isNaN(numVal)) {
				error = 'Please inputer a number.';
			}
			return error;
		}
	);

	const submitHandler = values => {
		// return back to NewEntryManager
		setContinueStatus(true);
		setFormValues(values);
	};

	const [memberExpDate, setMemberExpDate] = useState();
	useEffect(() => {
		if (memberExp) {
			setMemberExpDate(moment(memberExp).format('L'));
		}
	}, [memberExp]);

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Club Related Information</h4>
				<h5>&nbsp;All fields are required</h5>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
				}}>
				{({
					values,
					errors,
					isSubmitting,
					isValid,
					setFieldValue,
					submitted,
					touched,
					handleBlur,
					handleChange
				}) => (
					<Form className="event-form-container">
						{clubCollectMembershipFee && memberExp && (
							<React.Fragment>
								<label className="event-form__label">
									<i className="fal fa-id-card fa-lg"></i>
									&nbsp; Your Membership Expiration Date:{' '}
									{memberExpDate}
								</label>
								<label
									htmlFor="membershipFee"
									className="event-form__label_inline">
									Renew Membership for ${membershipFee} /year:
								</label>
								<div
									role="group"
									aria-labelledby="my-radio-group"
									className="event-form__field_radio">
									<label>
										<Field
											type="radio"
											name="membershipFee"
											value="true"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											onChange={event => {
												handleChange(event);
												setSaveButtonEnabled(true);
											}}
										/>
										&nbsp;Yes
									</label>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									<label>
										<Field
											type="radio"
											name="membershipFee"
											value="false"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											onChange={event => {
												handleChange(event);
												setSaveButtonEnabled(true);
											}}
										/>
										&nbsp;No
									</label>
								</div>{' '}
							</React.Fragment>
						)}
						{clubCollectMembershipFee && !memberExp && (
							<React.Fragment>
								<label className="event-form__label">
									<i className="fal fa-id-card fa-lg"></i>&nbsp; You
									are not a member of {clubName}
								</label>
								<label
									htmlFor="membershipFee"
									className="event-form__label_inline">
									Join membership for ${membershipFee} /year:
								</label>
								<div
									role="group"
									aria-labelledby="my-radio-group"
									className="event-form__field_radio">
									<label>
										<Field
											type="radio"
											name="membershipFee"
											value="true"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											onChange={event => {
												handleChange(event);
												setSaveButtonEnabled(true);
											}}
										/>
										&nbsp;Yes
									</label>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									<label>
										<Field
											type="radio"
											name="membershipFee"
											value="false"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
											onChange={event => {
												handleChange(event);
												setSaveButtonEnabled(true);
											}}
										/>
										&nbsp;No
									</label>
								</div>{' '}
							</React.Fragment>
						)}

						<label htmlFor="carNumber" className="event-form__label">
							<i className="fal fa-question-circle"></i>
							&nbsp; Car Number
						</label>
						<Field
							id="carNumber"
							name="carNumber"
							type="text"
							className="event-form__field_quarter"
							validate={validateCarNumber}
							onBlur={event => {
								// without handBlure(event) touched.name will not work
								handleBlur(event);
								updateEventFormData('carNumber', event.target.value);
								setOKLeavePage(false);
								setSaveButtonEnabled(true);
							}}
							onChange={event => {
								handleChange(event);
								setSaveButtonEnabled(true);
							}}
						/>
						{touched.carNumber && errors.carNumber && (
							<div className="event-form__field-error_quarter">
								{errors.carNumber}
							</div>
						)}
						{/* <label htmlFor="numGroups" className="event-form__label">
							<i className="fal fa-address-card"></i>
							&nbsp; Race class
						</label>
						<Field
							id="raceClass"
							name="raceClass"
							type="text"
							className="event-form__field_quarter"
							validate={validateRaceClass}
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('raceClass', event.target.value);
								setOKLeavePage(false);
							}}></Field>
						{touched.raceClass && errors.raceClass && (
							<div className="event-form__field-error_quarter">
								{errors.raceClass}
							</div>
						)} */}
						<Button
							type="submit"
							size="small-block"
							margin-left="1.5rem"
							disabled={
								isSubmitting || !isValid || !saveButtonEnabled
							}>
							SAVE &amp; CONTINUE
						</Button>
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

	return <React.Fragment>{eventForm()}</React.Fragment>;
};

export default ClubInformation;
