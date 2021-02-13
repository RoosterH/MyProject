import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubManager.css';

const ClubMemberManager = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	let cid = clubAuthContext.clubId;
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">Registration Manager</div>
			</div>

			<div className="list-content">
				<div className="list-content-link">
					<Link to={`/clubs/memberList/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Member Manager
					</Link>
					<Link to={`/clubs/memberList/${cid}`} exact="exact">
						<p className="list-content-desc">
							Manage your club members.
						</p>
					</Link>
					<Link to={`/clubs/carNumbers/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Car Number List
					</Link>
					<Link to={`/clubs/carNumbers/${cid}`} exact="exact">
						<p className="list-content-desc">Car number list.</p>
					</Link>
					<Link to={`/clubs/availCarNumbers/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Available Car Numbers
					</Link>
					<Link to={`/clubs/availCarNumbers/${cid}`} exact="exact">
						<p className="list-content-desc">Available Car Numbers</p>
					</Link>
				</div>
			</div>
		</React.Fragment>
	);
};

export default ClubMemberManager;
