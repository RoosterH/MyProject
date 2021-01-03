import React from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import './ClubManager.css';
import { TramOutlined } from '@material-ui/icons';

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

	return (
		<React.Fragment>
			<div className="entrylist-table">
				{displayName &&
					Object.values(lunchOptionLookup).length === 0 && (
						<MaterialTable
							title={`${eventName} Entry List`}
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
								{
									title: 'No.',
									field: 'no',
									filtering: false,
									// cellStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									// headerStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									width: 50
								},
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
							data={entryList}
							options={{
								filtering: true,
								exportButton: true,
								pageSize: 20,
								pageSizeOptions: [20, 50, 100]
							}}
						/>
					)}
				{displayName &&
					Object.values(lunchOptionLookup).length !== 0 && (
						<MaterialTable
							title={`${eventName} Entry List`}
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
								{
									title: 'No.',
									field: 'no',
									filtering: false,
									// cellStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									// headerStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									width: 50
								},
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
							data={entryList}
							options={{
								filtering: true,
								exportButton: true,
								pageSize: 20,
								pageSizeOptions: [20, 50, 100]
							}}
						/>
					)}
				{displayName && waitlist.length !== 0 && (
					<MaterialTable
						title={`${eventName} Waitlist`}
						style={{
							border: '2px solid gray',
							maxWidth: '1450px',
							overflow: 'scroll',
							marginTop: '10px',
							marginLeft: '20px'
						}}
						columns={[
							{
								title: 'No.',
								field: 'no',
								filtering: false,
								// cellStyle: {
								// 	backgroundColor: '#bfbfbf',
								// 	color: '#000000'
								// },
								// headerStyle: {
								// 	backgroundColor: '#bfbfbf',
								// 	color: '#000000'
								// },
								width: 50
							},
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
						data={waitlist}
						options={{
							filtering: false,
							sorting: false,
							exportButton: true
						}}
					/>
				)}
				{!displayName &&
					Object.values(lunchOptionLookup).length === 0 && (
						<MaterialTable
							title={`${eventName} Entry List`}
							columns={[
								{
									title: 'No.',
									field: 'no',
									filtering: false,
									// cellStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									// headerStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									width: 50
								},
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
							data={entryList}
							options={{
								filtering: true,
								exportButton: true,
								pageSize: 20,
								pageSizeOptions: [20, 50, 100]
							}}
						/>
					)}
				{!displayName &&
					Object.values(lunchOptionLookup).length !== 0 && (
						<MaterialTable
							title={`${eventName} Entry List`}
							columns={[
								{
									title: 'No.',
									field: 'no',
									filtering: false,
									// cellStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									// headerStyle: {
									// 	backgroundColor: '#bfbfbf',
									// 	color: '#000000'
									// },
									width: 50
								},
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
							data={entryList}
							options={{
								filtering: true,
								exportButton: true,
								pageSize: 20,
								pageSizeOptions: [20, 50, 100]
							}}
						/>
					)}
				{!displayName && waitlist.length !== 0 && (
					<MaterialTable
						title={`${eventName} Waitlist`}
						columns={[
							{
								title: 'No.',
								field: 'no',
								filtering: false,
								// cellStyle: {
								// 	backgroundColor: '#bfbfbf',
								// 	color: '#000000'
								// },
								// headerStyle: {
								// 	backgroundColor: '#bfbfbf',
								// 	color: '#000000'
								// },
								width: 50
							},
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
						data={waitlist}
						options={{
							filtering: false,
							sorting: false,
							exportButton: true
						}}
					/>
				)}
			</div>
		</React.Fragment>
	);
};

export default MaterialTableEntryReport;
