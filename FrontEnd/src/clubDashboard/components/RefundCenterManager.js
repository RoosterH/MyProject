import React, { useState } from 'react';
import RefundCenter from './RefundCenter';
import './ClubManager.css';

const RefundCenterManager = props => {
	let refundCenterData = props.refundCenterData;
	const [eventName, setEventName] = useState(
		props.refundCenterData.eventName !== ''
			? props.refundCenterData.eventName
			: ''
	);
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					Refund Center - {eventName} &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="tab-content">
						<RefundCenter refundCenterData={refundCenterData} />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default RefundCenterManager;
