import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/FormElements/Button';
import MaterialTable, { MTableAction } from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';
import '../../shared/components/FormElements/Button.css';

const MaterialTableRefundCenter = props => {
	// callbacks from parent
	const getEmailRefundFee = props.getEmailRefundFee;
	const getPaymentStatus = props.getPaymentStatus;
	const updateRefundFee = props.updateRefundFee;

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

	// for editingCell to update new value
	const [data, setData] = useState(entryList);
	console.log('entryList = ', entryList);

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
								title: 'Stripe Fee',
								field: 'stripeFee',
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
						actions={[
							{
								icon: 'refund',
								tooltip: 'Refund',
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
									props.action.tooltip !== 'Refund'
								) {
									return <MTableAction {...props} />;
								} else {
									return (
										<Button
											onClick={event => {
												// return email back to parent to send request to backend
												getEmailRefundFee(
													props.data.email,
													props.data.refundFee
												);
												props.action.onClick(event, props.data);
											}}
											size={getButtonClassName(
												props.data.paymentStatus
											)}
											disabled={props.data.paymentStatus !== 'Paid'}>
											{getButtonText(props.data.paymentStatus)}
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
						onRowClick={(evt, selectedRow) => {
							setSelectedRow(selectedRow.tableData.id);
						}}
						cellEditable={{
							onCellEditApproved: (
								newValue,
								oldValue,
								rowData,
								columnDef
							) => {
								return new Promise((resolve, reject) => {
									if (rowData.paymentStatus !== 'Paid') {
										// for non-Paid status, don't allow to change refundFee
										alert(
											'Refund fee cannot be changed in current payment status'
										);
										resolve();
									} else {
										// rowData is the old data with old refundFee
										setTimeout(() => {
											// if new value is not a number (NaN)
											if (isNaN(newValue)) {
												alert('Refund fee cannot be letters');
												return resolve();
											}
											// cannot convert to float before checking isNaN;
											// otherwise value such as "1s" will be slipped through
											let newValueFloat = parseFloat(newValue);
											if (newValueFloat > rowData.entryFee) {
												alert(
													'Refund fee cannot be more than entry fee'
												);
												return resolve();
											}
											rowData.refundFee = newValue;
											updateRefundFee(rowData);
											const dataUpdate = [...data];
											const index = rowData.tableData.id;
											dataUpdate[index] = rowData;
											setData([...dataUpdate]);
											resolve();
										}, 1000);
									}
								});
							}
						}}
					/>
				)}
				{Object.values(lunchOptionLookup).length !== 0 && (
					<MaterialTable
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
								editable: 'never',
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
								title: 'Stripe Fee',
								field: 'stripeFee',
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
						actions={[
							{
								icon: 'refund',
								tooltip: 'Refund',
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
									props.action.tooltip !== 'Refund'
								) {
									return <MTableAction {...props} />;
								} else {
									return (
										<Button
											onClick={event => {
												// return email back to parent to send request to backend
												getEmailRefundFee(
													props.data.email,
													props.data.refundFee
												);
												props.action.onClick(event, props.data);
											}}
											size={getButtonClassName(
												props.data.paymentStatus
											)}
											disabled={props.data.paymentStatus !== 'Paid'}>
											{getButtonText(props.data.paymentStatus)}
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
						onRowClick={(evt, selectedRow) => {
							setSelectedRow(selectedRow.tableData.id);
						}}
						cellEditable={{
							onCellEditApproved: (
								newValue,
								oldValue,
								rowData,
								columnDef
							) => {
								return new Promise((resolve, reject) => {
									if (rowData.paymentStatus !== 'Paid') {
										// for non-Paid status, don't allow to change refundFee
										alert(
											'Refund fee cannot be changed in current payment status'
										);
										resolve();
									} else {
										// rowData is the old data with old refundFee
										setTimeout(() => {
											// if new value is not a number (NaN)
											if (isNaN(newValue)) {
												alert('Refund fee cannot be letters');
												return resolve();
											}
											// cannot convert to float before checking isNaN;
											// otherwise value such as "1s" will be slipped through
											let newValueFloat = parseFloat(newValue);
											if (newValueFloat > rowData.entryFee) {
												alert(
													'Refund fee cannot be more than entry fee'
												);
												return resolve();
											}
											rowData.refundFee = newValue;
											updateRefundFee(rowData);
											const dataUpdate = [...data];
											const index = rowData.tableData.id;
											dataUpdate[index] = rowData;
											setData([...dataUpdate]);
											resolve();
										}, 1000);
									}
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
