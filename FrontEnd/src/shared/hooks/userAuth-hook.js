import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';

let logoutTimer;
export const useUserAuth = () => {
	// userAuthContext state
	const [userToken, setUserToken] = useState(null);
	const [userTokenExpDate, setUserTokenExpDate] = useState();
	const [userId, setUserId] = useState(null);
	const [userName, setUserName] = useState(null);
	const [redirectURL, setURL] = useState(null);

	// define callbacks of UserAuthContext, useCallBack will never be re-created
	// so there won't be any infinite loop; otherwise when the page renders, the function
	// will be re-created each render cause infinite loop.
	const userLogin = useCallback(
		(uid, uname, utoken, expirationDate) => {
			setUserToken(utoken);
			setUserId(uid);
			setUserName(uname);
			// jwt token expires in 1 day
			const tokenExp =
				expirationDate ||
				moment(moment().add(1, 'days'), moment.ISO_8601);
			// updating token expiration date
			setUserTokenExpDate(tokenExp);
			// localStorage is a global js API for browser localStorage.
			// 'userData' is the key
			localStorage.setItem(
				'userData',
				JSON.stringify({
					userId: uid,
					userToken: utoken,
					expiration: tokenExp
				})
			);
		},
		[]
	);

	const userLogout = useCallback(() => {
		setUserToken(null);
		setUserId(null);
		setUserName(null);
		// remove token from storage
		localStorage.removeItem('userData');
		// reset userTokenExpDate; otherwise won't be able to login after
		// token expires
		setUserTokenExpDate(null);
	}, []);

	// Auto login
	useEffect(() => {
		const storageData = JSON.parse(localStorage.getItem('userData'));
		if (
			storageData &&
			storageData.userToken &&
			moment(storageData.expiration) > moment()
		) {
			userLogin(
				storageData.userId,
				null,
				storageData.userToken,
				moment(storageData.expiration)
			);
		}
	}, [userLogin]);

	// Auto logout
	// dependecies: userToken state changes when userLogin() or userLogout()
	useEffect(() => {
		if (userToken && userTokenExpDate) {
			const remainingTime = moment(userTokenExpDate) - moment();
			// if timeout gets triggered meaing userToken expires, userLogout will be called
			logoutTimer = setTimeout(userLogout, remainingTime);
		} else {
			clearTimeout(logoutTimer);
		}
	}, [userToken, userLogout, userTokenExpDate]);

	const setRedirectURL = useCallback(url => {
		setURL(url);
	}, []);

	return {
		userToken,
		userLogin,
		userLogout,
		userId,
		userName,
		redirectURL,
		setRedirectURL
	};
};
