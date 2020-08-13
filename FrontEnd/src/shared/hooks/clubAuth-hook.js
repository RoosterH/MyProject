import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';

let logoutTimer;
export const useClubAuth = () => {
	// clubAuthContext state
	const [clubToken, setClubToken] = useState(null);
	const [clubTokenExpDate, setClubTokenExpDate] = useState();
	const [clubId, setClubId] = useState(null);
	const [clubName, setClubName] = useState(null);
	const [isInsideForm, setInForm] = useState(false);
	const [clubRedirectURL, setURL] = useState(null);

	// define callbacks of ClubAuthContext, useCallBack will never be re-created
	// so there won't be any infinite loop; otherwise when the page renders, the function
	// will be re-created each render cause infinite loop.
	const clubLogin = useCallback(
		(cid, cname, ctoken, expirationDate) => {
			setClubToken(ctoken);
			setClubId(cid);
			setClubName(cname);
			// jwt token expires in 7 day
			// max setTimeout is (2147483647 ms) or 24.855 days.
			const tokenExp =
				expirationDate ||
				moment(moment().add(7, 'days'), moment.ISO_8601);
			// updating token expiration date
			setClubTokenExpDate(tokenExp);
			// localStorage is a global js API for browser localStorage.
			// 'userData' is the key
			localStorage.setItem(
				'userData',
				JSON.stringify({
					clubId: cid,
					clubToken: ctoken,
					expiration: tokenExp
				})
			);
		},
		[]
	);

	const clubLogout = useCallback(() => {
		setClubToken(null);
		setClubId(null);
		setClubName(null);
		// remove token from storage
		localStorage.removeItem('userData');
		// reset clubTokenExpDate; otherwise won't be able to login after
		// token expires
		setClubTokenExpDate(null);
	}, []);

	const setIsInsideForm = useCallback(val => {
		setInForm(val);
	}, []);

	// Auto login
	useEffect(() => {
		const storageData = JSON.parse(localStorage.getItem('userData'));
		if (
			storageData &&
			storageData.clubToken &&
			moment(storageData.expiration) > moment()
		) {
			clubLogin(
				storageData.clubId,
				null,
				storageData.clubToken,
				moment(storageData.expiration)
			);
		}
	}, [clubLogin]);

	// Auto logout
	// dependecies: clubToken state changes when clubLogin() or clubLogout()
	useEffect(() => {
		if (clubToken && clubTokenExpDate) {
			const remainingTime = moment(clubTokenExpDate) - moment();
			// if timeout gets triggered meaing clubToken expires, clubLogout will be called
			logoutTimer = setTimeout(clubLogout, remainingTime);
		} else {
			clearTimeout(logoutTimer);
		}
	}, [clubToken, clubLogout, clubTokenExpDate]);

	const setClubRedirectURL = useCallback(url => {
		setURL(url);
	}, []);

	return {
		clubToken,
		clubLogin,
		clubLogout,
		clubId,
		clubName,
		isInsideForm,
		setIsInsideForm,
		clubRedirectURL,
		setClubRedirectURL
	};
};
