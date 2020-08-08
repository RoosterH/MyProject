import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { ClubAuthContext } from '../context/auth-context';

export const ClubLoginValidation = () => {
	const clubAuth = useContext(ClubAuthContext);
	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add Redirect such as
	// <Redirect strict from="/clubs/events/new" to="/clubs/auth" /> in general
	// (!clubToken) route. Without it, we won't be able to redirect it.
	// To add Route '/clubs/events/new' in general Route will be able to redirect the page
	// but waring of "Cannot update during an existing state transition" will occur.
	let storageData = JSON.parse(localStorage.getItem('userData'));
	if (
		!storageData ||
		!storageData.clubId ||
		storageData.clubId !== clubAuth.clubId
	) {
		history.push('/clubs/auth');
	}

	return;
};
