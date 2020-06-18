import React, { useState, useCallback } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';

import Clubs from './clubs/pages/Clubs';
import ClubAuth from './clubs/pages/ClubsAuth';
import ClubEvents from './clubs/pages/ClubEvents';
import ClubSignup from './clubs/pages/ClubSignup';
import Error from './shared/util/error';
import Event from './event/pages/Event';
import Events from './events/pages/Events';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import NewEvent from './event/pages/NewEvent';
import Users from './users/pages/Users';
import UpdateEvent from './event/pages/UpdateEvent';

import {
	ClubAuthContext,
	UserAuthContext
} from './shared/context/auth-context';

const App = () => {
	// club context
	const [isClubLoggedIn, setIsClubLoggedIn] = useState(false);
	const clubLogin = useCallback(() => {
		setIsClubLoggedIn(true);
	}, []);
	const clubLogout = useCallback(() => {
		setIsClubLoggedIn(false);
	}, []);

	const [clubId, setClubIdHandler] = useState('');
	const setClubId = useCallback(id => {
		setClubIdHandler(id);
		console.log('App id = ', id);
	}, []);

	// user context
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const userLogin = useCallback(() => {
		setIsUserLoggedIn(true);
	}, []);
	const userLogout = useCallback(() => {
		setIsUserLoggedIn(false);
	}, []);

	let routes;

	if (isClubLoggedIn) {
		routes = (
			<Switch>
				<Route path="/" exact>
					<Clubs />
					{/* <Users />
					<Events /> */}
				</Route>
				<Route path={'/:cid/events'} exact>
					<ClubEvents />
				</Route>
				<Route path={'/events/:id'} exact>
					<Event />
				</Route>
				<Route path="/:cid/events/new" exact>
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
				<Route path="/clubs/auth" exact>
					<ClubAuth />
				</Route>
				{/* <Route path="/clubs/new" exact>
					<NewClub />
				</Route> */}
				<Route path="/clubs/signup" exact>
					<ClubSignup />
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
				clubId: clubId,
				clubLogin: clubLogin,
				clubLogout: clubLogout,
				setClubId: setClubId
			}}>
			<UserAuthContext.Provider
				value={{
					isUserLoggedIn: isUserLoggedIn,
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
