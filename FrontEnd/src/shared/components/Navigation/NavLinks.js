import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import {
	ClubAuthContext,
	UserAuthContext
} from '../../context/auth-context';
import { FormContext } from '../../context/form-context';
import { useLogOut } from '../../hooks/logout-hook';
import ErrorModal from '../UIElements/ErrorModal';
import LoadingSpinner from '../UIElements/LoadingSpinner';

import './NavLinks.css';

const NavLinks = props => {
	/* ----- Club Section ----- */
	const clubAuth = useContext(ClubAuthContext);
	const clubLoggedIn = clubAuth.isClubLoggedIn;
	let cid = clubAuth.clubId;

	// check if we are inside a form page, we want to disable LOGOUT button
	// to avoid race condition between existing form page and logout handler
	const formContext = useContext(FormContext);
	const isInsideForm = formContext.isInsideForm;

	/* ----- User Section ----- */
	const userAuth = useContext(UserAuthContext);
	const userLoggedIn = userAuth.isUserLoggedIn;
	let uid = userAuth.userId;

	const { isLoading, error, logoutHandler, clearError } = useLogOut();

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
				{clubLoggedIn && !isInsideForm && (
					<li>
						<button onClick={logoutHandler}>LOGOUT</button>
						{isLoading && <LoadingSpinner asOverlay />}
					</li>
				)}
				{/********* user section *******/}
				{userLoggedIn && (
					<li>
						<NavLink to={`/events/user/${uid}`} exact>
							My EVENTS
						</NavLink>
					</li>
				)}
				{userLoggedIn && (
					<li>
						<NavLink to={`/garage/${uid}`} exact>
							My Garage
						</NavLink>
					</li>
				)}
				{userLoggedIn && (
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
