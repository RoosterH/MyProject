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
 * clubId = clubAuthContext.clubId
 * insideForm: is used to indicate current page is inside a form (new form or form builder).
 *     We want to disable "logout" if we are inside of a form to avoid conflict between
 *     leaving page prompt and logging out race condition
 */
//
export const ClubAuthContext = createContext({
	isClubLoggedIn: false,
	clubToken: null,
	clubId: null,
	clubName: null,
	insideForm: false,
	clubLogin: () => {},
	clubLogout: () => {},
	setIsInsideForm: () => {},
	clubRedirectURL: null,
	setClubRedirectURL: () => {}
});

export const UserAuthContext = createContext({
	isUserLoggedIn: false,
	userToken: null,
	userId: null,
	userName: null,
	userEntries: null,
	userImage: null,
	userRedirectURL: null,
	userAccountStatus: false,
	userLogin: () => {},
	userLogout: () => {},
	setUserRedirectURL: () => {},
	setUserAccountStatusHook: () => {},
	removeUserEntry: () => {}
});
