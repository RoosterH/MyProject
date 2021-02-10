import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';

let logoutTimer;
export const useUserAuth = () => {
	// userAuthContext state
	const [userToken, setUserToken] = useState(null);
	const [userTokenExpDate, setUserTokenExpDate] = useState();
	const [userId, setUserId] = useState(null);
	const [userName, setUserName] = useState(null);
	const [userEntries, setUserEntries] = useState(null);
	const [userRedirectURL, setURL] = useState(null);
	const [userImage, setUserImage] = useState(null);
	// keep track of user account status complete
	const [userAccountStatus, setUserAccountStatus] = useState(false);

	// define callbacks of UserAuthContext, useCallBack will never be re-created
	// so there won't be any infinite loop; otherwise when the page renders, the function
	// will be re-created each render cause infinite loop.
	const userLogin = useCallback(
		(
			uid,
			uname,
			utoken,
			expirationDate,
			uentries,
			uimage,
			completed
		) => {
			setUserToken(utoken);
			setUserId(uid);
			setUserName(uname);
			setUserEntries(uentries);
			setUserImage(uimage);
			setUserAccountStatus(completed);

			// jwt token expires in 7 day
			const tokenExp =
				expirationDate ||
				moment(moment().add(7, 'days'), moment.ISO_8601);
			// updating token expiration date
			setUserTokenExpDate(tokenExp);
			// localStorage is a global js API for browser localStorage.
			// 'userData' is the key
			localStorage.setItem(
				'userData',
				JSON.stringify({
					userId: uid,
					userName: uname,
					userToken: utoken,
					expiration: tokenExp,
					userEntries: uentries,
					userImage: uimage,
					userAccountStatus: completed
				})
			);
		},
		[]
	);

	const userLogout = useCallback(() => {
		setUserToken(null);
		setUserId(null);
		setUserName(null);
		setUserEntries(null);
		setUserImage(null);
		// remove token from storage
		localStorage.removeItem('userData');
		localStorage.removeItem('garages');
		localStorage.removeItem('eventData');
		localStorage.removeItem('eventForm');
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
			// write back data to localStorage
			userLogin(
				storageData.userId,
				storageData.userName,
				storageData.userToken,
				moment(storageData.expiration),
				storageData.userEntries,
				storageData.userImage,
				storageData.userAccountStatus
			);
		}
	}, [userLogin]);

	// Auto logout
	// dependecies: userToken state changes when userLogin() or userLogout()
	useEffect(() => {
		if (userToken && userTokenExpDate) {
			const remainingTime = moment(userTokenExpDate) - moment();
			// if timeout gets triggered meaing userToken expires, userLogout will e called
			logoutTimer = setTimeout(userLogout, remainingTime);
		} else {
			clearTimeout(logoutTimer);
		}
	}, [userToken, userLogout, userTokenExpDate]);

	const setUserRedirectURL = useCallback(url => {
		setURL(url);
	}, []);

	const setUserAccountStatusHook = useCallback(val => {
		setUserAccountStatus(val);

		// Save value to localStorage so we can read the value from it when page gets refreshed.
		// Otherwise, refresh will erase userAuthContext data.
		let userData = JSON.parse(localStorage.getItem('userData'));
		userData.userAccountStatus = val;
		localStorage.setItem('userData', JSON.stringify(userData));
	}, []);

	const removeUserEntry = useCallback(entryId => {
		let entries;
		entries = userEntries.filter(entry => entry.id !== entryId);
		setUserEntries(entries);

		// Save value to localStorage so we can read the value from it when page gets refreshed.
		// Otherwise, refresh will erase userAuthContext data.
		let userData = JSON.parse(localStorage.getItem('userData'));
		userData.userEntries = entries;
		localStorage.setItem('userData', JSON.stringify(userData));
	});
	return {
		userToken,
		userLogin,
		userLogout,
		userId,
		userName,
		userEntries,
		userImage,
		userRedirectURL,
		userAccountStatus,
		setUserRedirectURL,
		setUserAccountStatusHook,
		removeUserEntry
	};
};
