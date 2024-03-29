import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';
import validator from 'validator';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

const PRIORITY_REG_END_DATE = '2021-01-01';

const UpdateEventRegistration = props => {
	const history = useHistory();
	let eventId = props.event.id;
	const [initialized, setInitialized] = useState(false);
	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;
	const formContext = useContext(FormContext);
	const [showSaveBtn, setShowSaveBtn] = useState(false);
	const [published, setPublished] = useState(props.event.published);
	const [publishBtnName, setPublishBtnName] = useState('PUBLISH');
	const [registrationClosed, setRegistrationClosed] = useState(
		props.event.closed
	);

	// controller of DELETE event modal
	const [showDELModal, setShowDELModal] = useState(false);
	const openDELHandler = () => {
		setShowDELModal(true);
	};
	const closeDELHandler = () => {
		setShowDELModal(false);
	};

	// controller of close registration modal
	const [showCloseRegModal, setShowCloseRegModal] = useState(false);
	const openCloseRegHandler = () => {
		setShowCloseRegModal(true);
	};
	const closeCloseRegHandler = () => {
		setShowCloseRegModal(false);
	};

	// controller of close registration modal
	const [showOpenRegModal, setShowOpenRegModal] = useState(false);
	const openOpenRegHandler = () => {
		setShowOpenRegModal(true);
	};
	const closeOpenRegHandler = () => {
		setShowOpenRegModal(false);
	};

	useEffect(() => {
		if (published) {
			setPublishBtnName('PUBLISHED');
		}
	}, [published, publishBtnName, props]);

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
	useClubLoginValidation('/clubs/events/registration');

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	React.useEffect(() => {
		let path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location, clubAuthContext]);

	const [totalCap, setTotalCap] = useState('');
	const [numGroups, setNumGroups] = useState('');
	const [capDistribution, setCapDistribution] = useState('');
	const [hostPrivateEvent, setHostPrivateEvent] = useState(false);
	const [privateEvent, setPrivateEvent] = useState(false);
	const [insuranceWaiver, setInsuranceWaiver] = useState('UNDEFINED');

	useEffect(() => {
		const getClubSettings = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/clubSettings/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				setHostPrivateEvent(
					responseData.clubSettings.hostPrivateEvent
				);
			} catch (err) {
				console.log('err = ', err);
			}
		};
		getClubSettings();
	}, []);

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
		if (eventFormData.totalCap) {
			setTotalCap(eventFormData.totalCap);
		}
		if (eventFormData.numGroups) {
			setNumGroups(eventFormData.numGroups);
		}
		if (eventFormData.capDistribution) {
			setCapDistribution(eventFormData.capDistribution);
		}
		if (eventFormData.privateEvent) {
			setPrivateEvent(eventFormData.privateEvent);
		}
		if (eventFormData.insuranceWaiver) {
			setInsuranceWaiver(eventFormData.insuranceWaiver);
		}
	} else if (!initialized) {
		setInitialized(true);
		// initialize localStorage
		eventFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		eventFormData['totalCap'] = '';
		eventFormData['numGroups'] = '';
		eventFormData['capDistribution'] = '';
		eventFormData['privateEvent'] = '';
		eventFormData['insuranceWaiver'] = '';
		localStorage.setItem(
			'eventFormData',
			JSON.stringify(eventFormData)
		);
	}

	const removeEventFormData = () => {
		localStorage.removeItem('eventFormData');
	};

	let priorityRegEndDate =
		moment(props.event.priorityRegEndDate).format('YYYY-MM-DD') ===
		PRIORITY_REG_END_DATE
			? moment().add(1, 'days').format('YYYY-MM-DD')
			: moment(props.event.priorityRegEndDate).format('YYYY-MM-DD');
	const initialValues = {
		totalCap: props.event.totalCap,
		numGroups: props.event.numGroups,
		capDistribution: props.event.capDistribution,
		multiDayEvent: props.event.multiDayEvent,
		privateEvent: props.event.privateEvent,
		priorityRegEndDate: priorityRegEndDate,
		insuranceWaiver:
			props.event.insuranceWaiver === 'UNDEFINED'
				? ''
				: props.event.insuranceWaiver
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

	const saveHandler = async (values, actions) => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/events/registration/${eventId}`,
				'PATCH',
				JSON.stringify({
					totalCap: values.totalCap,
					numGroups: values.numGroups,
					capDistribution: values.capDistribution,
					multiDayEvent: values.multiDayEvent,
					privateEvent: values.privateEvent,
					insuranceWaiver: values.insuranceWaiver
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setOKLeavePage(true);
			setPublished(false);
			setShowSaveBtn(false);
			props.returnNewEvent(responseData.event);
		} catch (err) {}
	};

	/***** Form Validation Section  *****/
	const [validateTotalCap, setValidateTotalCap] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Total participants is required.';
			}
			let numVal = parseInt(value);
			if (isNaN(numVal)) {
				error = 'Please inputer a number.';
			}
			return error;
		}
	);

	const [validateNumGroups, setValidateNumGroups] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Number of groups is required.';
			}
			let numVal = parseInt(value);
			if (isNaN(numVal)) {
				error = 'Please inputer a number.';
			}
			return error;
		}
	);

	const [
		validateInsuranceWaiver,
		setValidateInsuranceWaiver
	] = useState(() => value => {
		console.log('value = ', value);
		let error;
		if (value && !validator.isURL(value, [])) {
			error = 'Please provide a full URL starting with https.';
		}
		return error;
	});
	/***** End of Form Validation *****/

	const publishHandler = async () => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/publish/${eventId}`,
				'PATCH',
				JSON.stringify({ published: true }),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setPublished(true);
			props.returnNewEvent(responseData.event);
		} catch (err) {}
	};

	const deleteHandler = async () => {
		setShowDELModal(false);
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/events/${eventId}`,
				'DELETE',
				null,
				{
					// No need for content-type since body is null,
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// after deleting event, forward to eventManager, we do not want to send null event back
			// even we have a callback from EditEventManager
			history.push(
				`/clubs/editEventSelector/${clubAuthContext.clubId}`
			);
		} catch (err) {}
	};

	const closeRegHandler = async () => {
		setShowCloseRegModal(false);
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/events/closeEventRegistration/${eventId}`,
				'PATCH',
				JSON.stringify({ closed: true }),
				{
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setRegistrationClosed(true);
			props.returnNewEvent(responseData.event);
		} catch (err) {}
	};

	const openRegHandler = async () => {
		setShowOpenRegModal(false);
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/events/closeEventRegistration/${eventId}`,
				'PATCH',
				JSON.stringify({ closed: false }),
				{
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setRegistrationClosed(false);
			props.returnNewEvent(responseData.event);
		} catch (err) {}
	};

	const eventForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Please enter event registration information</h4>
				{/* <h5>&nbsp;All fields are required</h5> */}
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					saveHandler(values);
					if (!actions.isSubmitting) {
						setValidateTotalCap(() => value => {
							let error;
							if (!value) {
								error = 'Total number of participants is required.';
							}
							let numVal = parseInt(value);
							if (isNaN(numVal)) {
								error = 'Please inputer a number.';
							}
							return error;
						});
						setValidateNumGroups(() => value => {
							let error;
							if (!value) {
								error = 'Number of groups is required.';
							}
							let numVal = parseInt(value);
							if (isNaN(numVal)) {
								error = 'Please inputer a number.';
							}
							return error;
						});
					}
				}}>
				{({
					values,
					dirty,
					errors,
					isSubmitting,
					isValid,
					setFieldValue,
					submitted,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						<label htmlFor="totalCap" className="event-form__label">
							<i className="fal fa-users"></i>
							&nbsp; Total Participants
						</label>
						<Field
							id="totalCap"
							name="totalCap"
							type="text"
							className="event-form__field_quarter"
							validate={validateTotalCap}
							disabled={published}
							onBlur={event => {
								// without handBlure(event) touched.name will not work
								handleBlur(event);
								updateEventFormData('totalCap', event.target.value);
								setOKLeavePage(false);
								setShowSaveBtn(true);
							}}
						/>
						{touched.totalCap && errors.totalCap && (
							<div className="event-form__field-error_quarter">
								{errors.totalCap}
							</div>
						)}
						<label htmlFor="numGroups" className="event-form__label">
							<i className="fal fa-users-class"></i>
							&nbsp; Number of Groups
						</label>
						<Field
							id="numGroups"
							name="numGroups"
							type="text"
							className="event-form__field_quarter"
							validate={validateNumGroups}
							disabled={published}
							onBlur={event => {
								handleBlur(event);
								updateEventFormData('numGroups', event.target.value);
								setOKLeavePage(false);
								setShowSaveBtn(true);
							}}></Field>
						{touched.numGroups && errors.numGroups && (
							<div className="event-form__field-error_quarter">
								{errors.numGroups}
							</div>
						)}
						<label className="event-form__checkbox">
							<Field
								id="capDistribution"
								name="capDistribution"
								type="checkbox"
								disabled={published}
								onBlur={event => {
									handleBlur(event);
									setOKLeavePage(false);
									setShowSaveBtn(true);
								}}
							/>
							&nbsp; Check the box if you want to evenly distribute
							total participant number to each group.
						</label>
						{props.event.multiDayEvent && (
							<label className="event-form__checkbox">
								<Field
									id="multiDayEvent"
									name="multiDayEvent"
									type="checkbox"
									disabled={published}
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
									}}
									disabled={true}
								/>
								&nbsp; You are creating a multiple day event. Please
								check the box if each day represent a single event.
							</label>
						)}
						{values.priorityRegEndDate !==
							moment('2021-01-01').format('YYYY-MM-DD') && (
							<React.Fragment>
								<label
									className="event-form__checkbox"
									htmlFor="priorityRegEndDate">
									Priority Registration End Date (Must be at least one
									day prior to offical registration start date)
								</label>
								<Field
									id="priorityRegEndDate"
									name="priorityRegEndDate"
									type="date"
									min={moment()
										.add(1, 'days')
										.format('YYYY-MM-DD')
										.toString()}
									max={moment(props.event.regStartDate)
										.add(-1, 'days')
										.format('YYYY-MM-DD')
										.toString()}
									className="event-form__checkbox"
									disabled={published}
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
									}}
								/>
							</React.Fragment>
						)}
						{values.priorityRegEndDate ===
							moment('2021-01-01').format('YYYY-MM-DD') &&
							!published && (
								<React.Fragment>
									<label className="event-form__checkbox">
										<Field
											id="priorityRegistration"
											name="priorityRegistration"
											type="checkbox"
											onBlur={event => {
												handleBlur(event);
												setOKLeavePage(false);
											}}
										/>
										&nbsp; Enable priority registration. (Only visible
										via event link.)
									</label>
									{values.priorityRegistration && (
										<React.Fragment>
											<label
												className="event-form__checkbox"
												htmlFor="priorityRegEndDate">
												Priority Registration End Date (Must be at
												least one day prior to offical registration
												start date)
											</label>
											<Field
												id="priorityRegEndDate"
												name="priorityRegEndDate"
												type="date"
												min={moment()
													.add(1, 'days')
													.format('YYYY-MM-DD')
													.toString()}
												max={moment(props.event.regStartDate)
													.add(-1, 'days')
													.format('YYYY-MM-DD')
													.toString()}
												className="event-form__checkbox"
												disabled={published}
												onBlur={event => {
													handleBlur(event);
													setOKLeavePage(false);
												}}
											/>
										</React.Fragment>
									)}
								</React.Fragment>
							)}
						{hostPrivateEvent && (
							<label className="event-form__checkbox">
								<Field
									id="privateEvent"
									name="privateEvent"
									type="checkbox"
									disabled={published}
									onBlur={event => {
										handleBlur(event);
										setOKLeavePage(false);
									}}
								/>
								&nbsp; Check the box if this is a private event. (A
								private event is only visible via the event link.)
							</label>
						)}
						<label
							htmlFor="insuranceWaiver"
							className="event-form__label">
							<i className="fal fa-file-signature"></i>
							&nbsp; Optional Insurance Waiver Link (Full URL)
						</label>
						<Field
							id="insuranceWaiver"
							name="insuranceWaiver"
							type="text"
							className="event-form__field"
							validate={validateInsuranceWaiver}
							disabled={
								submitted || initialValues.insuranceWaiver !== ''
							}
							onBlur={event => {
								// without handBlure(event) touched.name will not work
								handleBlur(event);
								updateEventFormData(
									'insuranceWaiver',
									event.target.value
								);
								setOKLeavePage(false);
								setShowSaveBtn(true);
							}}
						/>
						{touched.insuranceWaiver && errors.insuranceWaiver && (
							<div className="event-form__field-error">
								{errors.insuranceWaiver}
							</div>
						)}
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={
								isSubmitting || (!isValid && dirty) || !showSaveBtn
							}>
							SAVE
						</Button>
						<Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							disabled={published || showSaveBtn}
							onClick={publishHandler}>
							{publishBtnName}
						</Button>
						<Button
							type="button"
							size="medium"
							margin-left="1.5rem"
							disabled={published}
							onClick={openDELHandler}>
							DELETE
						</Button>

						{published && !registrationClosed && (
							<Button
								type="button"
								size="medium"
								margin-left="1.5rem"
								onClick={openCloseRegHandler}>
								Close Registration
							</Button>
						)}
						{published && registrationClosed && (
							<Button
								type="button"
								size="medium"
								margin-left="1.5rem"
								onClick={openOpenRegHandler}>
								Open Registration
							</Button>
						)}
						<NavigationPrompt
							afterConfirm={() => {
								formContext.setIsInsideForm(false);
								removeEventFormData();
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

	return (
		<React.Fragment>
			{showDELModal && (
				<Modal
					className="modal-delete"
					show={showDELModal}
					contentClass="event-item__modal-delete"
					onCancel={closeDELHandler}
					header="Warning!"
					footerClass="event-item__modal-actions"
					footer={
						<React.Fragment>
							<Button inverse onClick={closeDELHandler}>
								CANCEL
							</Button>
							<Button danger onClick={deleteHandler}>
								DELETE
							</Button>
						</React.Fragment>
					}>
					<p className="modal__content">
						Do you really want to delete {props.event.name}? It cannot
						be recovered after deletion.
					</p>
				</Modal>
			)}
			{showCloseRegModal && (
				<Modal
					show={showCloseRegModal}
					contentClass="event-item__modal-content"
					footerClass="event-item__modal-actions"
					onCancel={closeCloseRegHandler}
					header="Warning!"
					footer={
						<React.Fragment>
							<Button size="small-red" onClick={closeRegHandler}>
								CLOSE REGISTRATION
							</Button>
							<Button
								size="small-white"
								onClick={closeCloseRegHandler}>
								CANCEL
							</Button>
						</React.Fragment>
					}>
					<p className="modal__content">
						Please confirm you really want to close registration for{' '}
						{props.event.name}.
					</p>
				</Modal>
			)}
			{showOpenRegModal && (
				<Modal
					show={showOpenRegModal}
					contentClass="event-item__modal-content"
					footerClass="event-item__modal-actions"
					onCancel={closeOpenRegHandler}
					header="Warning!"
					footer={
						<React.Fragment>
							<Button size="small-red" onClick={openRegHandler}>
								OPEN REGISTRATION
							</Button>
							<Button
								size="small-white"
								onClick={closeOpenRegHandler}>
								CANCEL
							</Button>
						</React.Fragment>
					}>
					<p className="modal__content">
						Please confirm you really want to open registration for{' '}
						{props.event.name}.
					</p>
				</Modal>
			)}
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

export default UpdateEventRegistration;
