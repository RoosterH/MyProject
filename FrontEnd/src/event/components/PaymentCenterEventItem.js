import React from 'react';
import PaymentCenterManager from '../../clubDashboard/components/PaymentCenterManager';

// a wrapper of EntryReportManager
const PaymentCenterEventItem = props => {
	return (
		<PaymentCenterManager
			paymentCenterData={props.paymentCenterData}
		/>
	);
};

export default PaymentCenterEventItem;
