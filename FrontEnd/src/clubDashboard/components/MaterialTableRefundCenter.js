import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/FormElements/Button';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';
import '../../shared/components/FormElements/Button.css';

const MaterialTableRefundCenter = props => {
	// callbacks from parent
	const getEmailRefundFee = props.getEmailRefundFee;
	const getPaymentStatus = props.getPaymentStatus;

	let entryList = props.entryList;
	let eventName = props.eventName;
	let lunchOptionLookup = props.lunchOptionLookup;
	let showLoading = props.showLoading;

	// cannot use useState to set button text and className because it will
	// apply to all buttons
	const getButtonClassName = paymentStatus => {
		if (
			paymentStatus === 'Unpaid' ||
			paymentStatus === 'Paid' ||
			paymentStatus === 'Refunded'
		) {
			// for Paid, we will disable the button and css is controlled by :disable
			return 'small-green';
		} else if (
			paymentStatus === 'Declined' ||
			paymentStatus === 'Require Authentication'
		) {
			return 'small-red';
		}
	};

	const [data, setData] = useState(entryList);

	const getButtonText = paymentStatus => {
		if (paymentStatus === 'Unpaid') {
			return 'CHARGE';
		} else if (paymentStatus === 'Paid') {
			return 'REFUND';
		} else if (paymentStatus === 'Declined') {
			return 'DECLINED';
		} else if (paymentStatus === 'Require Authentication') {
			return "AUTH REQ'D";
		} else if (paymentStatus === 'Refunded') {
			return 'REFUNDED';
		}
	};
	const [selectedRow, setSelectedRow] = useState(null);

	return (
		<React.Fragment>
			<div className="entrylist-table">
				{Object.values(lunchOptionLookup).length === 0 && (
					<MaterialTable
						// data={entryList}
						data={data}
						title={`${eventName} Entry List`}
						isLoading={showLoading}
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
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Email',
								field: 'email',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Car Number',
								field: 'carNumber',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Payment Method',
								field: 'paymentMethod',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Entry Fee',
								field: 'entryFee',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Refund Fee',
								field: 'refundFee',
								filtering: false,
								type: 'string',
								editable: 'onUpdate'
							},
							{
								title: 'Status',
								field: 'paymentStatus',
								filtering: false,
								editable: 'never'
							}
						]}
						options={{
							filtering: true,
							exportButton: true,
							rowStyle: rowData => ({
								backgroundColor:
									selectedRow === rowData.tableData.id
										? '#EEE'
										: '#FFF'
							})
						}}
						components={{
							Action: props => (
								<Button
									onClick={event => {
										// return email back to parent to send request to backend
										getEmailRefundFee(
											props.data.email,
											props.data.refundFee
										);
										props.action.onClick(event, props.data);
									}}
									size={getButtonClassName(props.data.paymentStatus)}
									disabled={props.data.paymentStatus !== 'Paid'}>
									{getButtonText(props.data.paymentStatus)}
								</Button>
							),
							OverlayLoading: props => (
								<div className="center">
									<LoadingSpinner />
								</div>
							)
						}}
						onRowClick={(evt, selectedRow) => {
							setSelectedRow(selectedRow.tableData.id);
						}}
						// editable={{
						// 	onRowAdd: newData =>
						// 		new Promise((resolve, reject) => {
						// 			setTimeout(() => {
						// 				setData([...data, newData]);

						// 				resolve();
						// 			}, 1000);
						// 		}),
						// 	onRowUpdate: (newData, oldData) =>
						// 		new Promise((resolve, reject) => {
						// 			setTimeout(() => {
						// 				const dataUpdate = [...data];
						// 				const index = oldData.tableData.id;
						// 				dataUpdate[index] = newData;
						// 				setData([...dataUpdate]);
						// 				resolve();
						// 			}, 1000);
						// 		})
						// 	// onRowDelete: oldData =>
						// 	// 	new Promise((resolve, reject) => {
						// 	// 		setTimeout(() => {
						// 	// 			const dataDelete = [...data];
						// 	// 			const index = oldData.tableData.id;
						// 	// 			dataDelete.splice(index, 1);
						// 	// 			setData([...dataDelete]);

						// 	// 			resolve();
						// 	// 		}, 1000);
						// 	// 	})
						// }}
						actions={[
							{
								icon: 'Charge',
								tooltip: 'Charge User',
								onClick: (event, rowData) => {
									setTimeout(() => {
										// need to set timeout to have the table load the new value
										// console.log('rowData = ', rowData);
									}, 2000);
								}
							}
						]}
						cellEditable={{
							onCellEditApproved: (
								newValue,
								oldValue,
								rowData,
								columnDef
							) => {
								return new Promise((resolve, reject) => {
									// rawData is the old data
									setTimeout(() => {
										console.log('rowData = ', rowData);
										rowData.refundFee = newValue;
										const dataUpdate = [...data];

										const index = rowData.tableData.id;
										console.log('index = ', index);
										dataUpdate[index] = rowData;
										console.log('dataUpdate new = ', dataUpdate);
										setData([...dataUpdate]);
										resolve();
									}, 1000);
								});
							}
						}}
					/>
				)}
				{Object.values(lunchOptionLookup).length !== 0 && (
					<MaterialTable
						// data={entryList}
						data={data}
						title={`${eventName} Entry List`}
						isLoading={showLoading}
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
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Email',
								field: 'email',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Car Number',
								field: 'carNumber',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Lunch',
								field: 'lunchOption',
								lookup: lunchOptionLookup
							},
							{
								title: 'Payment Method',
								field: 'paymentMethod',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Entry Fee',
								field: 'entryFee',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Refund Fee',
								field: 'refundFee',
								filtering: false,
								type: 'string',
								editable: 'onUpdate'
							},
							{
								title: 'Status',
								field: 'paymentStatus',
								filtering: false,
								editable: 'never'
							}
						]}
						options={{
							filtering: true,
							exportButton: true,
							rowStyle: rowData => ({
								backgroundColor:
									selectedRow === rowData.tableData.id
										? '#EEE'
										: '#FFF'
							})
						}}
						components={{
							Action: props => (
								<Button
									onClick={event => {
										// return email back to parent to send request to backend
										getEmailRefundFee(
											props.data.email,
											props.data.refundFee
										);
										props.action.onClick(event, props.data);
									}}
									size={getButtonClassName(props.data.paymentStatus)}
									disabled={props.data.paymentStatus !== 'Paid'}>
									{getButtonText(props.data.paymentStatus)}
								</Button>
							),
							OverlayLoading: props => (
								<div className="center">
									<LoadingSpinner />
								</div>
							)
						}}
						onRowClick={(evt, selectedRow) => {
							setSelectedRow(selectedRow.tableData.id);
						}}
						// editable={{
						// 	onRowAdd: newData =>
						// 		new Promise((resolve, reject) => {
						// 			setTimeout(() => {
						// 				setData([...data, newData]);

						// 				resolve();
						// 			}, 1000);
						// 		}),
						// 	onRowUpdate: (newData, oldData) =>
						// 		new Promise((resolve, reject) => {
						// 			setTimeout(() => {
						// 				const dataUpdate = [...data];
						// 				const index = oldData.tableData.id;
						// 				dataUpdate[index] = newData;
						// 				setData([...dataUpdate]);
						// 				resolve();
						// 			}, 1000);
						// 		})
						// 	// onRowDelete: oldData =>
						// 	// 	new Promise((resolve, reject) => {
						// 	// 		setTimeout(() => {
						// 	// 			const dataDelete = [...data];
						// 	// 			const index = oldData.tableData.id;
						// 	// 			dataDelete.splice(index, 1);
						// 	// 			setData([...dataDelete]);

						// 	// 			resolve();
						// 	// 		}, 1000);
						// 	// 	})
						// }}
						actions={[
							{
								icon: 'Charge',
								tooltip: 'Charge User',
								onClick: (event, rowData) => {
									setTimeout(() => {
										// need to set timeout to have the table load the new value
										// console.log('rowData = ', rowData);
									}, 2000);
								}
							}
						]}
						cellEditable={{
							onCellEditApproved: (
								newValue,
								oldValue,
								rowData,
								columnDef
							) => {
								return new Promise((resolve, reject) => {
									// rawData is the old data
									setTimeout(() => {
										console.log('rowData = ', rowData);
										rowData.refundFee = newValue;
										const dataUpdate = [...data];

										const index = rowData.tableData.id;
										console.log('index = ', index);
										dataUpdate[index] = rowData;
										console.log('dataUpdate new = ', dataUpdate);
										setData([...dataUpdate]);
										resolve();
									}, 1000);
								});
							}
						}}
					/>
				)}
			</div>
		</React.Fragment>
	);
};

export default MaterialTableRefundCenter;
