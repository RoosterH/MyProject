import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubManager.css';

const ManageClub = () => {
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
				<div className="h3">Club Manager</div>
			</div>

			<div className="list-content">
				<div className="list-content-link">
					<Link to={`/clubs/profileManager/${cid}`}>
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Profile Manager
					</Link>
					<Link to={`/clubs/profileManager/${cid}`} exact="exact">
						<p className="list-content-desc">
							Here’s where you define everything that you wish to show
							on your club main page. Tell prospective drivers about
							your club, your races, your mission, and your staff. You
							can also set up your contact information.
						</p>
					</Link>
					<Link to={`/clubs/accountManager/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Account Manager
					</Link>
					<Link to={`/clubs/accountManager/${cid}`} exact="exact">
						<p className="list-content-desc">
							Setup your payment receive methods and Stripe account
							information in the account manager.
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

export default ManageClub;
