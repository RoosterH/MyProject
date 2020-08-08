import { useContext } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import { UserAuthContext } from '../context/auth-context';

export const UserLoginValidation = () => {
	const userAuth = useContext(UserAuthContext);
	const history = useHistory();
	// To make sure page refreshing reloads correctly, we need to add path="/events/new" to
	// (!clubToken) route. If club not logging in, re-direct to auth page
	let storageData = JSON.parse(localStorage.getItem('userData'));
	if (
		!storageData ||
		!storageData.userId ||
		storageData.userId !== userAuth.userId
	) {
		history.push('/users/auth');
	}
};
