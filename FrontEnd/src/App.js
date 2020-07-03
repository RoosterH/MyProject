import React, { useState, useCallback } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';

import Clubs from './clubs/pages/Clubs';
import ClubAuth from './clubs/pages/ClubAuth';
import ClubEvents from './clubs/pages/ClubEvents';
import Error from './shared/util/error';
import Event from './event/pages/Event';
import Events from './events/pages/Events';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import NewEvent from './event/pages/NewEvent';
import Users from './users/pages/Users';
import UserAuth from './users/pages/UsersAuth';
import UpdateEvent from './event/pages/UpdateEvent';
import { useClubAuth } from './shared/hooks/clubAuth-hook';

import {
	ClubAuthContext,
	UserAuthContext
} from './shared/context/auth-context';

const App = () => {
	const {
		clubToken,
		clubLogin,
		clubLogout,
		clubId,
		clubName
	} = useClubAuth();

	// userAuthContext state
	const [userToken, setUserToken] = useState(null);
	const [userId, setUserId] = useState(null);
	const [userName, setUserName] = useState(null);

	// define callbacks of userAuthContext
	const userLogin = useCallback((uid, uname, utoken) => {
		setUserToken(utoken);
		setUserId(uid);
		setUserName(uname);
	}, []);
	const userLogout = useCallback(() => {
		setUserToken(null);
		setUserId(null);
	}, []);

	let routes;
	if (clubToken) {
		routes = (
			<Switch>
				<Route path="/" exact>
					<Clubs />
					{/* <Events /> */}
				</Route>
				<Route path="/events/club/:clubId" exact>
					<ClubEvents />
				</Route>
				<Route path="/events/:id" exact>
					<Event />
				</Route>
				<Route path="/clubs/events/new" exact>
					<NewEvent />
				</Route>
				<Route path="/events/update/:id" exact>
					<UpdateEvent />
				</Route>
				<Route path="/error" exact>
					<Error />
				</Route>
				<Redirect to="/error" />
			</Switch>
		);
	} else {
		// club not logged in
		routes = (
			<Switch>
				<Route path="/" exact>
					<Clubs />
					<Users />
					<Events />
				</Route>
				<Route path="/events/update/error" exact>
					{/* this is for re-direction when sending a request to the url that needs authentication */}
					<Error />
				</Route>
				<Route path="/events/" exact>
					<Events />
				</Route>
				<Route path="/events/:id" exact>
					<Event />
				</Route>
				<Route path="/events/club/:clubId" exact>
					<ClubEvents />
				</Route>
				<Route path="/clubs/auth" exact>
					<ClubAuth />
				</Route>
				<Route path="/users/auth" exact>
					<UserAuth />
				</Route>
				<Route path="/error" exact>
					<Error />
				</Route>
				<Redirect to="error" />
			</Switch>
		);
	}
	return (
		<ClubAuthContext.Provider
			value={{
				isClubLoggedIn: !!clubToken, // !!null = true
				clubToken: clubToken,
				clubId: clubId,
				clubName: clubName,
				clubLogin: clubLogin,
				clubLogout: clubLogout
			}}>
			<UserAuthContext.Provider
				value={{
					isUserLoggedIn: !!userToken,
					userToken: userToken,
					userId: userId,
					userName: userName,
					userLogin: userLogin,
					userLogout: userLogout
				}}>
				<Router>
					<MainNavigation />
					{/* main is defiend in /shared/components/Navigation/MainHeader.css */}
					<main>{routes}</main>
				</Router>
			</UserAuthContext.Provider>
		</ClubAuthContext.Provider>
	);
};

export default App;
