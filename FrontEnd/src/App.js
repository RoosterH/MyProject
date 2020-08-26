import React, { Suspense } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';

import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import {
	ClubAuthContext,
	UserAuthContext
} from './shared/context/auth-context';
import { useClubAuth } from './shared/hooks/clubAuth-hook';
import { useUserAuth } from './shared/hooks/userAuth-hook';

import { FormContext } from './shared/context/form-context';
import { useFormHook } from './shared/hooks/form-hook';

import './shared/css/Auth.css';

// split codes using lazy load
// instead of import everything at once, we will split them so codes will built into
// different chunks. When users open up the app, it will only load whatever it's needed.
// club section
const Clubs = React.lazy(() => import('./clubs/pages/Clubs'));
const ClubAuth = React.lazy(() => import('./clubs/pages/ClubAuth'));
const ClubEvents = React.lazy(() =>
	import('./clubs/pages/ClubEvents')
);
const Error = React.lazy(() => import('./shared/utils/error'));
// event section
const Event = React.lazy(() => import('./event/pages/Event'));
const EventForm = React.lazy(() => import('./event/pages/EventForm'));
const EventFormBuilder = React.lazy(() =>
	import('./event/pages/EventFormBuilder')
);
const Events = React.lazy(() => import('./events/pages/Events'));
const NewEvent = React.lazy(() => import('./event/pages/NewEvent'));
const UpdateEvent = React.lazy(() =>
	import('./event/pages/UpdateEvent')
);

// user section
// const Users = React.lazy(() => import('./users/pages/Users'));
const UserAuth = React.lazy(() => import('./users/pages/UserAuth'));
const UserEvents = React.lazy(() =>
	import('./users/pages/UserEvents')
);
const UserGarage = React.lazy(() =>
	import('./users/pages/UserGarage')
);
const NewCar = React.lazy(() => import('./cars/pages/NewCar'));
// const CarItem = React.lazy(() => import('./cars/components/CarItem'));

const App = () => {
	const {
		clubToken,
		clubLogin,
		clubLogout,
		clubId,
		clubName,
		clubRedirectURL,
		setClubRedirectURL
	} = useClubAuth();

	const {
		userToken,
		userLogin,
		userLogout,
		userId,
		userName,
		userEntries,
		userRedirectURL,
		setUserRedirectURL
	} = useUserAuth();

	const { isInsideForm, setIsInsideForm } = useFormHook();

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
				<Route path="/events/formbuilder/:id" exact>
					<EventFormBuilder />
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
	} else if (userToken) {
		routes = (
			<Switch>
				<Route path="/" exact>
					<Events />
				</Route>
				<Route path="/users/events/:userId" exact>
					<UserEvents />
				</Route>
				<Route path="/users/garage/:userId" exact>
					<UserGarage />
				</Route>
				<Route path="/users/cars/new" exact>
					<NewCar />
				</Route>
				<Route path="/users/cars/:carId" exact>
					{/* <CarItem /> */}
				</Route>
				<Route path="/events/:id" exact>
					<Event />
				</Route>
				<Route path="/events/form/:id" exact>
					<EventForm />
				</Route>
				<Route path="/error" exact>
					<Error />
				</Route>
				<Redirect to="/error" />
			</Switch>
		);
	} else {
		// club and user not logged in
		routes = (
			<Switch>
				{/* if Routes failed authentication redirect to auth pages */}
				{/* <Redirect strict from="/events/update/:id" to="/clubs/auth" /> */}

				<Route path="/" exact>
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
				<Route path="/events/update/:id" exact>
					<UpdateEvent />
				</Route>
				<Route path="/clubs/auth" exact>
					<ClubAuth />
				</Route>
				<Route path="/users/auth" exact>
					<UserAuth />
				</Route>

				{/* The following section is for page refresh. Without it, refresh will not happen */}
				{/* Very import to keep sequence of the following 2 routes. Change the sequence will cause
				    page refreshing not working properly.
					1. Route is for refreshing page
					2. Redirect is for club not logged in
				*/}
				<Route path="/clubs/events/new" exact>
					<NewEvent />
				</Route>
				{/* <Redirect strict from="/clubs/events/new" to="/clubs/auth" /> */}

				{/* Very import to keep sequence of the following 2 routes. Change the sequence will cause
				    page refreshing not working properly.
					1. Route is for refreshing page
					2. Redirect is for club not logged in
				*/}
				<Route path="/events/formbuilder/:id" exact>
					<EventFormBuilder />
				</Route>
				{/* <Redirect
					strict
					from="/events/formbuilder/:id"
					to="/clubs/auth"
				/> */}

				<Route path="/events/form/:id" exact>
					<EventForm />
				</Route>

				<Route path="/users/events/:userId" exact>
					<UserEvents />
				</Route>

				<Route path="/users/garage/:userId" exact>
					<UserGarage />
				</Route>
				<Route path="/users/cars/new" exact>
					<NewCar />
				</Route>
				{/* End of page refresh section */}

				<Route path="/error" exact>
					<Error />
				</Route>
				<Redirect to="/error" />
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
				clubLogout: clubLogout,
				clubRedirectURL: clubRedirectURL,
				setClubRedirectURL: setClubRedirectURL
			}}>
			<UserAuthContext.Provider
				value={{
					isUserLoggedIn: !!userToken,
					userToken: userToken,
					userId: userId,
					userName: userName,
					userEntries: userEntries,
					userRedirectURL: userRedirectURL,
					userLogin: userLogin,
					userLogout: userLogout,
					setUserRedirectURL: setUserRedirectURL
				}}>
				<FormContext.Provider
					value={{
						isInsideForm: isInsideForm,
						setIsInsideForm: setIsInsideForm
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
				</FormContext.Provider>
			</UserAuthContext.Provider>
		</ClubAuthContext.Provider>
	);
};

export default App;
