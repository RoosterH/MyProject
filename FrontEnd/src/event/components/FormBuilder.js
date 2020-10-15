import React, { useContext, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import NavigationPrompt from 'react-router-navigation-prompt';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';
import { ReactFormBuilder } from '../../formbuilder/src/index';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import { EntryFormOptions } from './EntryFormOptions';

import './FormBuilder.css';
import '../../formbuilder/scss/application.scss';

const FormBuilder = props => {
	let eventId = props.eventId;

	const [contButton, setContButton] = useState(false);
	const [contStatus, setContStatus] = useState(false);
	useEffect(() => {
		if (contStatus) {
			props.formbuilderStatus(true);
		}
	}, [contStatus, props]);

	if (!eventId || eventId === 'error') {
		// possibly page refresh, look for localStorage
		const storageData = JSON.parse(localStorage.getItem('eventData'));
		if (storageData && storageData.eventId) {
			eventId = storageData.eventId;
			// Correct URL on browser, without it URL is showing '/events/form/error'
			// history.pushState(state object, title, url) 'title' is ignored in most browsers
			// https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
			window.history.pushState(
				props.state,
				'',
				`/events/form/${eventId}`
			);
		}
	} else {
		// set eventId to localStorage for potential page refresh
		// we will remove it when the form gets submitted
		// @todo remove data when user leaves this page
		localStorage.setItem(
			'eventData',
			JSON.stringify({
				eventId: eventId
			})
		);
	}

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

	useClubLoginValidation(`/events/formbuilder/${eventId}`);
	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	React.useEffect(() => {
		let path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [clubAuthContext, location]);

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const history = useHistory();
	const [published, setPublished] = useState(true);
	const [unsavedData, setUnsavedData] = useState();
	const [saveTemplateClicked, setSaveTemplateClicked] = useState(
		false
	);

	const toggleSaveTemplate = event => {
		setSaveTemplateClicked(event.target.checked);
		// after SAVE to backend, user click checkbox "Save as entry form template", enable SAVE button
		// if checkbox value is true
		if (event.target.checked && !unsavedData) {
			const storageData = JSON.parse(
				localStorage.getItem('eventEntryForm')
			);
			// SAVE button enabled when there is an unsavedData
			if (storageData) {
				setUnsavedData(storageData);
			}
		}
	};

	const saveHandler = async () => {
		// use existing localStorage data instead of querying from backend
		const storageData = JSON.parse(
			localStorage.getItem('eventEntryForm')
		);
		if (storageData) {
			setUnsavedData(storageData);
		}

		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/events/form/${eventId}`,
				'POST',
				JSON.stringify({
					entryFormData: unsavedData,
					saveTemplate: saveTemplateClicked
				}),
				{
					'Content-type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			if (responseData) {
				setUnsavedData(undefined);
				setContButton(true);
			}
		} catch (err) {
			console.log('err = ', err);
		}
	};

	const continueHandler = () => {
		setContStatus(true);
		// history.push(`/events/${eventId}`);
	};

	// getResponseData is a callback function that returns responseData to its caller
	const onLoad = getResponseData => {
		// GET event form from server
		const fetchForm = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/form/${eventId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				if (responseData) {
					getResponseData(responseData);
					setPublished(responseData.published);
					setUnsavedData(responseData);
					// save the from data got from backend to localstorage
					localStorage.setItem(
						'eventEntryForm',
						JSON.stringify(responseData)
					);
				}
			} catch (err) {
				console.log('err = ', err);
			}
		};
		return fetchForm();
	};

	function fixFormData(data) {
		return !data || data === '[]' || data.length === 0 ? [] : data;
	}

	const onPost = data => {
		// we want to save the data to localStorage for the best performance
		data = fixFormData(data);

		const setData = () => {
			// save the array to unsavedData and backend
			// format of data: {task_data: Array(6)}
			setUnsavedData(data.task_data);
			setPublished(false);
			// update the new data to localStorage
			localStorage.setItem(
				'eventEntryForm',
				JSON.stringify(data.task_data)
			);
		};

		return setData();
	};

	const cleanUp = () => {
		clubAuthContext.setClubRedirectURL(null);
		setUnsavedData(undefined);
		localStorage.removeItem('eventData');
		localStorage.removeItem('eventEntryForm');
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			<div className="formbuilder-header">
				<h4>Entry Form Builder</h4>
				<Button
					disabled={!unsavedData}
					size="entryform--save"
					onClick={saveHandler}>
					SAVE
				</Button>
				<Button
					disabled={!contButton}
					size="entryform--back"
					onClick={continueHandler}>
					CONTINUE
				</Button>
				{/* <Button size="entryform--back" onClick={backHandler}>
					BACK
				</Button> */}
				<label className="formbuilder-label">
					<input
						type="checkbox"
						id="saveTemplate"
						name="saveTemplate"
						onChange={toggleSaveTemplate}
					/>
					&nbsp; Save as entry form template
				</label>
			</div>
			<div className="formbuilder-container">
				<ReactFormBuilder
					disabled={published}
					onLoad={onLoad}
					onPost={onPost}
					toolbarItems={EntryFormOptions()}
				/>
			</div>
			<NavigationPrompt
				afterConfirm={() => {
					cleanUp();
					formContext.setIsInsideForm(false);
				}}
				// Confirm navigation if going to a path that does not start with current path:
				//when={!!unsavedData}
				when={(crntLocation, nextLocation) =>
					!nextLocation ||
					!nextLocation.pathname.startsWith(crntLocation.pathname)
				}>
				{({ isActive, onCancel, onConfirm }) => {
					if (isActive) {
						return (
							<PromptModal
								onCancel={onCancel}
								onConfirm={onConfirm}
								contentClass="event-item__modal-content"
								footerClass="event-item__modal-actions"
								error="You sure want to leave? Unsaved data will be lost.">
								{/* render props.children */}
							</PromptModal>
						);
					}
					return history.push('/error');
				}}
			</NavigationPrompt>
		</React.Fragment>
	);
};

export default FormBuilder;
