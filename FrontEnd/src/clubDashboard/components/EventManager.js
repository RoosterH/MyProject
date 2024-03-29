import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubManager.css';

const EventManager = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	let cid = clubAuthContext.clubId;
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">Event Manager</div>
			</div>

			<div className="list-content">
				<div className="list-content-link">
					{/* link to <NewEventManager /> */}
					<Link to="/clubs/newEventManager/" exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Add New Event
					</Link>
					<Link to="/clubs/newEventManager/" exact="exact">
						<p className="list-content-desc">
							Here’s where you add a new event. Follow steps to add a
							new club event.
						</p>
					</Link>
					{/* link to <EditEventSelector /> */}
					<Link to={`/clubs/editEventSelector/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Edit Event
					</Link>
					<Link to={`/clubs/editEventSelector/${cid}`} exact="exact">
						<p className="list-content-desc">
							Want to edit an existing event? Pick the one you want to
							edit.
						</p>
					</Link>
					{/* link to <ViewEventSelector /> */}
					<Link to={`/clubs/viewEventSelector/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						View Event
					</Link>
					<Link to={`/clubs/viewEventSelector/${cid}`} exact="exact">
						<p className="list-content-desc">
							view events in published layout. Pick the one you want
							to view.
						</p>
					</Link>
					{/* link to <RunGroupManager /> */}
					<Link
						to={`/clubs/runGroupManagerSelector/${cid}`}
						exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Run Group Manager
					</Link>
					<Link
						to={`/clubs/runGroupManagerSelector/${cid}`}
						exact="exact">
						<p className="list-content-desc">
							Control run group registration to keep the number of
							attendees in each group balanced.
						</p>
					</Link>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EventManager;
