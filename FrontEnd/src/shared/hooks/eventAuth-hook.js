import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { ClubAuthContext } from '../context/auth-context';

export const EventAuth = () => {
	const clubAuth = useContext(ClubAuthContext);
	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. If club not logging in, re-direct to auth page
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
