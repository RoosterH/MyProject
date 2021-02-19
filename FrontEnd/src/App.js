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
import RedirectExternalURL from './shared/hooks/redirectExternalURL';

import './shared/css/Auth.css';

// split codes using lazy load
// instead of import everything at once, we will split them so codes will built into
// different chunks. When users open up the app, it will only load whatever it's needed.
// club section
const MainPage = React.lazy(() => import('./main/pages/MainPage'));
const Clubs = React.lazy(() => import('./clubs/pages/Clubs'));
const ClubAuth = React.lazy(() => import('./clubs/pages/ClubAuth'));
const ClubEvents = React.lazy(() =>
	import('./clubs/pages/ClubEvents')
);
const Error = React.lazy(() => import('./shared/utils/error'));
// event section
const Event = React.lazy(() => import('./event/pages/Event'));
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
const EditEntryManager = React.lazy(() =>
	import('./entryDashboard/pages/EditEntryManager')
);

const NewEntryManager = React.lazy(() =>
	import('./entryDashboard/pages/NewEntryManager')
);
const NewEventManager = React.lazy(() =>
	import('./clubDashboard/components/NewEventManager')
);
const EditEventManager = React.lazy(() =>
	import('./clubDashboard/components/EditEventManager')
);
const RegistrationManager = React.lazy(() =>
	import('./clubDashboard/components/RegistrationManager')
);
const EventReportSelector = React.lazy(() =>
	import('./clubDashboard/components/EventReportSelector')
);
const PaymentCenterSelector = React.lazy(() =>
	import('./clubDashboard/components/PaymentCenterSelector')
);
const RefundCenterSelector = React.lazy(() =>
	import('./clubDashboard/components/RefundCenterSelector')
);
const DataCenterSelector = React.lazy(() =>
	import('./clubDashboard/components/DataCenterSelector')
);
const EditEventSelector = React.lazy(() =>
	import('./clubDashboard/components/EditEventSelector')
);
const EntryListForUsers = React.lazy(() =>
	import('./clubDashboard/components/EntryListForUsers')
);
const MaterialTableEntryReport = React.lazy(() =>
	import('./clubDashboard/components/MaterialTableEntryReport')
);

