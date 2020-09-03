import React, { useContext, useEffect, useState } from 'react';
// import Button from '../../shared/components/FormElements/Button';
import { Link, NavLink } from 'react-router-dom';
import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubDashboardToolbar.css';

const ClubDashboardToolbar = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const clubLoggedIn = clubAuthContext.isClubLoggedIn;
	let cid = clubAuthContext.clubId;
	let clubName = clubAuthContext.clubName;
	return (
		<React.Fragment>
			<div className="dashboard-tabs-header clearfix">
				<div className="clubname-title">
					<h1 className="">{clubName}</h1>
				</div>
				{/* <div class="pull-right ng-scope" ng-if="$ctrl.currentPlan">
					<p class="current-plan-note ng-binding">
						Your Current ActivityHero Plan: Free
					</p>
				</div> */}
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
							<a href="#">Club Overview</a>
							<a href="#">Photo Manager</a>
							<a href="#">Billing</a>
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
							{/* <a href="#">Add New Event</a> */}
							<NavLink to={'/clubs/newEventManager'} exact>
								Add New Event
							</NavLink>
							<NavLink to={`/events/club/${cid}/`} exact>
								Edit Event
							</NavLink>
						</div>
					</li>

					<li className="dashboard-nav-menu dropdown">
						<Link
							to="/clubs/"
							exact="exact"
							className="dropdown-blackbutton">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"
							/>
							Event Dashboard
						</Link>
						<div className="dropdown-content">
							<a href="#">Event Reports</a>
							<a href="#">Event Board </a>
							<a href="#">Billing</a>
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
							<a href="#">Event Reports</a>
							<a href="#">Test</a>
							<a href="#">Billing</a>
						</div>
					</li>
				</ul>
			</div>
		</React.Fragment>
	);
};

export default ClubDashboardToolbar;
