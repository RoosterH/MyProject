import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import './EventForm.css';
import FormBuilder from '../components/FormBuilder';

const EventForm = () => {
	const clubAuth = useContext(ClubAuthContext);
	let eventId = useParams().id;
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

	return <FormBuilder id={eventId} />;
};

export default EventForm;
