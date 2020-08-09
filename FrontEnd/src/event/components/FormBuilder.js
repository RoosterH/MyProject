import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import NavigationPrompt from 'react-router-navigation-prompt';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';
import { ReactFormBuilder } from '../../formbuilder/src/index';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './FormBuilder.css';
import '../../shared/scss/application.scss';

const FormBuilder = props => {
	const clubAuth = useContext(ClubAuthContext);
	const formContext = useContext(FormContext);

	useEffect(() => {
		let mounted = true;
		if (mounted) {
			formContext.setIsInsideForm(true);
		}
		return () => {
			mounted = false;
		};
	}, []);

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
			console.log('get 1');
			const storageData = JSON.parse(
				localStorage.getItem('eventEntryForm')
			);
			if (storageData) {
				setUnsavedData(storageData);
			}
		}
	};

	let eventId = props.id;
	if (!eventId || eventId === 'error') {
		// possibly page refresh, look for localStorage
		console.log('get 2');
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

	const saveHandler = async () => {
		// use existing localStorage data instead of querying from backend
		const storageData = JSON.parse(
			localStorage.getItem('eventEntryForm')
		);
		if (storageData) {
			setUnsavedData(storageData);
		}

		try {
			console.log('unsavedData = ', unsavedData);
			const responseData = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/clubs/form/${eventId}`,
				'POST',
				JSON.stringify({
					entryFormData: unsavedData,
					saveTemplate: saveTemplateClicked
				}),
				{
					'Content-type': 'application/json',
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuth.clubToken
				}
			);
			if (responseData) {
				setUnsavedData(undefined);
			}
		} catch (err) {
			console.log('err = ', err);
		}
	};

	const backHandler = () => {
		history.push(`/events/${eventId}`);
	};

	// let items = [
	// 	{
	// 		key: 'Header',
	// 		name: 'Header Text',
	// 		icon: 'fa fa-header',
	// 		static: true,
	// 		content: 'Placeholder text...'
	// 	},
	// 	{
	// 		key: 'Paragraph',
	// 		name: 'Paragraph',
	// 		static: true,
	// 		icon: 'fa fa-paragraph',
	// 		content: 'Placeholder text...'
	// 	}
	// ];

	// getResponseData is a callback function that returns responseData to its caller
	const onLoad = getResponseData => {
		// GET event form from server
		let responseData;
		const fetchForm = async () => {
			try {
				responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/form/${eventId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuth.clubToken
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
			console.log('data = ', data);
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
					Save
				</Button>
				<Button size="entryform--back" onClick={backHandler}>
					Back
				</Button>
				<label className="formbuilder-label">
					<input
						type="checkbox"
						id="saveTemplate"
						name="saveTemplate"
						onChange={toggleSaveTemplate}
					/>{' '}
					&nbsp; Save as entry form template
				</label>
			</div>
			<div className="formbuilder-container">
				<ReactFormBuilder
					disabled={published}
					onLoad={onLoad}
					onPost={onPost}
					// toolbarItems={items}
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
