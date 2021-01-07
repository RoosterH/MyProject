import React from 'react';
import DataCenterManager from '../../clubDashboard/components/DataCenterManager';

// a wrapper of DataCenterManager
const DataCenterEventItem = props => {
	return <DataCenterManager dataCenterData={props.dataCenterData} />;
};

export default DataCenterEventItem;
