import React, { Suspense, useState, useCallback } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';

// import Clubs from './clubs/pages/Clubs';
// import ClubAuth from './clubs/pages/ClubAuth';
// import ClubEvents from './clubs/pages/ClubEvents';
// import Error from './shared/util/error';
// import Event from './event/pages/Event';
// import Events from './events/pages/Events';
// import NewEvent from './event/pages/NewEvent';
// import Users from './users/pages/Users';
// import UserAuth from './users/pages/UsersAuth';
// import UpdateEvent from './event/pages/UpdateEvent';

import MainNavigation from './shared/components/Navigation/MainNavigation';
import { useClubAuth } from './shared/hooks/clubAuth-hook';

import {
	ClubAuthContext,
	UserAuthContext
} from './shared/context/auth-context';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// split codes using lazy load
const Clubs = React.lazy(() => import('./clubs/pages/Clubs'));
const ClubAuth = React.lazy(() => import('./clubs/pages/ClubAuth'));
const ClubEvents = React.lazy(() =>
	import('./clubs/pages/ClubEvents')
);
const Error = React.lazy(() => import('./shared/util/error'));
const Event = React.lazy(() => import('./event/pages/Event'));
const Events = React.lazy(() => import('./events/pages/Events'));
const NewEvent = React.lazy(() => import('./event/pages/NewEvent'));
const Users = React.lazy(() => import('./users/pages/Users'));
const UserAuth = React.lazy(() => import('./users/pages/UsersAuth'));
const UpdateEvent = React.lazy(() =>
	import('./event/pages/UpdateEvent')
);

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
					<main>
						{/* Suspense is for splitting codes */}
						<Suspense
							fallback={
								<div className="center">
									<LoadingSpinner />
								</div>
							}>
							{routes}
						</Suspense>
					</main>
				</Router>
			</UserAuthContext.Provider>
		</ClubAuthContext.Provider>
	);
};

export default App;
