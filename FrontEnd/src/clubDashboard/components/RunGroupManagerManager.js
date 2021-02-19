import React, { useState } from 'react';
import RunGroupManager from './RunGroupManager';
import './ClubManager.css';

const RunGroupManagerManager = props => {
	let runGroupManagerData = props.runGroupManagerData;
	const [eventName, setEventName] = useState(
		props.runGroupManagerData.eventName !== ''
			? props.runGroupManagerData.eventName
			: ''
	);
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					Event Run Group Manager - {eventName} &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Run Group Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="tab-content">
						<RunGroupManager
							runGroupManagerData={runGroupManagerData}
							eventId={props.eventId}
						/>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default RunGroupManagerManager;
