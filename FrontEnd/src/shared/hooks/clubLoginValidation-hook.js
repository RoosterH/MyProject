import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ClubAuthContext } from '../context/auth-context';

export const useClubLoginValidation = url => {
	const clubAuthContext = useContext(ClubAuthContext);
	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add Redirect such as
	// <Redirect strict from="/clubs/events/new" to="/clubs/auth" /> in general route,
	// (!clubToken) route. Without it, we won't be able to redirect it.
	// To add Route '/clubs/events/new' in general Route will be able to redirect the page
	// but waring of "Cannot update during an existing state transition" will occur.
	let storageData = JSON.parse(localStorage.getItem('userData'));

	useEffect(() => {
		let mounted = true;

		// skip validation if clubAuthContext.clubRedirectURL === url meaning we are in redirection loop
		if (
			clubAuthContext.clubRedirectURL !== url &&
			(!storageData ||
				!storageData.clubId ||
				storageData.clubId !== clubAuthContext.clubId)
		) {
			if (mounted) {
				clubAuthContext.setClubRedirectURL(url);
				history.push('/clubs/auth');
			}
		}
		return () => {
			mounted = false;
		};
	}, [storageData, clubAuthContext, history, url]);
};
