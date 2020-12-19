import React from 'react';
import RefundCenterManager from '../../clubDashboard/components/RefundCenterManager';

// a wrapper of RefundCenterManager
const RefundCenterEventItem = props => {
	return (
		<RefundCenterManager refundCenterData={props.refundCenterData} />
	);
};

export default RefundCenterEventItem;
