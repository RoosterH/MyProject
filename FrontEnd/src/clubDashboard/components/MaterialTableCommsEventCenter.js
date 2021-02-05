import React, { useState, useEffect, useRef } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';

const MaterialTableCommsMembers = props => {
	// create a ref to clear all the selections after sending email
	const tableRef = useRef();
	let eventName = props.eventName;
	let entryList = props.entryList;
	let showLoading = props.showLoading;
	let emailHandler = props.emailHandler;

	const [data, setData] = useState();
	useEffect(() => {
		setData(entryList);
	}, [entryList, setData]);

	let title =
		eventName +
		' (Select attendees then click on email icon to send email)';
	const [selectedRow, setSelectedRow] = useState(null);

	return (
		<React.Fragment>
			<div className="entrylist-table">
				<MaterialTable
					tableRef={tableRef}
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
						}
					]}
					actions={[
						{
							tooltip: 'Send Email',
							icon: 'mail',
							onClick: (event, data) => {
								emailHandler(data);
								// clear all the selections
								tableRef.current.onAllSelected(false);
							}
						}
					]}
					options={{
						selection: true,
						filtering: true,
						pageSize: 20,
						pageSizeOptions: [5, 10, 20, 50, 100]
					}}
				/>
			</div>
		</React.Fragment>
	);
};

export default MaterialTableCommsMembers;
