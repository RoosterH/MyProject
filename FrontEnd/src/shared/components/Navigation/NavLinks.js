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
						<NavLink to={`/users/events/${uId}`} exact>
							My EVENTS
						</NavLink>
					</li>
				)}
				{userLoggedIn && (
					<li>
						<NavLink to={`/users/garage/${uId}`} exact>
							My Garage
						</NavLink>
					</li>
				)}
				{userLoggedIn && (
					<li>
						<NavLink to={'/users/cars/new'} exact>
							Add Car
						</NavLink>
					</li>
				)}
				{/* {userLoggedIn && (
					<div class="btn-group">
						<button
							type="button"
							class="btn btn-info dropdown-toggle"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false">
							My Garage
						</button>
						<div
							class="dropdown-menu"
							aria-labelledby="dropdownMenuLink">
							<a class="dropdown-item" href="#">
								View
							</a>
							<a class="dropdown-item" href="#">
								Add Car
							</a>
						</div>
					</div>
				)} */}

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
