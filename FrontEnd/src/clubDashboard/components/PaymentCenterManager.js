import React, { useState } from 'react';
import PaymentCenter from './PaymentCenter';
import './ClubManager.css';

const PaymentCenterManager = props => {
	let paymentCenterData = props.paymentCenterData;
	const [eventName, setEventName] = useState(
		props.paymentCenterData.eventName !== ''
			? props.paymentCenterData.eventName
			: ''
	);
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					Payment Center - {eventName} &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="tab-content">
						<PaymentCenter paymentCenterData={paymentCenterData} />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default PaymentCenterManager;
