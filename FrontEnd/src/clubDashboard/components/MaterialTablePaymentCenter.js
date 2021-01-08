import React, { useState, useEffect } from 'react';
import Button from '../../shared/components/FormElements/Button';
import MaterialTable, {
	MTableAction,
	MTableToolbar
} from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import './ClubManager.css';

const MaterialTablePaymentCenter = props => {
	let entryList = props.entryList;
	let eventName = props.eventName;

	// callbacks from parent
	const chargeByEmail = props.chargeByEmail;
	const getPaymentStatus = props.getPaymentStatus;
	const updateEntryFee = props.updateEntryFee;
	const chargeAllStatus = props.chargeAllStatus;
	const confirmChargeAll = props.confirmChargeAll;
	const confirmDeleteUser = props.confirmDeleteUser;

	let lunchOptionLookup = props.lunchOptionLookup;
	let entryToDelete = props.entryToDelete;
	let showLoading = props.showLoading;

	// for editingCell to update new value
	const [data, setData] = useState();
	useEffect(() => {
		setData(entryList);
	}, [entryList]);

	const [disableChargeAll, setDisableChargeAll] = useState();
	useEffect(() => {
		setDisableChargeAll(chargeAllStatus);
	}, [chargeAllStatus]);

	let title =
		!!data && data.length > 0
			? `${eventName} Entry List - total entries ${data.length}`
			: `${eventName} Entry List`;

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

	const getButtonText = paymentStatus => {
		if (paymentStatus === 'Unpaid') {
			return 'CHARGE';
		} else if (paymentStatus === 'Paid') {
			return 'PAID';
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
						title={title}
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
								editable: 'onUpdate'
							},
							{
								title: 'Stripe Fee',
								field: 'stripeFee',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Status',
								field: 'paymentStatus',
								filtering: false,
								editable: 'never'
							}
						]}
						components={{
							Action: props => {
								if (
									typeof props.action === typeof Function ||
									props.action.tooltip !== 'Charge'
								) {
									return <MTableAction {...props} />;
								} else {
									return (
										<Button
											onClick={event => {
												// return email back to parent to send request to backend
												chargeByEmail(props.data.email);
												getPaymentStatus(props.data.paymentStatus);
												props.action.onClick(event, props.data);
											}}
											size={getButtonClassName(
												props.data.paymentStatus
											)}
											disabled={
												props.data.paymentStatus === 'Paid' ||
												props.data.paymentStatus === 'Refunded'
											}>
											{getButtonText(props.data.paymentStatus)}
										</Button>
									);
								}
							},
							OverlayLoading: props => (
								<div className="center">
									<LoadingSpinner />
								</div>
							),
							Toolbar: props => (
								<div>
									<MTableToolbar {...props} />
									<div style={{ padding: '0px 10px' }}>
										<Button
											onClick={event => {
												confirmChargeAll(true);
											}}
											size={'small-red'}
											disabled={
												entryList === undefined ||
												entryList.length === 0 ||
												disableChargeAll
											}>
											CHARGE ALL
										</Button>
									</div>
								</div>
							)
						}}
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
							rowData => ({
								icon: 'delete',
								tooltip: 'Delete Entry',
								onClick: (event, rowData) => {
									// flag to display modal to ask for confirmation
									confirmDeleteUser(true);

									// need to set timeout to have the table load the new value
									setTimeout(() => {
										const dataUpdate = [...data];
										const index = rowData.tableData.id;
										// return to payment center then send a request to backend
										entryToDelete(rowData);
									}, 1000);
								},
								disabled: rowData.paymentStatus !== 'Unpaid'
							}),
							{
								icon: 'Charge',
								tooltip: 'Charge',
								onClick: (event, rowData) => {
									setTimeout(() => {
										// need to set timeout to have the table load the new value
										// console.log('rowData = ', rowData);
									}, 2000);
								}
							}
						]}
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
									if (rowData.paymentStatus !== 'Unpaid') {
										// for non-Paid status, don't allow to change refundFee
										alert(
											'Entry fee cannot be changed in current payment status'
										);
										resolve();
									} else {
										// rowData is the old data with old refundFee
										setTimeout(() => {
											// if new value is not a number (NaN)
											if (isNaN(newValue)) {
												alert('Entry fee cannot be letters');
												return resolve();
											}
											// cannot convert to float before checking isNaN;
											// otherwise value such as "1s" will be slipped through
											let newValueFloat = parseFloat(newValue);
											rowData.entryFee = newValue;
											rowData.stripeFee = parseFloat(
												newValueFloat * 0.029 + 0.3
											).toFixed(2);
											updateEntryFee(rowData);
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
						title={title}
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
								lookup: lunchOptionLookup,
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
								editable: 'onUpdate'
							},
							{
								title: 'Stripe Fee',
								field: 'stripeFee',
								filtering: false,
								editable: 'never'
							},
							{
								title: 'Status',
								field: 'paymentStatus',
								filtering: false,
								editable: 'never'
							}
						]}
						components={{
							Action: props => {
								if (
									typeof props.action === typeof Function ||
									props.action.tooltip !== 'Charge'
								) {
									return <MTableAction {...props} />;
								} else {
									return (
										<Button
											onClick={event => {
												// return email back to parent to send request to backend
												chargeByEmail(props.data.email);
												getPaymentStatus(props.data.paymentStatus);
												props.action.onClick(event, props.data);
											}}
											size={getButtonClassName(
												props.data.paymentStatus
											)}
											disabled={
												props.data.paymentStatus === 'Paid' ||
												props.data.paymentStatus === 'Refunded'
											}>
											{getButtonText(props.data.paymentStatus)}
										</Button>
									);
								}
							},
							OverlayLoading: props => (
								<div className="center">
									<LoadingSpinner />
								</div>
							),
							Toolbar: props => (
								<div>
									<MTableToolbar {...props} />
									<div style={{ padding: '0px 10px' }}>
										<Button
											onClick={event => {
												confirmChargeAll(true);
											}}
											size={'small-red'}
											disabled={
												entryList === undefined ||
												entryList.length === 0 ||
												disableChargeAll
											}>
											CHARGE ALL
										</Button>
									</div>
								</div>
							)
						}}
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
							rowData => ({
								icon: 'delete',
								tooltip: 'Delete Entry',
								onClick: (event, rowData) => {
									confirmDeleteUser(true);

									// need to set timeout to have the table load the new value
									setTimeout(() => {
										const dataUpdate = [...data];
										const index = rowData.tableData.id;
										// return to payment center then send a request to backend
										entryToDelete(rowData);
									}, 1000);
								},
								disabled: rowData.paymentStatus !== 'Unpaid'
							}),
							{
								icon: 'Charge',
								tooltip: 'Charge',
								onClick: (event, rowData) => {
									setTimeout(() => {
										// need to set timeout to have the table load the new value
										// console.log('rowData = ', rowData);
									}, 2000);
								}
							}
						]}
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
									if (rowData.paymentStatus !== 'Unpaid') {
										// for non-Paid status, don't allow to change refundFee
										alert(
											'Entry fee cannot be changed in current payment status'
										);
										resolve();
									} else {
										// rowData is the old data with old refundFee
										setTimeout(() => {
											// if new value is not a number (NaN)
											if (isNaN(newValue)) {
												alert('Entry fee cannot be letters');
												return resolve();
											}
											// cannot convert to float before checking isNaN;
											// otherwise value such as "1s" will be slipped through
											let newValueFloat = parseFloat(newValue);
											rowData.entryFee = newValue;
											rowData.stripeFee = parseFloat(
												newValueFloat * 0.029 + 0.3
											).toFixed(2);
											updateEntryFee(rowData);
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

export default MaterialTablePaymentCenter;
