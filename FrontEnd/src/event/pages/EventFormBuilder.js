import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { ClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import './EventForm.css';
import FormBuilder from '../components/FormBuilder';

const EventFormBuilder = () => {
	const clubAuth = useContext(ClubAuthContext);
	let eventId = useParams().id;
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. To avoid hacking, we want to re-direct to auth page, if club not logging
	// in or clubId doesn't match
	ClubLoginValidation();

	return <FormBuilder id={eventId} />;
};

export default EventFormBuilder;
