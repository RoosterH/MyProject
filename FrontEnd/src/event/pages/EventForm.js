import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { ReactFormGenerator } from '../../formbuilder/src/index';
import { useParams } from 'react-router-dom';

import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventForm.css';
const EventForm = props => {
	const userAuthContext = useContext(UserAuthContext);
	const [formData, setFormData] = useState();
	const [formAnswer, setFormAnswer] = useState();
	const [eventName, setEventName] = useState();
	const [submittedEntry, setSubmittedEntry] = useState(false);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const history = useHistory();

	// Check if userAuthContext.redirectURL is same as the path.
	// If they are the same meaning it's coming back from re-direction that user click on register event without logging in.
	// In this case, we want to skip login validation
	let eId = useParams().id;
	useUserLoginValidation(`/events/form/${eId}`);

	let location = useLocation();
	React.useEffect(() => {
		let path = location.pathname;
		let redirectURL = userAuthContext.userRedirectURL;
		if (path === redirectURL) {
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [location, userAuthContext]);

	if (!eId || eId === 'error') {
		// possibly page refresh, look for localStorage
		const storageData = JSON.parse(localStorage.getItem('eventData'));
		if (storageData && storageData.eId) {
			eId = storageData.eId;
			// Correct URL on browser, without it URL is showing '/events/form/error'
			// history.pushState(state object, title, url) 'title' is ignored in most browsers
			// https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
			window.history.pushState(
				// props.state,
				'',
				`/events/form/${eId}`
			);
		}
	} else {
		// set eId to localStorage for potential page refresh
		// we will remove it when the form gets submitted
		// @todo remove data when user leaves this page
		localStorage.setItem(
			'eventData',
			JSON.stringify({
				eId: eId
			})
		);
	}

	// combine eId and uId to send to backend,
	// url is /events/form/:eId/:uId
	let url = '/events/form/' + eId;
	const storageData = JSON.parse(localStorage.getItem('userData'));
	if (storageData && storageData.userId) {
		url += '/' + storageData.userId;
	}

	useEffect(() => {
		let mounted = true;
		const fetchForm = async () => {
			try {
				const responseData = await sendRequest(
					// process.env.REACT_APP_BACKEND_URL + `/events/form/${eId}`,
					process.env.REACT_APP_BACKEND_URL + url,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				if (responseData) {
					setEventName(responseData.eventName);
					setFormAnswer(responseData.entryFormAnswer);
					setFormData(responseData.entryFormData);
				}
			} catch (err) {
				console.log('err = ', err);
			}
		};

		fetchForm();
		return () => {
			mounted = false;
		};
	}, [
		sendRequest,
		eId,
		userAuthContext.userToken,
		setEventName,
		setFormData,
		setFormAnswer,
		url
	]);

	const formSubmitted = entry => {
		if (entry) {
			setSubmittedEntry(entry);
			const userData = JSON.parse(localStorage.getItem('userData'));
			if (userData) {
				userData.userEntries.push(entry);
				localStorage.setItem('userData', JSON.stringify(userData));
			}
		}
	};

	useEffect(() => {
		if (submittedEntry) {
			// history.push(`/events/${eId}`, [props.location.props]);
		}
	}, [submittedEntry]);
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}

			{formData && formData.length > 0 && (
				// <div className="modal show d-block">
				<div className="event-formgenerator-container">
					<div>{eventName} Entry Form </div>
					<br />
					<div className="modal-content">
						<ReactFormGenerator
							answer_data={formAnswer}
							action_name="Register"
							data={formData}
							returnSubmitStatus={formSubmitted}
						/>
					</div>
				</div>
				// </div>
			)}
		</React.Fragment>
	);
};

export default EventForm;
