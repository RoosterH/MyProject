import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import NavigationPrompt from 'react-router-navigation-prompt';
import moment from 'moment';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

const EditClubInformation = props => {
	const eventId = props.eventId;
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const userAuthContext = useContext(UserAuthContext);
	const userId = userAuthContext.userId;
	const formContext = useContext(FormContext);

	// this is the return function that passes finishing status back to NewEventManager
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

	const [OKLeavePage, setOKLeavePage] = useState(true);

	const initialValues = {
		carNumber: props.carNumber,
		membershipFee: 'false'
	};

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
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				console.log('responseData = ', responseData);
				setClubCollectMembershipFee(
					responseData.collectMembershipFee
				);
				setMembershipFee(responseData.membershipFee);
				setMemberExp(responseData.memberExp);
				setClubName(responseData.clubName);
			} catch (err) {}
		};

		fetchMemberCarInfo();
	}, []);

	const [memberExpDate, setMemberExpDate] = useState();
	useEffect(() => {
		console.log('memberExp = ', memberExp);
		if (memberExp) {
			setMemberExpDate(moment(memberExp).format('L'));
		}
	}, [memberExp]);

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
	/***** End of Form Validation *****/

	if (
		!userAuthContext ||
		!userAuthContext.userId ||
		userAuthContext.userId !== props.userId
	) {
		return (
			<div className="list-header clearfix">
				{/* <div className="selector-title"> */}
				<div className="h3">Not authorized to access garage</div>
			</div>
		);
	}

	const submitHandler = async values => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/entries/clubInformation/${props.entryId}`,
				'PATCH',
				JSON.stringify({
					carNumber: values.carNumber
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);

			props.getNewEntry(responseData.entry);
		} catch (err) {}
	};

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
					dirty,
					setFieldValue,
					submitted,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						{clubCollectMembershipFee && memberExp && (
							<label className="event-form__label">
								<i className="fal fa-id-card fa-lg"></i>
								&nbsp; Your Membership Expiration Date:{' '}
								{memberExpDate}.
							</label>
						)}
						{clubCollectMembershipFee && !memberExp && (
							<label className="event-form__label">
								<i className="fal fa-id-card fa-lg"></i>&nbsp; You are
								not a member of {clubName}.
							</label>
						)}
						<br />
						<label htmlFor="carNumber" className="event-form__label">
							<i className="fal fa-question-circle"></i>
							&nbsp; Club Information
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
								setOKLeavePage(false);
							}}
						/>
						{touched.carNumber && errors.carNumber && (
							<div className="event-form__field-error_quarter">
								{errors.carNumber}
							</div>
						)}
						<label htmlFor="numGroups" className="event-form__label">
							<i className="fal fa-users-class"></i>
							{/* <i className="fad fa-cars"></i> */}
							&nbsp; Race Class
						</label>
						<Button
							type="submit"
							size="small-block"
							margin-left="1.5rem"
							disabled={isSubmitting || !(isValid && dirty)}>
							Submit Changes
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								formContext.setIsInsideForm(false);
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

export default EditClubInformation;
