import React, { useState, useEffect } from 'react';
import Button from '../../shared/components/FormElements/Button';
import MaterialTable, { MTableAction } from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';

import './ClubManager.css';

const MaterialTableRunGroupManager = props => {
	let runGroup = props.runGroup;
	let eventName = props.eventName;
	let showLoading = props.showLoading;
	let changeGroupRegistration = props.changeGroupRegistration;

	const [data, setData] = useState([]);
	useEffect(() => {
		if (!!runGroup && runGroup.length >= 0) {
			setData(runGroup);
		}
	}, [runGroup, setData]);

	const getButtonClassName = status => {
		if (status === 'Closed') {
			return 'small-green';
		} else if (status === 'Open') {
			return 'small-red';
		}
	};

	const getButtonText = status => {
		if (status === 'Open') {
			return 'Close Registration';
		} else {
			return 'Open Registration';
		}
	};
	let title = `${eventName} Run Group Registration Manager`;
	const [selectedRow, setSelectedRow] = useState(null);
	return (
		<React.Fragment>
			<div className="entrylist-table">
				<MaterialTable
					title={title}
					data={data}
					isLoading={showLoading}
					style={{
						border: '2px solid gray',
						maxWidth: '1450px',
						marginTop: '10px',
						marginLeft: '20px'
					}}
					columns={[
						{
							title: 'Run Group',
							field: 'runGroup',
							filtering: false,
							editable: 'never'
						},
						{
							title: 'Number of Entries',
							field: 'runGroupNumEntries',
							filtering: false,
							editable: 'never'
						},
						{
							title: 'Registration Status',
							field: 'runGroupRegistrationStatus',
							filtering: false,
							editable: 'never'
						}
					]}
					options={{
						filtering: false,
						exportButton: false,
						columnsButton: false,
						pageSize: 10,
						pageSizeOptions: [10, 15, 20]
					}}
					actions={[
						{
							icon: 'Manage',
							tooltip: 'Manage',
							onClick: (event, rowData) => {
								setTimeout(() => {
									// need to set timeout to have the table load the new value
									// console.log('rowData = ', rowData);
								}, 2000);
							}
						}
					]}
					components={{
						Action: props => {
							if (
								typeof props.action === typeof Function ||
								props.action.tooltip !== 'Manage'
							) {
								return <MTableAction {...props} />;
							} else {
								return (
									<Button
										onClick={event => {
											// pass props.data.groupNum back to RunGroupManager
											changeGroupRegistration(props.data.groupNum);
										}}
										size={getButtonClassName(
											props.data.runGroupRegistrationStatus
										)}>
										{getButtonText(
											props.data.runGroupRegistrationStatus
										)}
									</Button>
								);
							}
						},
						OverlayLoading: props => (
							<div className="center">
								<LoadingSpinner />
							</div>
						)
					}}
				/>
			</div>
		</React.Fragment>
	);
};

export default MaterialTableRunGroupManager;
