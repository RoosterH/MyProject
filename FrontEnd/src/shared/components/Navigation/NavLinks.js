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
				<NavLink to="/Events/" exact>
					MY CLUB EVENTS
				</NavLink>
			</li>
			<li>
				<NavLink to="/Events/New">ADD EVENT</NavLink>
			</li>
			<li>
				<NavLink to="/Auth">AUTHENTICATE</NavLink>
			</li>
		</ul>
	);
};

export default NavLinks;
