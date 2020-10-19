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
				<div className="h3">Registration Manager</div>
			</div>

			<div className="list-content">
				<div className="list-content-link">
					<Link
						to={`/clubs/eventReportSelector/${cid}`}
						exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Entry Report Manager
					</Link>
					<Link
						to={`/clubs/eventReportSelector/${cid}`}
						exact="exact">
						<p className="list-content-desc">
							Read all sort of entry reports here.
						</p>
					</Link>

					<Link to={`/clubs/editEventSelector/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Waitlist
					</Link>
					<Link to={`/clubs/editEventSelector/${cid}`} exact="exact">
						<p className="list-content-desc">
							Want to edit an existing event? Pick the one you want to
							edit.
						</p>
					</Link>

					<Link to={`/clubs/ownerClubEvents/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Pending waitlist invitation
					</Link>
					<Link to={`/clubs/viewEventSelector/${cid}`} exact="exact">
						<p className="list-content-desc">
							view events in published layout. Pick the one you want
							to view.
						</p>
					</Link>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EventManager;
