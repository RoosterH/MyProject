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
	}, [formContext]);

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

	// define tool bar items, full definitions are in toolbar.jsx
	let items = [
		{
			key: 'RadioButtons',
			canHaveAnswer: true,
			name: 'Registration Options',
			icon: 'far fa-dot-circle',
			label: '<strong>Registration Options</strong>',
			field_name: 'regOption',
			required: true,
			options: [
				{
					value: '50',
					text: 'AAS Member $50',
					key: `regRadioOption_0`
				},
				{
					value: '60',
					text: 'AAS Member $60',
					key: `regRadioOption_1`
				}
			]
		},
		// {
		// 	key: 'Checkboxes',
		// 	canHaveAnswer: true,
		// 	name: 'Registration Options Multiple Selection',
		// 	icon: 'far fa-dot-circle',
		// 	label: '<strong>Registration Options</strong>',
		// 	field_name: 'regOption',
		// 	required: true,
		// 	options: [
		// 		{
		// 			value: '50',
		// 			text: 'AAS Member $50',
		// 			key: `regCheckboxOption_0`
		// 		},
		// 		{
		// 			value: '60',
		// 			text: 'AAS Member $60',
		// 			key: `regCheckboxOption_1`
		// 		}
		// 	]
		// },
		{
			key: 'RadioButtons',
			canHaveAnswer: true,
			name: 'Race Session Single Selection',
			icon: 'far fa-dot-circle',
			label: '<strong>Registration Options</strong>',
			field_name: 'regOption',
			required: true,
			options: [
				{
					value: '0',
					text: 'Morning Session 1',
					key: `raceRadioOption_0`
				},
				{
					value: '1',
					text: 'Morning Session 2',
					key: `raceRadioOption_1`
				},
				{
					value: '2',
					text: 'Afternoon Session 1',
					key: `raceRadioOption_2`
				},
				{
					value: '3',
					text: 'Afternoon Session 2',
					key: `raceRadioOption_3`
				},
				{
					value: '4',
					text: 'Afternoon Session 2',
					key: `raceRadioOption_4`
				}
			]
		},
		{
			key: 'Checkboxes',
			canHaveAnswer: true,
			name: 'Race Session Multiple Selection',
			icon: 'far fa-check-square',
			label: '<strong>Registration Options</strong>',
			field_name: 'regOption',
			required: true,
			options: [
				{
					value: '0',
					text: 'Morning Session 1',
					key: `raceCheckboxOption_0`
				},
				{
					value: '1',
					text: 'Morning Session 2',
					key: `raceCheckboxOption_1`
				},
				{
					value: '2',
					text: 'Afternoon Session 1',
					key: `raceCheckboxOption_2`
				},
				{
					value: '3',
					text: 'Afternoon Session 2',
					key: `raceCheckboxOption_3`
				},
				{
					value: '4',
					text: 'Afternoon Session 3',
					key: `raceCheckboxOption_4`
				}
			]
		},
		{
			key: 'RadioButtons',
			canHaveAnswer: true,
			name: 'Lunch Selection',
			icon: 'far fa-dot-circle',
			label: '<strong>Lunch Selection</strong>',
			field_name: 'lunchOption',
			required: true,
			options: [
				{
					value: '10',
					text: 'Hamburger $10',
					key: `lunchRadioOption_0`
				},
				{
					value: '8',
					text: 'Sandwitch $8',
					key: `lunchRadioOption_1`
				},
				{
					value: '8',
					text: 'Veggie Sandwitch $8',
					key: `lunchRadioOption_2`
				},
				{
					value: '0',
					text: 'No lunch',
					key: `lunchRadioOption_3`
				}
			]
		},
		{
			key: 'RadioButtons',
			canHaveAnswer: true,
			name: 'Worker Signup',
			icon: 'far fa-dot-circle',
			label: '<strong>Worker Signup</strong>',
			field_name: 'workerOption',
			required: true,
			options: [
				{
					value: '0',
					text: 'Course Worker',
					key: `workerRadioOption_0`
				},
				{
					value: '1',
					text: 'Course Setup',
					key: `workerRadioOption_1`
				},
				{
					value: '2',
					text: 'Timing',
					key: `workerRadioOption_2`
				},
				{
					value: '3',
					text: 'Morning Gate',
					key: `workerRadioOption_3`
				},
				{
					value: '4',
					text: 'Afternoon Gate',
					key: `workerRadioOption_4`
				}
			]
		},
		{
			key: 'ParagraphCheckbox',
			canHaveAnswer: true,
			name: 'Event Waiver',
			static: true,
			icon: 'far fa-check-square',
			label: '<strong>Event Waiver</strong>',
			content: 'Waiver...',
			field_name: 'waiverCheckbox',
			required: true,
			options: [
				{
					value: '1',
					text:
						'I have read, understand and agree to limit my rights as defined in this waiver',
					key: `waiverCheckboxOption_0`
				}
			]
		},
		{
			key: 'ParagraphCheckbox',
			canHaveAnswer: true,
			name: 'Disclaimer',
			static: true,
			icon: 'far fa-check-square',
			label: '<strong>Disclaimer</strong>',
			content: 'Disclaimer...',
			field_name: 'disclaimerCheckbox',
			required: true,
			options: [
				{
					value: '1',
					text: 'I accept the cancellation terms and conditions',
					key: `disclaimerCheckboxOption_0`
				}
			]
		},
		{
			key: 'Header',
			name: 'Header Text',
			icon: 'fa fa-header',
			static: true,
			content: 'Placeholder text...'
		},
		{
			key: 'Paragraph',
			name: 'Waiver Content',
			static: true,
			icon: 'fa fa-paragraph',
			content: 'Please enter waiver here...'
		},
		{
			key: 'Paragraph',
			name: 'Paragraph',
			static: true,
			icon: 'fas fa-paragraph',
			content: 'Placeholder text...'
		},
		{
			key: 'Checkboxes',
			canHaveAnswer: true,
			name: 'Checkboxes',
			icon: 'far fa-check-square',
			label: 'Placeholder Label',
			field_name: 'checkboxes_',
			options: []
		}
	];

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
					toolbarItems={items}
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
