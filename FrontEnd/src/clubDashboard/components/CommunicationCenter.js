import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubManager.css';

const CommunicationCenter = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	let cid = clubAuthContext.clubId;
	let clubName = clubAuthContext.clubName;

	const [clubInfo, setClubInfo] = useState(false);
	const [clubInfoClass, setClubInfoClass] = useState('li-tab');
	const [accountManager, setaccountManager] = useState(false);
	const [accountManagerClass, setaccountManagerClass] = useState(
		'li-tab'
	);
	const [teamManager, setteamManager] = useState(false);
	const [teamManagerClass, setteamManagerClass] = useState('li-tab');

	// 2. In EventsItem <Link to={{pathname: `/events/${props.id}`, state: {props: props}}}> via EventWrapper

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">Club Communication Center</div>
			</div>

			<div className="list-content">
				<div className="list-content-link">
					<Link to={`/clubs/commsMemberCenter/${cid}`}>
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Member Center
					</Link>
					<Link to={`/clubs/commsMemberCenter/${cid}`} exact="exact">
						<p className="list-content-desc">
							Send out a blast email to all the members or individual
							emails.
						</p>
					</Link>
					<Link to={`/clubs/commsEventSelector/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Event Center
					</Link>
					<Link to={`/clubs/commsEventSelector/${cid}`} exact="exact">
						<p className="list-content-desc">
							You can contact a specific event attendees from here.
						</p>
					</Link>
					{/* <Link to={`/clubs/teamManager/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Team Manager
					</Link>
					<Link to={`/clubs/teamManager/${cid}`} exact="exact">
						<p className="list-content-desc">
							Manage Your Team Invite your co-workers to access your
							club dashboard.
						</p>
					</Link> */}
				</div>
			</div>
		</React.Fragment>
	);
};

export default CommunicationCenter;
