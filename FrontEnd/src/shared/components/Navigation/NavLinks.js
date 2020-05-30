import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { ClubAuthContext, UserAuthContext } from '../../context/auth-context';
import './NavLink.css';

const NavLinks = props => {
	const clubAuth = useContext(ClubAuthContext);
	const clubLoggedIn = clubAuth.isClubLoggedIn;

	const userAuthContext = useContext(UserAuthContext);
	const userLoggedIn = userAuthContext.isUserLoggedIn;

	console.log('in Navlink clubId = ', clubAuth.clubId);
	return (
		<ul className="nav-links">
			<li>
				<NavLink to="/" exact>
					Main Page
				</NavLink>
			</li>
			{clubLoggedIn && (
				<li>
					<NavLink to="/c1/events/" exact>
						CLUB EVENTS
					</NavLink>
				</li>
			)}
			{clubLoggedIn && (
				<li>
					<NavLink to="/c1/events/new" exact>
						ADD EVENT
					</NavLink>
				</li>
			)}
			{userLoggedIn && (
				<li>
					<NavLink to="/:uid/events/" exact>
						My EVENTS
					</NavLink>
				</li>
			)}
			{!clubLoggedIn && !userLoggedIn && (
				<li>
					<NavLink to="/users/auth" exact>
						Driver Login
					</NavLink>
				</li>
			)}
			{!clubLoggedIn && !userLoggedIn && (
				<li>
					<NavLink to="/clubs/auth" exact>
						Club Login
					</NavLink>
				</li>
			)}
			{clubLoggedIn && (
				<li>
					<button onClick={clubAuth.clubLogout}>LOGOUT</button>
				</li>
			)}
		</ul>
	);
};

export default NavLinks;
