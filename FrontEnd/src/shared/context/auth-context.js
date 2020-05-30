import { createContext } from 'react';

export const ClubAuthContext = createContext({
	isClubLoggedIn: false,
	clubId: '',
	clubLogin: () => {},
	clubLogout: () => {},
	setClubId: () => {},
	getClubId: () => {}
});

export const UserAuthContext = createContext({
	isUserLoggedIn: false,
	userLogin: () => {},
	userLogout: () => {}
});
