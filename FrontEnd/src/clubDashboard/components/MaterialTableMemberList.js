import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';

const MaterialTableEntryReport = props => {
	let clubName = props.clubName;
	let memberList = props.memberList;
	let showLoading = props.showLoading;
	let hasMemberSystem = props.hasMemberSystem;
	let hasMemberNumber = props.hasMemberNumber;
	let confirmAddMember = props.confirmAddMember;
	let confirmUpdateMember = props.confirmUpdateMember;
	let confirmDeleteMember = props.confirmDeleteMember;

	const [data, setData] = useState();
	useEffect(() => {
		setData(memberList);
	}, [memberList, setData]);

	let title = clubName + ' Member List';
	const [selectedRow, setSelectedRow] = useState(null);

	return (
		<React.Fragment>
			{hasMemberSystem && hasMemberNumber && (
				<div className="entrylist-table">
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
							{
								title: 'Last Name',
								field: 'lastName'
							},
							{
								title: 'First Name',
								field: 'firstName'
							},
							{
								title: 'Email',
								field: 'email',
								filtering: false
							},
							{
								title: 'Member Number',
								field: 'memberNumber'
							},
							{
								title: 'Member Expiration',
								field: 'memberExp'
							},
							{
								title: 'Phone Number',
								field: 'phone',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Address',
								field: 'address',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'City',
								field: 'city',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'State',
								field: 'state',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Zip Code',
								field: 'zip',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Emergency Contact',
								field: 'emergency',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Contact Number',
								field: 'emergencyPhone',
								filtering: false,
								editable: 'never'
							}
						]}
						editable={{
							onRowAdd: newData =>
								new Promise((resolve, reject) => {
									// newData format: lastName: "Hung", firstName: "Mario", email: "mario@gmail.com",
									// memberNumber: "123456", memberExp: "05/31/2029"
									confirmAddMember(true, newData);
									setTimeout(() => {
										setData([...data, newData]);
										resolve();
									}, 1000);
								}),
							onRowUpdate: (newData, oldData) =>
								new Promise((resolve, reject) => {
									confirmUpdateMember(newData, oldData);
									setTimeout(() => {
										const dataUpdate = [...data];
										const index = oldData.tableData.id;
										dataUpdate[index] = newData;
										setData([...dataUpdate]);

										resolve();
									}, 1000);
								}),
							onRowDelete: oldData =>
								new Promise((resolve, reject) => {
									confirmDeleteMember(oldData);
									setTimeout(() => {
										const dataDelete = [...data];
										const index = oldData.tableData.id;
										dataDelete.splice(index, 1);
										setData([...dataDelete]);

										resolve();
									}, 1000);
								})
						}}
						options={{
							filtering: true,
							exportButton: true,
							columnsButton: true,
							pageSize: 20,
							pageSizeOptions: [5, 10, 20, 50, 100]
						}}
					/>
				</div>
			)}
			{hasMemberSystem && !hasMemberNumber && (
				<div className="entrylist-table">
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
							{
								title: 'Last Name',
								field: 'lastName'
							},
							{
								title: 'First Name',
								field: 'firstName'
							},
							{
								title: 'Email',
								field: 'email',
								filtering: false
							},
							{
								title: 'Member Expiration',
								field: 'memberExp'
							},
							{
								title: 'Phone Number',
								field: 'phone',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Address',
								field: 'address',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'City',
								field: 'city',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'State',
								field: 'state',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Zip Code',
								field: 'zip',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Emergency Contact',
								field: 'emergency',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Contact Number',
								field: 'emergencyPhone',
								filtering: false,
								editable: 'never'
							}
						]}
						editable={{
							onRowAdd: newData =>
								new Promise((resolve, reject) => {
									// newData format: lastName: "Hung", firstName: "Mario", email: "mario@gmail.com",
									// memberNumber: "123456", memberExp: "05/31/2029"
									confirmAddMember(true, newData);
									setTimeout(() => {
										setData([...data, newData]);
										resolve();
									}, 1000);
								}),
							onRowUpdate: (newData, oldData) =>
								new Promise((resolve, reject) => {
									confirmUpdateMember(newData, oldData);
									setTimeout(() => {
										const dataUpdate = [...data];
										const index = oldData.tableData.id;
										dataUpdate[index] = newData;
										setData([...dataUpdate]);

										resolve();
									}, 1000);
								}),
							onRowDelete: oldData =>
								new Promise((resolve, reject) => {
									confirmDeleteMember(oldData);
									setTimeout(() => {
										const dataDelete = [...data];
										const index = oldData.tableData.id;
										dataDelete.splice(index, 1);
										setData([...dataDelete]);

										resolve();
									}, 1000);
								})
						}}
						options={{
							filtering: true,
							exportButton: true,
							columnsButton: true,
							pageSize: 20,
							pageSizeOptions: [5, 10, 20, 50, 100]
						}}
					/>
				</div>
			)}
			{!hasMemberSystem && (
				<div className="entrylist-table">
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
							{
								title: 'Last Name',
								field: 'lastName'
							},
							{
								title: 'First Name',
								field: 'firstName'
							},
							{
								title: 'Email',
								field: 'email',
								filtering: false
							},
							{
								title: 'Phone Number',
								field: 'phone',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Address',
								field: 'address',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'City',
								field: 'city',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'State',
								field: 'state',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Zip Code',
								field: 'zip',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Emergency Contact',
								field: 'emergency',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Contact Number',
								field: 'emergencyPhone',
								filtering: false,
								editable: 'never'
							}
						]}
						actions={[
							{
								icon: 'add',
								tooltip: 'Add Member',
								isFreeAction: true,
								onClick: (event, rowData) => {
									// flag to display modal to ask for confirmation
								}
							}
						]}
						editable={{
							onRowAdd: newData =>
								new Promise((resolve, reject) => {
									// newData format: lastName: "Hung", firstName: "Mario", email: "mario@gmail.com",
									// memberNumber: "123456", memberExp: "05/31/2029"
									confirmAddMember(true, newData);
									setTimeout(() => {
										setData([...data, newData]);
										resolve();
									}, 1000);
								}),
							onRowUpdate: (newData, oldData) =>
								new Promise((resolve, reject) => {
									confirmUpdateMember(newData, oldData);
									setTimeout(() => {
										const dataUpdate = [...data];
										const index = oldData.tableData.id;
										dataUpdate[index] = newData;
										setData([...dataUpdate]);

										resolve();
									}, 1000);
								}),
							onRowDelete: oldData =>
								new Promise((resolve, reject) => {
									confirmDeleteMember(oldData);
									setTimeout(() => {
										const dataDelete = [...data];
										const index = oldData.tableData.id;
										dataDelete.splice(index, 1);
										setData([...dataDelete]);

										resolve();
									}, 1000);
								})
						}}
						options={{
							filtering: true,
							exportButton: true,
							columnsButton: true,
							pageSize: 20,
							pageSizeOptions: [5, 10, 20, 50, 100]
						}}
					/>
				</div>
			)}
		</React.Fragment>
	);
};

export default MaterialTableEntryReport;
