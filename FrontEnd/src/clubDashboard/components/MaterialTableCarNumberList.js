import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';

const MaterialTableCarNumberList = props => {
	let startNumber = props.startNumber;
	let endNumber = props.endNumber;
	let clubName = props.clubName;
	let memberList = props.memberList;
	let showLoading = props.showLoading;
	let confirmUpdateMember = props.confirmUpdateMember;

	const [data, setData] = useState();
	useEffect(() => {
		setData(memberList);
	}, [memberList, setData]);

	let title = clubName + ' Car Number List';
	const [selectedRow, setSelectedRow] = useState(null);

	return (
		<React.Fragment>
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
							field: 'lastName',
							editable: 'never'
						},
						{
							title: 'First Name',
							field: 'firstName',
							editable: 'never'
						},
						{
							title: 'Car Number',
							field: 'carNumber',
							validate: rowData =>
								rowData.carNumber < startNumber ||
								rowData.carNumber > endNumber
									? {
											isValid: true,
											helperText:
												'Car number range should be between ' +
												startNumber +
												' and ' +
												endNumber +
												'.'
									  }
									: true
						}
					]}
					editable={{
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
		</React.Fragment>
	);
};

export default MaterialTableCarNumberList;
