import React from 'react';
import EditEventManager from '../../clubDashboard/components/EditEventManager';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const EditEventItem = props => {
	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			<EditEventManager event={props.event} />
		</React.Fragment>
	);
};

export default EditEventItem;
