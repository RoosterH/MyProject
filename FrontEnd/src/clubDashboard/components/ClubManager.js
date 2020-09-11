import React from 'react';

import './ClubManager.css';

const ManageClub = () => {
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">Club Manager</div>
			</div>

			<div className="list-content">
				<p className="list-content-link">Club Overview</p>
				<p className="list-content-desc">
					Here’s where you define everything that you wish to show on
					your club main page. Tell prospective drivers about your
					club, your races, your mission, and your staff. You can also
					set up your contact information.
				</p>

				<p className="list-content-link">Photo Manager</p>
				<p className="list-content-desc">
					Want to look at all your photos at once? You can do that
					right here in the photo manager.
				</p>
				<p className="list-content-link">Manage Your Team</p>
				<p className="list-content-desc">
					Manage Your Team Invite your co-workers to access your club
					dashboard.
				</p>
				<p className="list-content-link">About MySeatTime</p>
				<p className="list-content-desc">
					Learn more about MySeatTime.
				</p>
			</div>
		</React.Fragment>
	);
};

export default ManageClub;
