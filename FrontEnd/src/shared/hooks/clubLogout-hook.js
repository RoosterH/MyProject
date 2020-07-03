import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

export const useClubLogOut = () => {
	const clubAuth = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const history = useHistory();
	const logoutHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();

		try {
			// use custom hook.
			await sendRequest(
				'http://localhost:5000/api/clubs/logout',
				'POST',
				null,
				{ Authorization: 'Bearer ' + clubAuth.clubToken }
			);
			/**
			 * Need to put redirect before calling clubAuthContext.clubLogin(responseData.club.id).
			 * Otherwise App.js has ClubAuthContext.provider will re-render App and go to
			 * <Redirect to="/"> If we have components that send http request in that Route
			 * the http request will be aborted and got a warning:
			 * Warning: Can't perform a React state update on an unmounted component. when
			 * trying to redirect page after logging
			 */
			history.push('/');
			clubAuth.clubLogout();
		} catch (err) {
			console.log('err = ', err);
			// empty. Custom hook takes care of it already
		}
	};
	return { isLoading, error, logoutHandler, clearError };
};
