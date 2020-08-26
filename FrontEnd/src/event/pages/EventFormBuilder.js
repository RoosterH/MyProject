import React, { useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import FormBuilder from '../components/FormBuilder';
import { ClubAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventForm.css';

const EventFormBuilder = () => {
	const clubAuthContext = useContext(ClubAuthContext);

	let eventId = useParams().id;
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

	return <FormBuilder id={eventId} />;
};

export default EventFormBuilder;
