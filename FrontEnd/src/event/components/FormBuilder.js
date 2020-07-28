import React, { useContext, useState } from 'react';

import { ClubAuthContext } from '../../shared/context/auth-context';
import DemoBar from '../../formbuilder/src/demobar';
import { ReactFormBuilder } from '../../formbuilder/src/index';
import { useHttpClient } from '../../shared/hooks/http-hook';
import * as variables from '../../formbuilder/src/variables';
// import { get, post } from '../../formbuilder/src/stores/requests';

import './FormBuilder.css';
import '../../shared/scss/application.scss';

const API = '/api/clubs/form/:';

const CustomForm = props => {
	const clubAuth = useContext(ClubAuthContext);
	const [loadedForm, setLoadedForm] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	let items = [
		{
			key: 'Header',
			name: 'Header Text',
			icon: 'fa fa-header',
			static: true,
			content: 'Placeholder text...'
		},
		{
			key: 'Paragraph',
			name: 'Paragraph',
			static: true,
			icon: 'fa fa-paragraph',
			content: 'Placeholder text...'
		}
	];

	let eventId = props.id;
	// fn is a callback function that returns responseData to its caller
	const onLoad = fn => {
		// GET event form from server
		let responseData;
		const fetchForm = async () => {
			try {
				console.log('inside fetechForm');
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
				fn(responseData);
				console.log('responseData = ', responseData);
				// if (props.responseData) {
				// 	console.log('responseData = ', props.responseData);
				// 	setLoadedForm(responseData.form);
				// }
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
		data = fixFormData(data);
		const createForm = async () => {
			try {
				const formData = new FormData();
				let responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/form/${props.id}`,
					'POST',
					JSON.stringify({
						task_data: data.task_data
					}),
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuth.clubToken,
						'Content-type': 'application/json'
					}
				);
				if (responseData) {
					console.log('responseData = ', responseData);
				}
			} catch (err) {
				console.log('err = ', err);
			}
		};
		return createForm();
	};

	return (
		<React.Fragment>
			<DemoBar variables={variables} />
			<div className="formbuilder-container">
				<ReactFormBuilder
					onLoad={onLoad}
					onPost={onPost}
					toolbarItems={items}
				/>
			</div>
		</React.Fragment>
	);
};

export default CustomForm;
