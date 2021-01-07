import React, { useState } from 'react';
import DataCenter from './DataCenter';
import './ClubManager.css';

const DataCenterManager = props => {
	let dataCenterData = props.dataCenterData;
	const [eventName, setEventName] = useState(
		props.dataCenterData.eventName !== ''
			? props.dataCenterData.eventName
			: ''
	);
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					Data Center - {eventName} &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="tab-content">
						<DataCenter dataCenterData={dataCenterData} />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default DataCenterManager;
