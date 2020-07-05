import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import {
	ClubAuthContext,
	UserAuthContext
} from '../../context/auth-context';
import { useClubLogOut } from '../../hooks/clubLogout-hook';
import ErrorModal from '../UIElements/ErrorModal';
import LoadingSpinner from '../UIElements/LoadingSpinner';

import './NavLinks.css';

const NavLinks = props => {
	const clubAuth = useContext(ClubAuthContext);
	const clubLoggedIn = clubAuth.isClubLoggedIn;

	const userAuthContext = useContext(UserAuthContext);
	const userLoggedIn = userAuthContext.isUserLoggedIn;

	const {
		isLoading,
		error,
		logoutHandler,
		clearError
	} = useClubLogOut();

	let cid = clubAuth.clubId;
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<ul className="nav-links">
				{/* <li>
					<NavLink to="/" exact>
						Main Page
					</NavLink>
				</li> */}
				{clubLoggedIn && (
					<li>
						<NavLink to={`/events/club/${cid}/`} exact>
							CLUB EVENTS
						</NavLink>
					</li>
				)}
				{clubLoggedIn && (
					<li>
						<NavLink to="/clubs/events/new" exact>
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
						<button onClick={logoutHandler}>LOGOUT</button>
						{isLoading && <LoadingSpinner asOverlay />}
					</li>
				)}
			</ul>
		</React.Fragment>
	);
};

export default NavLinks;
