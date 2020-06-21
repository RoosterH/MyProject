import { createContext } from 'react';

/**
 * createContext is a listener that can be used to pass values between components.
 * For example, in ClubAuth.js clubSubmitHandler we set a listener,
 * const clubAuthContext = useContext(ClubAuthContext);
 * inside of isLoginMode we assign clubId using
 * clubAuthContext.clubLogin(responseData.club.id);
 * responseData comes from backend clubsController.js loginClub where it returns club as an object
 * In NewEvent.js, we set a listener
 * const clubAuth = useContext(ClubAuthContext);
 * We then will be able to get clubId by using
 * clubId: clubAuthContext.clubId
 */
//
export const ClubAuthContext = createContext({
	isClubLoggedIn: false,
	clubId: null,
	clubLogin: () => {},
	clubLogout: () => {}
});

export const UserAuthContext = createContext({
	isUserLoggedIn: false,
	userId: null,
	userLogin: () => {},
	userLogout: () => {}
});
