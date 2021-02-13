import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';

const MaterialTableAvailableCarNumberList = props => {
	let numberList = props.numberList;
	let showLoading = props.showLoading;
	let clubName = props.clubName;

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
						maxWidth: '300px',
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
						exportButton: true,
						columnsButton: false,
						pageSize: 50,
						pageSizeOptions: [50, 100, 200, 300, 400, 500]
					}}
				/>
			</div>
		</React.Fragment>
	);
};

export default MaterialTableAvailableCarNumberList;
