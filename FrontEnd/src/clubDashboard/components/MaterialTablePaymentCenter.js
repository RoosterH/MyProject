import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/FormElements/Button';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import './ClubManager.css';
import { TramOutlined } from '@material-ui/icons';

const MaterialTableEntryReport = props => {
	const getEmail = props.getEmail;
	let entryList = props.entryList;
	let eventName = props.eventName;
	let showLoading = props.showLoading;
	const [buttonText, setButtonText] = useState('Charge');
	const [buttonClassName, setButtonClassName] = useState(
		'small-green'
	);
	const [selectedRow, setSelectedRow] = useState(null);
	const [data, setData] = useState();
	console.log('paymentStatus = ', props);

	return (
		<React.Fragment>
			<div className="entrylist-table">
				<MaterialTable
					// data={data}
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
									props.action.onClick(event, props.data);
								}}
								size={
									props.data && props.data.paymentStatus === 'Paid'
										? 'small-grey'
										: 'small-green'
								}>
								{props.data && props.data.paymentStatus === 'Paid'
									? 'Charged'
									: 'Charge'}
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
								// need to call setData here to have table re-render with new value
								setTimeout(() => {
									// const dataUpdate = rowData;
									// console.log('dataUpdate = ', dataUpdate);
									// dataUpdate[rowData.tableData.id] = data;
									setData(rowData);
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
