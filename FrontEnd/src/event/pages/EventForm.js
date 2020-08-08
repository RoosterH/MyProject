import React, { useState, useContext } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { UserAuthContext } from '../../shared/context/auth-context';
import { UserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';
import FormBuilder from '../components/FormBuilder';

const EventForm = () => {
	const [loggedIn, setLoggedIn] = useState(false);
	let eventId = useParams().id;
	console.log('I am here 2');
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. To avoid hacking, we want to re-direct to auth page, if club not logging
	// in or clubId doesn't match

	UserLoginValidation({ setLoggedIn });

	return <FormBuilder id={eventId} />;
};

export default EventForm;
