import React, { useState } from 'react';
import EntryReport from './EntryReport';
import './ClubManager.css';

const EntryReportManager = props => {
	let entryReportData = props.entryReportData;
	const [eventName, setEventName] = useState(
		props.entryReportData.eventName !== ''
			? props.entryReportData.eventName
			: ''
	);
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					{eventName} &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="tab-content">
						<EntryReport entryReportData={entryReportData} />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EntryReportManager;
