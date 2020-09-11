import React from 'react';
import EditEventManager from '../../clubDashboard/components/EditEventManager';

// a wrapper of EditEventManager
const EditEventItem = props => {
	return <EditEventManager event={props.event} />;
};

export default EditEventItem;
