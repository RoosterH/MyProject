import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	// Redirect,
	Switch
} from 'react-router-dom';

import Clubs from './clubs/pages/Clubs';
import Event from './event/pages/Event';
import Events from './events/pages/Events';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import NewClub from './clubs/pages/NewClub';
import NewEvent from './event/pages/NewEvent';
import Users from './users/pages/Users';
import UpdateEvent from './event/pages/updateEvent';

const App = () => {
	return (
		<Router>
			<MainNavigation />
			{/* main is defiend in /shared/components/Navigation/MainHeader.css */}
			<main>
				<Switch>
					<Route path="/" exact>
						<Clubs />
						<Users />
					</Route>
					<Route path="/Clubs/New" exact>
						<NewClub />
					</Route>
					<Route path="/Events/" exact>
						<Events />
					</Route>
					<Route path="/Events/New" exact>
						<NewEvent />
					</Route>
					<Route path="/Events/Update/:eid " exact>
						<UpdateEvent />
					</Route>
					<Route path="/Events/:eid" exact>
						<Event />
					</Route>
				</Switch>
			</main>
		</Router>
	);
};

export default App;
