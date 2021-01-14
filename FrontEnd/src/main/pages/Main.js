import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';

const MainPageToolbar = () => {
	return (
		<React.Fragment>
			<div className="dashboard-nav">
				<ul>
					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/events/"
							exact="exact"
							className="dropdown-blackbutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Events
						</Link>
					</li>

					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/clubs/eventManager/"
							exact="exact"
							className="dropdown-greybutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Videos
						</Link>
					</li>
				</ul>
			</div>
		</React.Fragment>
	);
};

export default MainPageToolbar;
