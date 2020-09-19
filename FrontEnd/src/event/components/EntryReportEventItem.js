import React from 'react';
import EntryReportManager from '../../clubDashboard/components/EntryReportManager';

// a wrapper of EntryReportManager
const EntryReportEventItem = props => {
	console.log('props = ', props);
	return (
		<EntryReportManager entryReportData={props.entryReportData} />
	);
};

export default EntryReportEventItem;
