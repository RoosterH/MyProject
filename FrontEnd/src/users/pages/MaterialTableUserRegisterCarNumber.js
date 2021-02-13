import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './UserRegisterCarNumber.css';

const MaterialTableUserRegisterCarNumber = props => {
	let numberList = props.numberList;
	let showLoading = props.showLoading;
	let clubName = props.clubName;
	let numberHandler = props.numberHandler;

	const [data, setData] = useState();
	useEffect(() => {
		setData(numberList);
	}, [numberList, setData]);

	let title = clubName + ' Available Car Number List';
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
						maxWidth: '600px',
						marginTop: '10px',
						marginLeft: '20px'
					}}
					columns={[
						{
							title: 'Number',
							field: 'number'
						}
					]}
					options={{
						filtering: true,
						columnsButton: false,
						pageSize: 50,
						pageSizeOptions: [50, 100, 200, 300, 400, 500]
					}}
					actions={[
						{
							icon: 'save',
							tooltip: 'Register Car Number',
							onClick: (event, rowData) => {
								console.log('rowData = ', rowData);
								numberHandler(rowData.number);
								// alert('Your car number is ' + rowData.number);
								// window.close();
							}
						}
					]}
				/>
			</div>
		</React.Fragment>
	);
};

export default MaterialTableUserRegisterCarNumber;
