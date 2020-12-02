import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { ReactFormGenerator } from '../../formbuilder/src/index';
import { useParams } from 'react-router-dom';

import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventForm.css';
const EventForm = props => {
	let eId = props.eventId;
	let entryId = props.entryId;
	let editingMode = props.editingMode;

	const userAuthContext = useContext(UserAuthContext);
	const [formData, setFormData] = useState();
	const [formAnswer, setFormAnswer] = useState();
	const [eventName, setEventName] = useState();
	const [submittedEntry, setSubmittedEntry] = useState(false);
	const [newEntry, setNewEntry] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// this is a callback for ReactFormGenerator
	const getNewEntry = newEntry => {
		props.getNewEntry(newEntry);
	};

	// Check if userAuthContext.redirectURL is same as the path.
	// If they are the same meaning it's coming back from re-direction that user click on register event without logging in.
	// In this case, we want to skip login validation
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
				`/events/newentry/${eId}`
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

	// // combine eId and uId to send to backend,
	// // url is /events/form/:eId/:uId
	// let url = '/events/form/' + eId;
	// const storageData = JSON.parse(localStorage.getItem('userData'));
	// if (storageData && storageData.userId) {
	// 	url += '/' + storageData.userId;
	// }

	useEffect(() => {
		let mounted = true;
		const fetchForm = async () => {
			try {
				if (editingMode) {
					const [
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						// process.env.REACT_APP_BACKEND_URL + `/events/form/${eId}`,
						process.env.REACT_APP_BACKEND_URL +
							`/users/formWithAnswer/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + userAuthContext.userToken
						}
					);
					console.log('responseData = ', responseData);
					if (responseData) {
						setEventName(responseData.eventName);
						setNewEntry(responseData.entry);
						setFormAnswer(responseData.entry.answer);
						setFormData(responseData.entryFormData);
						console.log('answer = ', responseData.entry.answer);
					}
				} else {
					const [
						responseData,
						responseStatus,
						responseMessage
					] = await sendRequest(
						process.env.REACT_APP_BACKEND_URL + `/users/form/${eId}`,
						'GET',
						null,
						{
							// adding JWT to header for authentication, JWT contains clubId
							Authorization: 'Bearer ' + userAuthContext.userToken
						}
					);
					console.log('responseData = ', responseData);
					if (responseData) {
						setEventName(responseData.eventName);
						setFormData(responseData.entryFormData);
					}
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
		editingMode
	]);

	useEffect(() => {
		if (!editingMode && submittedEntry) {
			// return true back to NewEntryManager to move to Submit tab
			props.eventFormStatus(true);
		} else if (editingMode && newEntry) {
			props.getNewEntry(newEntry);
		}
	}, [submittedEntry, editingMode, newEntry]);

	const getFormAnswer = answer => {
		setFormAnswer(answer);
	};

	useEffect(() => {
		if (!editingMode && formAnswer) {
			props.returnFormAnswer(formAnswer);
			setSubmittedEntry(true);
		}
	}, [formAnswer, props.returnFormAnswer, editingMode]);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}

			{formData && formData.length > 0 && (
				<div className="event-formgenerator-container">
					<div className="modal-content">
						<ReactFormGenerator
							answer_data={formAnswer}
							action_name={
								editingMode ? 'SUBMIT' : 'SUBMIT & CONTINUE'
							}
							data={formData}
							returnFormAnswer={getFormAnswer}
							entryId={entryId}
							editingMode={editingMode}
							getNewEntry={getNewEntry}
						/>
					</div>
				</div>
				// </div>
			)}
		</React.Fragment>
	);
};

export default EventForm;
