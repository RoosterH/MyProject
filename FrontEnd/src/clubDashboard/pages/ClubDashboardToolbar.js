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
							<NavLink to={`/clubs/profileManager/${cid}`}>
								Profile Manager
							</NavLink>
							<NavLink to={`/clubs/accountManager/${cid}`} exact>
								Account Manager
							</NavLink>
							{/* <NavLink to={`/clubs/teamManager/${cid}`} exact>
								Team Manager
							</NavLink> */}
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
								Entry Report
							</NavLink>
							<NavLink
								to={`/clubs/paymentCenterSelector/${cid}`}
								exact>
								Payment Center
							</NavLink>
							<NavLink
								to={`/clubs/refundCenterSelector/${cid}`}
								exact>
								Refund Center
							</NavLink>
							<NavLink to={`/clubs/dataCenterSelector/${cid}`} exact>
								Data Center
							</NavLink>
							{/* <a href="#">Pending Waitlist Invitations</a>
							<a href="#">Detailed Analytics</a>
							<a href="#">User Credits</a> */}
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
							Communication Center (In development)
						</Link>
						{/* <div className="dropdown-content">
							<NavLink to={'/clubs/events/new'} exact>
								Add New Event
							</NavLink>
							<NavLink to={`/events/club/${cid}/`} exact>
								CLUB EVENTS
							</NavLink>
						</div> */}
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
							Member Manager
						</Link>
						<div className="dropdown-content">
							<NavLink to={`/clubs/memberList/${cid}`} exact>
								Member List
							</NavLink>
							<NavLink
								to={`/clubs/paymentCenterSelector/${cid}`}
								exact>
								Car Numbers
							</NavLink>
						</div>
					</li>
				</ul>
			</div>
		</React.Fragment>
	);
};

export default ClubDashboardToolbar;
