import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import './EventForm.css';
import FormBuilder from '../components/FormBuilder';

const EventForm = () => {
	const clubAuth = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. To avoid hacking, we want to re-direct to auth page, if club not logging
	// in or clubId doesn't match
	const storageData = JSON.parse(localStorage.getItem('userData'));
	if (
		!storageData ||
		!storageData.clubId ||
		storageData.clubId !== clubAuth.clubId
	) {
		history.push('/clubs/auth');
	}

	// ask form from Backend, if it's available retrieve it.
	let formCreated = false;

	// const eventSubmitHandler = async event => {};

	// the purpose of onInput is to enter back the value after been validated to NewEvent
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && <LoadingSpinner asOverlay />}
			{!formCreated && <FormBuilder />}
		</React.Fragment>
	);
};

export default EventForm;
