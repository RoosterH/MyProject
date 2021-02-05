import React, { useState, useEffect, useRef } from 'react';
import MaterialTable from 'material-table';
import DOMPurify from 'dompurify';

import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';

const MaterialTableCommsEmailArchive = props => {
	// create a ref to clear all the selections after sending email
	const tableRef = useRef();
	let emailArchive = props.emailArchive;
	let showLoading = props.showLoading;

	const [data, setData] = useState();
	useEffect(() => {
		setData(emailArchive);
	}, [emailArchive, setData]);

	let title = 'Email Archive';
	const [selectedRow, setSelectedRow] = useState(null);

	// purify email content
	const createMarkup = html => {
		return {
			__html: DOMPurify.sanitize(html)
		};
	};

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
							title: 'Time',
							field: 'timeStamp',
							editable: 'never'
						},
						{
							title: 'Subject',
							field: 'subject',
							editable: 'never'
						},
						{
							title: 'Event',
							field: 'eventName',
							editable: 'never'
						},
						{
							title: 'Number of Recipients',
							field: 'recipientNum',
							filtering: false,
							editable: 'never'
						}
					]}
					detailPanel={rowData => {
						return (
							<div
								className="emailarchive-preview"
								dangerouslySetInnerHTML={createMarkup(
									rowData.content
								)}></div>
						);
					}}
					options={{
						filtering: true,
						pageSize: 20,
						pageSizeOptions: [5, 10, 20, 50, 100]
					}}
				/>
			</div>
		</React.Fragment>
	);
};

export default MaterialTableCommsEmailArchive;
