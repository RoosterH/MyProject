import React, { useContext } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

// This code is NOT USED
const EntryFormBar = (eid, isSaved) => {
	const clubAuth = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const saveHandler = async () => {
		var eventEntryForm = localStorage.getItem('entryFormData');

		// If no existing data, create an array; otherwise retrieve it
		eventEntryForm = eventEntryForm ? JSON.parse(eventEntryForm) : {};

		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/clubs/form/${eid}`,
				'POST',
				JSON.stringify({
					entryFormData: eventEntryForm
				}),
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuth.clubToken,
					'Content-type': 'application/json'
				}
			);
			if (responseData) {
				isSaved(true);
				console.log('responseData = ', responseData);
			}
		} catch (err) {
			console.log('err = ', err);
		}
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			<div
				className="clearfix"
				style={{ margin: '10px', width: '70%' }}>
				{/* <h4 className="float-left">Preview</h4> */}
				<h4 className="float-left">Entry Form Builder</h4>
				<button
					className="btn btn-primary float-right"
					style={{ marginRight: '10px' }}
					onClick={saveHandler}>
					Save
				</button>
			</div>
		</React.Fragment>
	);
};

export default EntryFormBar;
