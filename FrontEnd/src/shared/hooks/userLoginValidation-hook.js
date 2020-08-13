import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router';
import { useHistory } from 'react-router-dom';
import { UserAuthContext } from '../context/auth-context';

export const useUserLoginValidation = url => {
	const userAuthContext = useContext(UserAuthContext);
	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. If club not logging in, re-direct to auth page
	let storageData = JSON.parse(localStorage.getItem('userData'));
	useEffect(() => {
		let mounted = true;

		// skip validation if userAuthContext.redirectURL === url meaning we are in redirection loop
		if (
			userAuthContext.redirectURL !== url &&
			(!storageData ||
				!storageData.userId ||
				storageData.userId !== userAuthContext.userId)
		) {
			if (mounted) {
				userAuthContext.setRedirectURL(url);
				// inside of userAuth will check if userAuthContext.redirectURL exisits for redirection
				history.push('/users/auth');
			}
		}
		return () => {
			mounted = false;
		};
	}, [storageData, userAuthContext.userId, history]);
};
