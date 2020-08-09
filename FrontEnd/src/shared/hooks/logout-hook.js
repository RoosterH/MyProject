import { useContext } from 'react';
import moment from 'moment';

import { useHistory } from 'react-router-dom';
import {
	ClubAuthContext,
	UserAuthContext
} from '../context/auth-context';
import { useHttpClient } from './http-hook';

export const useLogOut = () => {
	const clubAuth = useContext(ClubAuthContext);
	const userAuth = useContext(UserAuthContext);

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const history = useHistory();
	const logoutHandler = async event => {
		// get userId/clubId from localStorage
		const storageData = JSON.parse(localStorage.getItem('userData'));
		let api, token, logoutCallback;
		try {
			if (storageData) {
				if (
					storageData.clubToken &&
					moment(storageData.expiration) > moment()
				) {
					api = '/clubs/logout';
					token = clubAuth.clubToken;
					logoutCallback = () => clubAuth.clubLogout();
				} else if (
					storageData.userToken &&
					moment(storageData.expiration) > moment()
				) {
					api = '/users/logout';
					token = userAuth.userToken;
					logoutCallback = () => userAuth.userLogout();
				} else {
					throw new Error('localStorage error');
				}
			} else {
				throw new Error('localStorage error');
			}
		} catch (err) {
			throw new Error('localStorage error');
		}

		try {
			// use custom hook.
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL + api,
				'POST',
				null,
				{ Authorization: 'Bearer ' + token }
			);
			/**
			 * Need to put redirect before calling userAuthContext.userLogin(responseData.user.id).
			 * Otherwise App.js has UserAuthContext.provider will re-render App and go to
			 * <Redirect to="/"> If we have components that send http request in that Route
			 * the http request will be aborted and got a warning:
			 * Warning: Can't perform a React state update on an unmounted component. when
			 * trying to redirect page after logging
			 */
			history.push('/');
			logoutCallback();
		} catch (err) {
			console.log('err = ', err);
			// empty. Custom hook takes care of it already
		}
	};
	return { isLoading, error, logoutHandler, clearError };
};
