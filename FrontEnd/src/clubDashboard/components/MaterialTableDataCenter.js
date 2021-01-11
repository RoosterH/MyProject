import React from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';
import '../../shared/components/FormElements/Button.css';

const MaterialTableRefundCenter = props => {
	let eventData = props.eventData;
	let eventName = props.eventName;
	let lunchOptions = props.lunchOptions;
	let lunchOrders = props.lunchOrders;
	let showLoading = props.showLoading;

	// construct lunch table
	let tableColumns = [];
	if (!!lunchOptions) {
		for (let i = 0; i < lunchOptions.length; ++i) {
			let col = {};
			col['title'] = lunchOptions[i];
			col['field'] = lunchOptions[i];
			col['filtering'] = false;
			tableColumns.push(col);
		}
	}

	return (
		<React.Fragment>
			<div className="entrylist-table">
				<MaterialTable
					data={eventData}
					title={`${eventName} Event Data`}
					isLoading={showLoading}
					style={{
						border: '1px solid gray',
						maxWidth: '1450px',
						marginTop: '10px',
						marginLeft: '20px'
					}}
					columns={[
						{
							title: 'Total Entries',
							field: 'totalEntries',
							filtering: false
						},
						{
							title: 'Total Amount',
							field: 'totalAmount',
							filtering: false
						},
						{
							title: 'Stripe Fee',
							field: 'stripeFee',
							filtering: false
						},
						{
							title: 'Refunded Fee',
							field: 'refundFee',
							filtering: false
						},
						{
							title: 'Unpaid Fee',
							field: 'unpaid',
							filtering: false
						},
						{
							title: 'Net',
							field: 'net',
							filtering: false
						}
					]}
					options={{
						exportButton: true,
						columnsButton: true,
						pageSize: 5,
						pageSizeOptions: [5, 10, 20]
					}}
					components={{
						OverlayLoading: props => (
							<div className="center">
								<LoadingSpinner />
							</div>
						)
					}}
				/>
				{!!lunchOptions && lunchOptions.length !== 0 && (
					<MaterialTable
						data={lunchOrders}
						title={`${eventName} Lunch Data`}
						isLoading={showLoading}
						style={{
							border: '1px solid gray',
							maxWidth: '1450px',
							marginTop: '10px',
							marginLeft: '20px'
						}}
						columns={tableColumns}
						options={{
							exportButton: true,
							columnsButton: true,
							pageSize: 5,
							pageSizeOptions: [5, 10, 20]
						}}
						components={{
							OverlayLoading: props => (
								<div className="center">
									<LoadingSpinner />
								</div>
							)
						}}
					/>
				)}
			</div>
		</React.Fragment>
	);
};

export default MaterialTableRefundCenter;
