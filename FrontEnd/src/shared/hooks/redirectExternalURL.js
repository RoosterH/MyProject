import { useContext } from 'react';
import { ClubAuthContext } from '../../shared/context/auth-context';

const RedirectExternalURL = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	if (clubAuthContext.clubRedirectURL) {
		console.log(
			'url in newWindow = ',
			clubAuthContext.clubRedirectURL
		);
		window.location = clubAuthContext.clubRedirectURL;
	}

	return null;
};

export default RedirectExternalURL;