const Events = React.lazy(() => import('./events/pages/Events'));
const EventPhotos = React.lazy(() =>
	import('./event/pages/EventPhotos')
);
const EventRegistration = React.lazy(() =>
	import('./event/pages/EventRegistration')
);
const NewEvent = React.lazy(() => import('./event/pages/NewEvent'));
const ViewEventSelector = React.lazy(() =>
	import('./clubDashboard/components/ViewEventSelector')
);
const RunGroupManagerSelector = React.lazy(() =>
	import('./clubDashboard/components/RunGroupManagerSelector')
);
const UpdateEvent = React.lazy(() =>
	import('./event/pages/UpdateEvent')
);
const ClubProfileViewer = React.lazy(() =>
	import('./clubDashboard/components/ClubProfileViewer')
);
const ClubProfileManager = React.lazy(() =>
	import('./clubDashboard/components/ClubProfileManager')
);
const ClubPhotos = React.lazy(() =>
	import('./clubDashboard/components/ClubPhotos')
);
const ClubAccountManager = React.lazy(() =>
	import('./clubDashboard/components/ClubAccountManager')
);
const ClubCommunicationCenter = React.lazy(() =>
	import('./clubDashboard/components/CommunicationCenter')
);
const CommsMemberCenter = React.lazy(() =>
	import('./clubDashboard/components/CommsMemberCenter')
);
const CommsEventSelector = React.lazy(() =>
	import('./clubDashboard/components/CommsEventSelector')
);
const CommsEmailArchive = React.lazy(() =>
	import('./clubDashboard/components/CommsEmailArchive')
);
const ClubMemberManager = React.lazy(() =>
	import('./clubDashboard/components/ClubMemberManager')
);
const ClubCredential = React.lazy(() =>
	import('./clubDashboard/components/ClubCredential')
);
const ClubSES = React.lazy(() =>
	import('./clubDashboard/components/ClubSES')
);
const ClubPayment = React.lazy(() =>
	import('./clubDashboard/components/ClubPayment')
);
const ClubSettings = React.lazy(() =>
	import('./clubDashboard/components/ClubSettings')
);
const ClubStripe = React.lazy(() =>
	import('./clubDashboard/components/ClubStripe')
);
const ClubStripeConnect = React.lazy(() =>
	import('./clubDashboard/components/ClubStripeConnect')
);
const ClubProfileViewerForUsers = React.lazy(() =>
	import('./users/components/ClubProfileViewerForUsers')
);
const ClubEventsForUsers = React.lazy(() =>
	import('./users/components/ClubEventsForUsers')
);
const ClubConfirmation = React.lazy(() =>
	import('./clubs/pages/ClubConfirmation')
);
const ClubVerification = React.lazy(() =>
	import('./clubs/pages/ClubVerification')
);
const ClubVerificationRequest = React.lazy(() =>
	import('./clubs/pages/ClubVerificationRequest')
);
const ClubMemberList = React.lazy(() =>
	import('./clubDashboard/components/ClubMemberList')
);
const ClubCarNumbers = React.lazy(() =>
	import('./clubDashboard/components/ClubCarNumbers')
);
const ClubAvailableCarNumbers = React.lazy(() =>
	import('./clubDashboard/components/ClubAvailableCarNumbers')
);
// user section
// const Users = React.lazy(() => import('./users/pages/Users'));
const UserAuth = React.lazy(() => import('./users/pages/UserAuth'));
const UserEvents = React.lazy(() =>
	import('./users/pages/UserEvents')
);
const UserGarageWrapper = React.lazy(() =>
	import('./users/pages/UserGarageWrapper')
);
const NewCar = React.lazy(() => import('./cars/pages/NewCar'));
const Car = React.lazy(() => import('./cars/pages/Car'));
const UpdateCar = React.lazy(() => import('./cars/pages/UpdateCar'));
const UserAccount = React.lazy(() =>
	import('./users/pages/UserAccount')
);
const UserConfirmation = React.lazy(() =>
	import('./users/pages/UserConfirmation')
);
const UserVerification = React.lazy(() =>
	import('./users/pages/UserVerification')
);
const UserVerificationRequest = React.lazy(() =>
	import('./users/pages/UserVerificationRequest')
);
const UserCredential = React.lazy(() =>
	import('./users/pages/UserCredential')
);
const UserRegisterCarNumber = React.lazy(() =>
	import('./users/pages/UserRegisterCarNumber')
);
const VideoChannel = React.lazy(() =>
	import('./videoChannel/pages/VideoChannel')
);

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
		setUserRedirectURL,
		userAccountStatus,
		setUserAccountStatusHook,
		removeUserEntry
	} = useUserAuth();

	const { isInsideForm, setIsInsideForm } = useFormHook();

	let routes;
	if (clubToken) {
		routes = (
			<Switch>
				{/* club root page should be <ClubManager/> */}
				<Route path="/" exact>
					<ClubManager />
				</Route>
				<Route path="/events/club/:clubId" exact>
					<ClubEvents />
				</Route>
				{/* to pass props via Link, we have to assign component={Event} here */}
				<Route path="/events/:id" component={Event} exact />
				<Route path="/clubs/clubManager/" exact>
					<ClubManager />
				</Route>
				<Route path="/clubs/profile/:clubId" exact>
					<ClubProfileViewer />
				</Route>
				<Route path="/clubs/profileManager/:clubId" exact>
					<ClubProfileManager />
				</Route>
				<Route path="/clubs/photos/:clubId" exact>
					<ClubPhotos />
				</Route>
				<Route path="/clubs/accountManager/:clubId" exact>
					<ClubAccountManager />
				</Route>
				<Route path="/clubs/commsCenter/" exact>
					<ClubCommunicationCenter />
				</Route>
				<Route path="/clubs/commsMemberCenter/:clubId" exact>
					<CommsMemberCenter />
				</Route>
				<Route path="/clubs/commsEventSelector/:clubId" exact>
					<CommsEventSelector />
				</Route>
				<Route path="/clubs/commsEmailArchive/:clubId" exact>
					<CommsEmailArchive />
				</Route>
				<Route path="/clubs/memberManager" exact>
					<ClubMemberManager />
				</Route>
				<Route path="/clubs/credential/:clubId" exact>
					<ClubCredential />
				</Route>
				<Route path="/clubs/ses/:clubId" exact>
					<ClubSES />
				</Route>
				<Route path="/clubs/payment/:clubId" exact>
					<ClubPayment />
				</Route>
				<Route path="/clubs/clubSettings/:clubId" exact>
					<ClubSettings />
				</Route>
				<Route path="/clubs/stripe/:clubId" exact>
					<ClubStripe />
				</Route>
				<Route path="/clubs/stripeconnect/:clubId" exact>
					<ClubStripeConnect />
				</Route>
				<Route path="/clubs/memberList/:clubId" exact>
					<ClubMemberList />
				</Route>
				<Route path="/clubs/carNumbers/:clubId" exact>
					<ClubCarNumbers />
				</Route>
				<Route path="/clubs/availCarNumbers/:clubId" exact>
					<ClubAvailableCarNumbers />
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
				<Route path="/clubs/registrationManager/" exact>
					<RegistrationManager />
				</Route>
				<Route path="/clubs/eventReportSelector/:clubId" exact>
					<EventReportSelector />
				</Route>
				<Route path="/clubs/viewEventSelector/:clubId" exact>
					<ViewEventSelector />
				</Route>
				<Route path="/clubs/runGroupManagerSelector/:clubId" exact>
					<RunGroupManagerSelector />
				</Route>
				<Route path="/clubs/paymentCenterSelector/:clubId" exact>
					<PaymentCenterSelector />
				</Route>
				<Route path="/clubs/refundCenterSelector/:clubId" exact>
					<RefundCenterSelector />
				</Route>
				<Route path="/clubs/dataCenterSelector/:clubId" exact>
					<DataCenterSelector />
				</Route>
				<Route path="/events/formbuilder/:id" exact>
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
				<Route path="/stripeConnect/" exact>
					<RedirectExternalURL />
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
					<MainPage />
				</Route>
				<Route
					path="/clubs/:clubId"
					component={ClubProfileViewerForUsers}
					exact
				/>
				<Route path="/users/events/:userId" exact>
					<UserEvents />
				</Route>
				<Route path="/users/garagewrapper/:userId" exact>
					<UserGarageWrapper />
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
				<Route
					path="/users/clubEvents/:clubId"
					component={ClubEventsForUsers}
					exact
				/>
				<Route
					path="/users/registerCarNumber/:clubId"
					component={UserRegisterCarNumber}
					exact
				/>
				<Route
					path="/users/credential/:userId"
					component={UserCredential}
					exact
				/>
				<Route
					path="/users/account/:userId"
					component={UserAccount}
					exact
				/>
				{/* <Route
					path="/users/profile/:userId"
					component={UserProfile}
					exact
				/> */}
				<Route path="/events/" exact>
					<Events />
				</Route>
				<Route
					path="/events/newEntryManager/:id"
					component={NewEntryManager}
					exact
				/>
				<Route
					path="/events/editEntryManager/:id"
					component={EditEntryManager}
					exact
				/>
				<Route
					path="/events/entrylist/:eid"
					component={EntryListForUsers}
					exact
				/>
				<Route
					path="/events/entrylistMaterialTable/:eid"
					component={MaterialTableEntryReport}
					exact
				/>
				<Route path="/events/entry/:carId" exact>
					<Car />
				</Route>
				<Route path="/events/:id" component={Event} exact />
				<Route path="/videoChannel/" component={VideoChannel} exact />
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
					<MainPage />
				</Route>
				<Route path="/events/update/error" exact>
					{/* this is for re-direction when sending a request to the url that needs authentication */}
					<Error />
				</Route>
				<Route path="/events/" exact>
					<Events />
				</Route>
				<Route path="/events/:id" component={Event} exact />
				<Route path="/events/update/:id" exact>
					<UpdateEvent />
				</Route>
				<Route path="/clubs/auth" exact>
					<ClubAuth />
				</Route>
				<Route path="/users/auth" exact>
					<UserAuth />
				</Route>
				{/* because this is coming from email link so we use /clubConfirmation/ instead of /clubs/confirmation */}
				<Route path="/clubConfirmation/:email/:token" exact>
					<ClubConfirmation />
				</Route>
				{/* when club login but not verified, re-direct to this page */}
				<Route path="/clubs/verification/:email" exact>
					<ClubVerification />
				</Route>
				{/* club click on the resend link in the email */}
				<Route path="/clubVerificationRequest/:email" exact>
					<ClubVerificationRequest />
				</Route>
				{/* because this is coming from email link so we use /userConfirmation/ instead of /users/confirmation */}
				<Route path="/userConfirmation/:email/:token" exact>
					<UserConfirmation />
				</Route>
				{/* when user login but not verified, re-direct to this page */}
				<Route path="/users/verification/:email" exact>
					<UserVerification />
				</Route>
				{/* user click on the resend link in the email */}
				<Route path="/userVerificationRequest/:email" exact>
					<UserVerificationRequest />
				</Route>
				<Route path="/videoChannel/" component={VideoChannel} exact />
				{/* The following section is for page refresh. Without it, refresh will not happen */}
				{/*** To aviod unauthorized requests, all the pages below need to add loginValidation ***/}
				<Route path="/clubs/clubManager" exact>
					<ClubManager />
				</Route>
				<Route path="/clubs/commsMemberCenter/:clubId" exact>
					<CommsMemberCenter />
				</Route>
				<Route path="/clubs/commsEventSelector/:clubId" exact>
					<CommsEventSelector />
				</Route>
				<Route path="/clubs/commsEmailArchive/:clubId" exact>
					<CommsEmailArchive />
				</Route>
				<Route path="/clubs/memberManager" exact>
					<ClubMemberManager />
				</Route>
				<Route path="/clubs/eventManager" exact>
					<EventManager />
				</Route>
				<Route path="/clubs/newEventManager/" exact>
					<NewEventManager />
				</Route>
				<Route path="/clubs/registrationManager/" exact>
					<RegistrationManager />
				</Route>
				<Route path="/clubs/eventReportSelector/:clubId" exact>
					<EventReportSelector />
				</Route>
				<Route path="/clubs/paymentCenterSelector/:clubId" exact>
					<PaymentCenterSelector />
				</Route>
				<Route path="/clubs/refundCenterSelector/:clubId" exact>
					<RefundCenterSelector />
				</Route>
				<Route path="/clubs/dataCenterSelector/:clubId" exact>
					<DataCenterSelector />
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
				<Route path="/clubs/profile/:clubId" exact>
					<ClubProfileViewer />
				</Route>
				<Route path="/clubs/accountManager/:clubId" exact>
					<ClubAccountManager />
				</Route>
				<Route path="/clubs/credential/:clubId" exact>
					<ClubCredential />
				</Route>
				<Route path="/clubs/ses/:clubId" exact>
					<ClubSES />
				</Route>
				<Route path="/clubs/payment/:clubId" exact>
					<ClubPayment />
				</Route>
				<Route path="/clubs/clubSettings/:clubId" exact>
					<ClubSettings />
				</Route>
				<Route path="/clubs/stripe/:clubId" exact>
					<ClubStripe />
				</Route>
				<Route path="/clubs/stripeconnect/:clubId" exact>
					<ClubStripeConnect />
				</Route>
				<Route path="/clubs/profileManager/:clubId" exact>
					<ClubProfileManager />
				</Route>
				<Route path="/clubs/photos/:clubId" exact>
					<ClubPhotos />
				</Route>
				<Route path="/clubs/memberList/:clubId" exact>
					<ClubMemberList />
				</Route>
				<Route path="/clubs/carNumbers/:clubId" exact>
					<ClubCarNumbers />
				</Route>
				<Route path="/clubs/availCarNumbers/:clubId" exact>
					<ClubAvailableCarNumbers />
				</Route>
				<Route
					path="/users/clubEvents/:clubId"
					component={ClubEventsForUsers}
					exact
				/>
				<Route
					path="/users/registerCarNumber/:clubId"
					component={UserRegisterCarNumber}
					exact
				/>
				<Route
					path="/events/editEntryManager/:id"
					component={EditEntryManager}
					exact
				/>
				<Route
					path="/events/newEntryManager/:id"
					component={NewEntryManager}
					exact
				/>
				<Route
					path="/events/entrylist/:eid"
					component={EntryListForUsers}
					exact
				/>
				<Route path="/clubs/viewEventSelector/:clubId" exact>
					<ViewEventSelector />
				</Route>
				<Route path="/clubs/runGroupManagerSelector/:clubId" exact>
					<runGroupManagerSelector />
				</Route>
				<Route path="/events/formbuilder/:id" exact>
					<FormBuilder />
				</Route>
				<Route path="/users/events/:userId" exact>
					<UserEvents />
				</Route>
				<Route path="/users/garagewrapper/:userId" exact>
					<UserGarageWrapper />
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
				<Route
					path="/users/account/:userId"
					component={UserAccount}
					exact
				/>
				<Route
					path="/users/credential/:userId"
					component={UserCredential}
					exact
				/>
				<Route
					path="/events/entrylistMaterialTable/:eid"
					component={MaterialTableEntryReport}
					exact
				/>
				{/* End of page refresh section */}
				<Route
					path="/clubs/:clubId"
					component={ClubProfileViewerForUsers}
					exact
				/>
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
					userAccountStatus: userAccountStatus,
					userLogin: userLogin,
					userLogout: userLogout,
					setUserRedirectURL: setUserRedirectURL,
					setUserAccountStatusHook: setUserAccountStatusHook,
					removeUserEntry: removeUserEntry
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
