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

	return (
		<React.Fragment>
			<div className="entrylist-table">
				{displayName && (
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
							exportButton: true
						}}
					/>
				)}
				{displayName && waitlist !== [] && (
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
				{!displayName && (
					<MaterialTable
						title={`${eventName} Entry List`}
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
						data={entryList}
						options={{
							filtering: true,
							exportButton: true
						}}
					/>
				)}
				{!displayName && waitlist !== [] && (
					<MaterialTable
						title={`${eventName} Waitlist`}
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
						data={waitlist}
						options={{
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
