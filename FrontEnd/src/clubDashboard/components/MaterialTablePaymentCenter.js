import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/FormElements/Button';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import './ClubManager.css';
import { TramOutlined } from '@material-ui/icons';

const MaterialTableEntryReport = props => {
	// callbacks from parent
	const getEmail = props.getEmail;
	const getPaymentStatus = props.getPaymentStatus;

	let entryList = props.entryList;
	let eventName = props.eventName;
	let showLoading = props.showLoading;

	// cannot use useState to set button text and className because it will
	// apply to all buttons
	const getButtonClassName = paymentStatus => {
		if (paymentStatus === 'Unpaid' || paymentStatus === 'Paid') {
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
			return 'Auth';
		}
	};
	const [selectedRow, setSelectedRow] = useState(null);

	return (
		<React.Fragment>
			<div className="entrylist-table">
				<MaterialTable
					data={entryList}
					title={`${eventName} Entry List`}
					isLoading={showLoading}
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
							title: 'Email',
							field: 'email',
							filtering: false
						},
						{
							title: 'Car Number',
							field: 'carNumber',
							filtering: false
						},
						{
							title: 'Payment Method',
							field: 'paymentMethod',
							filtering: false
						},
						{
							title: 'Entry Fee',
							field: 'entryFee',
							filtering: false
						},
						{
							title: 'Status',
							field: 'paymentStatus',
							filtering: false
						}
					]}
					components={{
						Action: props => (
							<Button
								onClick={event => {
									// return email back to parent to send request to backend
									getEmail(props.data.email);
									getPaymentStatus(props.data.paymentStatus);
									props.action.onClick(event, props.data);
								}}
								size={getButtonClassName(props.data.paymentStatus)}
								disabled={props.data.paymentStatus === 'Paid'}>
								{getButtonText(props.data.paymentStatus)}
							</Button>
						),
						OverlayLoading: props => (
							<div className="center">
								<LoadingSpinner />
							</div>
						)
					}}
					options={{
						filtering: true,
						exportButton: true,
						rowStyle: rowData => ({
							backgroundColor:
								selectedRow === rowData.tableData.id ? '#EEE' : '#FFF'
						})
					}}
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
					onRowClick={(evt, selectedRow) => {
						setSelectedRow(selectedRow.tableData.id);
					}}
				/>
			</div>
		</React.Fragment>
	);
};

export default MaterialTableEntryReport;
