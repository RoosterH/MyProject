import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { UserAuthContext } from '../context/auth-context';

export const useUserLoginValidation = url => {
	const userAuthContext = useContext(UserAuthContext);
	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. If club not logging in, re-direct to auth page
	let storageData = JSON.parse(localStorage.getItem('userData'));
	console.log('storageData = ', storageData);
	console.log('userAuthContext = ', userAuthContext);
	console.log('url = ', url);
	useEffect(() => {
		let mounted = true;
		console.log('url2 = ', url);
		console.log(
			'userAuthContext.userRedirectURL !== url = ',
			userAuthContext.userRedirectURL !== url
		);
		// skip validation if userAuthContext.userRedirectURL === url meaning we are in redirection loop
		if (
			userAuthContext.userRedirectURL !== url &&
			(!storageData ||
				!storageData.userId ||
				storageData.userId !== userAuthContext.userId)
		) {
			console.log('inside');
			if (mounted) {
				console.log('going to auth');
				userAuthContext.setUserRedirectURL(url);
				// inside of userAuth will check if userAuthContext.userRedirectURL exisits for redirection
				history.push('/users/auth');
			}
		}
		return () => {
			mounted = false;
		};
	}, [storageData, history, userAuthContext, url]);
};
