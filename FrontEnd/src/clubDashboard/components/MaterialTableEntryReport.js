import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';

const MaterialTableEntryReport = props => {
	let entryList = props.entryList;
	let waitlist = props.waitlist;
	let displayName = props.displayName;
	let eventName = props.eventName;
	let showLoading = props.showLoading;
	let raceClassLookup = props.raceClassLookup;
	let runGroupLookup = props.runGroupLookup;
	let workerAssignmentLookup = props.workerAssignmentLookup;
	let lunchOptionLookup = props.lunchOptionLookup;

	const [data, setData] = useState();
	useEffect(() => {
		if (!!entryList && entryList.length > 0) {
			setData(entryList);
		}
	}, [entryList, setData]);

	let title =
		!!data && data.length > 0
			? `${eventName} Entry List - total entries ${data.length}`
			: `${eventName} Entry List`;
	const [selectedRow, setSelectedRow] = useState(null);
	return (
		<React.Fragment>
			<div className="entrylist-table">
				{displayName &&
					Object.values(lunchOptionLookup).length === 0 && (
						<MaterialTable
							title={title}
							data={data}
							isLoading={showLoading}
							components={{
								OverlayLoading: props => (
									<div className="center">
										<LoadingSpinner />
									</div>
								)
							}}
							style={{
								border: '2px solid gray',
								maxWidth: '1450px',
								marginTop: '10px',
								marginLeft: '20px'
							}}
							columns={[
								{ title: 'Last Name', field: 'lastName' },
								{
									title: 'First Name',
									field: 'firstName',
									filtering: false
								},
								{
									title: 'Car Number',
									field: 'carNumber',
									filtering: false
								},
								{ title: 'Car', field: 'car', filtering: false },
								{
									title: 'Race Class',
									field: 'raceClass',
									lookup: raceClassLookup
								},
								{
									title: 'Run Group',
									field: 'runGroup',
									lookup: runGroupLookup
								},
								{
									title: 'Worker Group',
									field: 'workerAssignment',
									lookup: workerAssignmentLookup
								}
							]}
							options={{
								filtering: true,
								exportButton: true,
								columnsButton: true,
								pageSize: 20,
								pageSizeOptions: [5, 10, 20, 50, 100]
							}}
						/>
					)}
				{displayName &&
					Object.values(lunchOptionLookup).length !== 0 && (
						<MaterialTable
							title={title}
							data={data}
							isLoading={showLoading}
							components={{
								OverlayLoading: props => (
									<div className="center">
										<LoadingSpinner />
									</div>
								)
							}}
							style={{
								border: '2px solid gray',
								maxWidth: '1450px',
								marginTop: '10px',
								marginLeft: '20px'
							}}
							columns={[
								{ title: 'Last Name', field: 'lastName' },
								{
									title: 'First Name',
									field: 'firstName',
									filtering: false
								},
								{
									title: 'Car Number',
									field: 'carNumber',
									filtering: false
								},
								{ title: 'Car', field: 'car', filtering: false },
								{
									title: 'Race Class',
									field: 'raceClass',
									lookup: raceClassLookup
								},
								{
									title: 'Run Group',
									field: 'runGroup',
									lookup: runGroupLookup
								},
								{
									title: 'Worker Group',
									field: 'workerAssignment',
									lookup: workerAssignmentLookup
								},
								{
									title: 'Lunch',
									field: 'lunchOption',
									lookup: lunchOptionLookup
								}
							]}
							options={{
								filtering: true,
								exportButton: true,
								columnsButton: true,
								pageSize: 20,
								pageSizeOptions: [5, 10, 20, 50, 100],
								rowStyle: rowData => ({
									backgroundColor:
										selectedRow === rowData.tableData.id
											? '#EEE'
											: '#FFF'
								})
							}}
							onRowClick={(evt, selectedRow) => {
								setSelectedRow(selectedRow.tableData.id);
							}}
						/>
					)}
				{displayName && waitlist.length !== 0 && (
					<MaterialTable
						title={`${eventName} Waitlist -  on the list`}
						// title={`${eventName} Waitlist - ${waitlist.length} on the list`}
						data={waitlist}
						style={{
							border: '2px solid gray',
							maxWidth: '1450px',
							overflow: 'scroll',
							marginTop: '10px',
							marginLeft: '20px'
						}}
						columns={[
							{ title: 'Last Name', field: 'lastName' },
							{
								title: 'First Name',
								field: 'firstName',
								filtering: false
							},
							{
								title: 'Car Number',
								field: 'carNumber',
								filtering: false
							},
							{ title: 'Car', field: 'car', filtering: false },
							{
								title: 'Race Class',
								field: 'raceClass',
								lookup: raceClassLookup,
								filtering: false
							},
							{
								title: 'Run Group',
								field: 'runGroup',
								lookup: runGroupLookup,
								filtering: false
							},
							{
								title: 'Worker Group',
								field: 'workerAssignment',
								lookup: workerAssignmentLookup,
								filtering: false
							}
						]}
						options={{
							filtering: false,
							sorting: false,
							exportButton: true,
							columnsButton: true
						}}
					/>
				)}
				{!displayName &&
					Object.values(lunchOptionLookup).length === 0 && (
						<MaterialTable
							title={title}
							data={data}
							columns={[
								{ title: 'User Name', field: 'userName' },
								{
									title: 'Car Number',
									field: 'carNumber',
									filtering: false
								},
								{ title: 'Car', field: 'car', filtering: false },
								{
									title: 'Race Class',
									field: 'raceClass',
									lookup: raceClassLookup
								},
								{
									title: 'Run Group',
									field: 'runGroup',
									lookup: runGroupLookup
								},
								{
									title: 'Worker Group',
									field: 'workerAssignment',
									lookup: workerAssignmentLookup
								}
							]}
							options={{
								filtering: true,
								exportButton: true,
								columnsButton: true,
								pageSize: 20,
								pageSizeOptions: [5, 10, 20, 50, 100]
							}}
						/>
					)}
				{!displayName &&
					Object.values(lunchOptionLookup).length !== 0 && (
						<MaterialTable
							title={title}
							data={data}
							columns={[
								{ title: 'User Name', field: 'userName' },
								{
									title: 'Car Number',
									field: 'carNumber',
									filtering: false
								},
								{ title: 'Car', field: 'car', filtering: false },
								{
									title: 'Race Class',
									field: 'raceClass',
									lookup: raceClassLookup
								},
								{
									title: 'Run Group',
									field: 'runGroup',
									lookup: runGroupLookup
								},
								{
									title: 'Worker Group',
									field: 'workerAssignment',
									lookup: workerAssignmentLookup
								},
								{
									title: 'Lunch',
									field: 'lunchOption',
									lookup: lunchOptionLookup
								}
							]}
							options={{
								filtering: true,
								exportButton: true,
								columnsButton: true,
								pageSize: 20,
								pageSizeOptions: [5, 10, 20, 50, 100]
							}}
						/>
					)}
				{!displayName && waitlist.length !== 0 && (
					<MaterialTable
						title={`${eventName} Waitlist - ${waitlist.length} on the list`}
						data={waitlist}
						columns={[
							{ title: 'User Name', field: 'userName' },
							{
								title: 'Car Number',
								field: 'carNumber'
							},
							{ title: 'Car', field: 'car' },
							{
								title: 'Race Class',
								field: 'raceClass',
								lookup: raceClassLookup
							},
							{
								title: 'Run Group',
								field: 'runGroup',
								lookup: runGroupLookup
							},
							{
								title: 'Worker Group',
								field: 'workerAssignment',
								lookup: workerAssignmentLookup
							}
						]}
						options={{
							filtering: false,
							sorting: false,
							exportButton: true,
							columnsButton: true
						}}
					/>
				)}
			</div>
		</React.Fragment>
	);
};

export default MaterialTableEntryReport;
