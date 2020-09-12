import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubDashboardToolbar.css';

const ClubDashboardToolbar = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	let cid = clubAuthContext.clubId;
	let clubName = clubAuthContext.clubName;
	return (
		<React.Fragment>
			<div className="dashboard-tabs-header clearfix">
				<div className="clubname-title">
					<h1 className="">{clubName}</h1>
				</div>
			</div>

			<div className="dashboard-nav">
				<ul>
					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/clubs/clubManager"
							exact="exact"
							className="dropdown-blackbutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Club Manager
						</Link>
						<div className="dropdown-content">
							<a href="">Club Overview</a>
							<a href="">Photo Manager</a>
							<a href="">Manage Your Team</a>
							<a href="">About MySeatTime</a>
						</div>
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
							Event Manager
						</Link>
						<div className="dropdown-content">
							<NavLink to={'/clubs/newEventManager'} exact>
								Add New Event
							</NavLink>
							<NavLink to={`/clubs/editEventSelector/${cid}`} exact>
								Edit Events
							</NavLink>
							<NavLink to={`/clubs/viewEventSelector/${cid}`} exact>
								View Events
							</NavLink>
						</div>
					</li>

					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/clubs/RegistrationManager"
							exact="exact"
							className="dropdown-blackbutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Registration Manager
						</Link>
						<div className="dropdown-content">
							<NavLink to={`/clubs/eventReportSelector/${cid}`} exact>
								Entry Report Manager
							</NavLink>
							<a href="#">Waitlist</a>
							<a href="#">Pending Waitlist Invitations</a>
							<a href="#">Detailed Analytics</a>
							<a href="#">User Credits</a>
						</div>
					</li>

					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/clubs/manageClub/list"
							exact="exact"
							className="dropdown-greybutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Communication
						</Link>
						<div className="dropdown-content">
							{/* <a href="#">Add New Event</a> */}
							<NavLink to={'/clubs/events/new'} exact>
								Add New Event
							</NavLink>
							<NavLink to={`/events/club/${cid}/`} exact>
								CLUB EVENTS
							</NavLink>
						</div>
					</li>

					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/clubs/manageClub/list"
							exact="exact"
							className="dropdown-blackbutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Nothing yet
						</Link>
						<div className="dropdown-content">
							<a href="#">Test</a>
						</div>
					</li>
				</ul>
			</div>
		</React.Fragment>
	);
};

export default ClubDashboardToolbar;
