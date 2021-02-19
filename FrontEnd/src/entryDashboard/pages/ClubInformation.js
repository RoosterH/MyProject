import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

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
	const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);

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
	const [clubId, setClubId] = useState();
	const [clubName, setClubName] = useState('');
	const [carNumber, setCarNumber] = useState('');

	useEffect(() => {
		const getUserClubInfoFirst = async () => {
			try {
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
						// adding JWT to header for authentication, JWT contains userId
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				setClubCollectMembershipFee(
					responseData.collectMembershipFee
				);
				setMembershipFee(responseData.membershipFee);
				setMemberExp(responseData.memberExp);
				setClubId(responseData.clubId);
				setClubName(responseData.clubName);
				setCarNumber(responseData.carNumber);
			} catch (err) {}
		};
		getUserClubInfoFirst();
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

	const submitHandler = values => {
		// return back to NewEntryManager
		setContinueStatus(true);
		setFormValues(values);
	};

	const [memberExpDate, setMemberExpDate] = useState();
	useEffect(() => {
		if (memberExp) {
			const date = new Date(memberExp);
			setMemberExpDate(moment(date.toISOString()).format('L'));
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
												// set OKLeavePage to true because we don't want to show prompt when users
												// click on car number link
												setOKLeavePage(true);
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
												// set OKLeavePage to true because we don't want to show prompt when users
												// click on car number link
												setOKLeavePage(true);
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
												setOKLeavePage(true);
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
												// set OKLeavePage to true because we don't want to show prompt when users
												// click on car number link
												setOKLeavePage(true);
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
							<i className="fad fa-car-side fa-lg"></i>
							&nbsp; Car Number
						</label>
						{!carNumber && (
							<React.Fragment>
								<label
									htmlFor="carNumber"
									className="event-form__label">
									<Link
										to={{
											pathname: `/users/registerCarNumber/${clubId}`,
											state: {
												parentURL: `/events/newEntryManager/${eventId}`
											}
										}}>
										{/* Not to open a new tab for a better UX */}
										{/* target="_blank"> */}
										{/* rel="noopener noreferrer"> */}
										<i className="fad fa-link fa-lg"></i>
										&nbsp; Please click on the link to register a car
										number.
									</Link>
								</label>
							</React.Fragment>
						)}
						{carNumber && (
							<fieldset disabled>
								<Field
									id="carNumber"
									name="carNumber"
									type="text"
									className="event-form__field_quarter"
								/>
							</fieldset>
						)}
						<Button
							type="submit"
							size="small-block"
							margin-left="1.5rem"
							disabled={
								isSubmitting ||
								!isValid ||
								!saveButtonEnabled ||
								!carNumber
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
