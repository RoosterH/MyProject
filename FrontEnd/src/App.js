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

import {
	ClubAuthContext,
	UserAuthContext
} from './shared/context/auth-context';

const App = () => {
	// club context
	const [isClubLoggedIn, setIsClubLoggedIn] = useState(false);
	const [clubId, setClubId] = useState(false);

	const clubLogin = useCallback(cid => {
		setIsClubLoggedIn(true);
		setClubId(cid);
	}, []);
	const clubLogout = useCallback(() => {
		setIsClubLoggedIn(false);
		setClubId(null);
	}, []);

	// const [clubId, setClubIdHandler] = useState('');
	// const setClubId = useCallback(id => {
	// 	setClubIdHandler(id);
	// }, []);

	// user context
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [userId, setUserId] = useState(false);

	const userLogin = useCallback(uid => {
		setIsUserLoggedIn(true);
		setUserId(uid);
	}, []);
	const userLogout = useCallback(() => {
		setIsUserLoggedIn(false);
		setUserId(null);
	}, []);

	let routes;

	if (isClubLoggedIn) {
		routes = (
			<Switch>
				<Route path="/" exact>
					<Clubs />
					<Users />
					<Events />
				</Route>
				<Route path={'/events/club/:clubId'} exact>
					<ClubEvents />
				</Route>
				<Route path={'/events/:id'} exact>
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
				<Redirect to="/" />
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
				<Route path="/events/" exact>
					<Events />
				</Route>
				<Route path="/events/:id" exact>
					<Event />
				</Route>
				{/* <Route path={'/events/club/:clubId'} exact>
					<ClubEvents />
				</Route> */}
				<Route path="/clubs/auth" exact>
					<ClubAuth />
				</Route>
				<Route path="/clubs/signup" exact></Route>
				<Route path="/users/auth" exact>
					<UserAuth />
				</Route>
				<Route path="/error" exact>
					<Error />
				</Route>
				<Redirect to="/" />
			</Switch>
		);
	}
	return (
		<ClubAuthContext.Provider
			value={{
				isClubLoggedIn: isClubLoggedIn,
				clubLogin: clubLogin,
				clubLogout: clubLogout,
				clubId: clubId
			}}>
			<UserAuthContext.Provider
				value={{
					isUserLoggedIn: isUserLoggedIn,
					userLogin: userLogin,
					userLogout: userLogout,
					userId: userId
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
