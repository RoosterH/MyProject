import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ClubAuthContext } from '../../shared/context/auth-context';
import './ClubManager.css';

const RegistrationManager = () => {
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
						Entry Report
					</Link>
					<Link
						to={`/clubs/eventReportSelector/${cid}`}
						exact="exact">
						<p className="list-content-desc">
							Read your club event entry reports here.
						</p>
					</Link>
					<Link
						to={`/clubs/paymentCenterSelector/${cid}`}
						exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Payment Center
					</Link>
					<Link
						to={`/clubs/paymentCenterSelector/${cid}`}
						exact="exact">
						<p className="list-content-desc">
							Charge your customers here.
						</p>
					</Link>
					<Link
						to={`/clubs/refundCenterSelector/${cid}`}
						exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Refund Center
					</Link>
					<Link
						to={`/clubs/refundCenterSelector/${cid}`}
						exact="exact">
						<p className="list-content-desc">
							Refund your customers here.
						</p>
					</Link>
					<Link to={`/clubs/dataCenterSelector/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Data Center
					</Link>
					<Link to={`/clubs/dataCenterSelector/${cid}`} exact="exact">
						<p className="list-content-desc">
							Check your event data.
						</p>
					</Link>

					{/* <Link to={`/clubs/ownerClubEvents/${cid}`} exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Pending waitlist invitation
					</Link>
					*/}
				</div>
			</div>
		</React.Fragment>
	);
};

export default RegistrationManager;
