import React from 'react';
import RunGroupManagerManager from '../../clubDashboard/components/RunGroupManagerManager';

// a wrapper of RunGroupManagerManager
const RunGroupManagerEventItem = props => {
	return (
		<RunGroupManagerManager
			runGroupManagerData={props.runGroupManagerData}
			eventId={props.eventId}
		/>
	);
};

export default RunGroupManagerEventItem;
