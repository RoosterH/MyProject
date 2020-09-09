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
// const EventFormBuilder = React.lazy(() =>
// 	import('./event/pages/EventFormBuilder')
// );
const FormBuilder = React.lazy(() =>
	import('./event/components/FormBuilder')
);
const ClubDashboardToolbar = React.lazy(() =>
	import('./clubDashboard/pages/ClubDashboardToolbar')
);
const ClubManager = React.lazy(() =>
	import('./clubDashboard/components/ClubManager')
);
const EventManager = React.lazy(() =>
	import('./clubDashboard/components/EventManager')
);
const NewEventManager = React.lazy(() =>
	import('./clubDashboard/components/NewEventManager')
);
const EditEventManager = React.lazy(() =>
	import('./clubDashboard/components/EditEventManager')
);
const EditEventSelector = React.lazy(() =>
	import('./clubDashboard/components/EditEventSelector')
);
const Events = React.lazy(() => import('./events/pages/Events'));
const EventPhotos = React.lazy(() =>
	import('./event/pages/EventPhotos')
);
const EventRegistration = React.lazy(() =>
	import('./event/pages/EventRegistration')
);
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
const Car = React.lazy(() => import('./cars/pages/Car'));
const UpdateCar = React.lazy(() => import('./cars/pages/UpdateCar'));

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
		userImage,
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
				{/* to pass props via Link, we have to assign component={Event} here */}
				<Route path="/events/:id" component={Event} exact />
				<Route path="/clubs/clubManager/" exact>
					<ClubManager />
				</Route>
				<Route path="/clubs/eventManager/" exact>
					<EventManager />
				</Route>
				<Route path="/clubs/newEventManager/" exact>
					<NewEventManager />
				</Route>
				<Route path="/clubs/editEventSelector/:clubId" exact>
					<EditEventSelector />
				</Route>
				<Route path="/clubs/editEventManager/" exact>
					<EditEventManager />
				</Route>
				{/* <Route path="/events/formbuilder/:id" exact>
					<EventFormBuilder />
				</Route> */}
				<Route path="/events/form/:id" exact>
					<FormBuilder />
				</Route>
				<Route path="/clubs/events/new" exact>
					<NewEvent />
				</Route>
				<Route path="/clubs/events/photos" exact>
					<EventPhotos />
				</Route>
				<Route path="/clubs/events/registration" exact>
					<EventRegistration />
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
				<Route path="/users/cars/update/:carId" exact>
					<UpdateCar />
				</Route>
				<Route path="/users/cars/:carId" exact>
					<Car />
				</Route>
				<Route path="/events/:id" component={Event} exact />
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
				<Route path="/events/:id" component={Event} exact />
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
				<Route path="/clubs/clubManager" exact>
					<ClubManager />
				</Route>
				<Route path="/clubs/eventManager" exact>
					<EventManager />
				</Route>
				<Route path="/clubs/newEventManager/" exact>
					<NewEventManager />
				</Route>
				<Route path="/clubs/events/new" exact>
					<NewEvent />
				</Route>
				<Route path="/clubs/events/photos" exact>
					<EventPhotos />
				</Route>
				<Route path="/clubs/events/registration" exact>
					<EventRegistration />
				</Route>
				<Route path="/clubs/editEventSelector/:clubId" exact>
					<EditEventSelector />
				</Route>
				<Route path="/clubs/editEventManager/" exact>
					<EditEventManager />
				</Route>
				{/* <Redirect strict from="/clubs/events/new" to="/clubs/auth" /> */}

				{/* Very import to keep sequence of the following 2 routes. Change the sequence will cause
				    page refreshing not working properly.
					1. Route is for refreshing page
					2. Redirect is for club not logged in
				*/}
				{/* <Route path="/events/formbuilder/:id" exact>
					<EventFormBuilder />
				</Route> */}
				<Route path="/events/form/:id" exact>
					<FormBuilder />
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
				<Route path="/users/cars/update/:carId" exact>
					<UpdateCar />
				</Route>
				<Route path="/users/cars/:carId" exact>
					<Car />
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
					userImage: userImage,
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
								{clubToken && <ClubDashboardToolbar />}
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
