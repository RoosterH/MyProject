import React, { useState } from 'react';
import CommsEventCenter from './CommsEventCenter';
import './ClubManager.css';

const CommsEventCenterManager = props => {
	let commsCenterData = props.commsCenterData;
	const [eventName, setEventName] = useState(
		props.commsCenterData.eventName !== ''
			? props.commsCenterData.eventName
			: ''
	);
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					Event Communication Center - {eventName} &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Data Center Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="tab-content">
						<CommsEventCenter commsCenterData={commsCenterData} />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default CommsEventCenterManager;
