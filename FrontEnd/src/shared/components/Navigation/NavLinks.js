import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavLink.css';

const NavLinks = props => {
	return (
		<ul className="nav-links">
			<li>
				<NavLink to="/" exact>
					ALL CLUBS
				</NavLink>
			</li>
			<li>
				<NavLink to="/events/" exact>
					MY CLUB EVENTS
				</NavLink>
			</li>
			<li>
				<NavLink to="/events/new">ADD EVENT</NavLink>
			</li>
			<li>
				<NavLink to="/auth">AUTHENTICATE</NavLink>
			</li>
		</ul>
	);
};

export default NavLinks;
