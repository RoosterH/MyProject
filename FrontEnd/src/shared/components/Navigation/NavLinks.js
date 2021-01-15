import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';

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
	const clubAuthContext = useContext(ClubAuthContext);
	const clubLoggedIn = clubAuthContext.isClubLoggedIn;
	let cid = clubAuthContext.clubId;

	// check if we are inside a form page, we want to disable LOGOUT button
	// to avoid race condition between existing form page and logout handler
	const formContext = useContext(FormContext);
	const isInsideForm = formContext.isInsideForm;

	/* ----- User Section ----- */
	const userAuthContext = useContext(UserAuthContext);
	const userLoggedIn = userAuthContext.isUserLoggedIn;
	let uId = userAuthContext.userId;

	const { isLoading, error, logoutHandler, clearError } = useLogOut();

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<ul className="nav-links">
				{/* Make clubManager the entry page of Dashboard  */}
				{clubLoggedIn && (
					<li>
						<NavLink to={`/clubs/clubManager`} exact>
							DASHBOARD
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
				{/* {clubLoggedIn && !isInsideForm && ( */}
				{clubLoggedIn && (
					<li>
						<button onClick={logoutHandler}>LOGOUT</button>
						{isLoading && <LoadingSpinner asOverlay />}
					</li>
				)}
				{/********* user section *******/}
				{userLoggedIn && (
					<li>
						<NavLink to={`/users/events/${uId}`} exact>
							My EVENTS
						</NavLink>
					</li>
				)}
				{userLoggedIn && (
					<li className="navlink-dropdown">
						<p className="navlink-dropdown-button">
							My Garage<i className="fa fa-caret-down"></i>
						</p>
						<div className="navlink-dropdown-content">
							<Link to={`/users/garagewrapper/${uId}`} exact="exact">
								My cars
							</Link>
							<NavLink to={'/users/cars/new'} exact>
								Add cars
							</NavLink>
						</div>
					</li>
				)}
				{userLoggedIn && (
					<li className="navlink-dropdown">
						<p className="navlink-dropdown-button">
							My Account<i className="fa fa-caret-down"></i>
						</p>
						<div className="navlink-dropdown-content">
							<Link to={`/users/credential/${uId}`} exact="exact">
								Credential
							</Link>
							<Link to={`/users/profile/${uId}`} exact="exact">
								Profile
							</Link>
						</div>
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
