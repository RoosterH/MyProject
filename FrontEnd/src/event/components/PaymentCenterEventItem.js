import React from 'react';
import PaymentCenterManager from '../../clubDashboard/components/PaymentCenterManager';

// a wrapper of PaymentCenterManager
const PaymentCenterEventItem = props => {
	return (
		<PaymentCenterManager
			paymentCenterData={props.paymentCenterData}
		/>
	);
};

export default PaymentCenterEventItem;
