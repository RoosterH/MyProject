import React from 'react';
import MaterialTable from 'material-table';

const EntryReport = props => {
	console.log('props = ', props);
	let entries = props.entryData;

	let entryData = [];
	for (var i = 0; i < entries.length; ++i) {
		let entry = {
			lastname: entries[i].userLastName,
			firstname: entries[i].userFirstName
		};
		entryData.push(entry);
	}

	return (
		<MaterialTable
			title="Basic Filtering Preview"
			columns={[
				{ title: 'Last Name', field: 'lastname' },
				{ title: 'First Name', field: 'firstname' },
				{ title: 'Car Number', field: 'carnumber' },
				{ title: 'Car', field: 'car', filtering: false },
				{
					title: 'Class',
					field: 'class',
					lookup: { 0: 'SS', 1: 'AS' }
				},
				{
					title: 'Run Group',
					field: 'run',
					lookup: { 0: '1', 1: '2', 2: '3', 3: '4' }
				},

				{
					title: 'Worker Group',
					field: 'worker',
					lookup: { 0: 'Course1', 1: 'Course2' }
				}
			]}
			data={entryData}
			options={{
				filtering: true,
				exportButton: true
			}}
		/>
	);
};

export default EntryReport;
