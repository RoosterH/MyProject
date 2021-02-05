import React from 'react';
import CommsEventCenterManager from '../../clubDashboard/components/CommsEventCenterManager';

// a wrapper of DataCenterManager
const CommsCenterEventItem = props => {
	return (
		<CommsEventCenterManager
			commsCenterData={props.commsCenterData}
		/>
	);
};

export default CommsCenterEventItem;
