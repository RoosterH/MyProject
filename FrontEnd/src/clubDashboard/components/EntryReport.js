import React from 'react';
import MaterialTable from 'material-table';

const EntryReport = props => {
	console.log('props = ', props);
	let entries = props.entryData;

	let entryData = [];
	for (var i = 0; i < entries.length; ++i) {
		let entry = {
			lastname: entries[i].userLastName,
			name: entries[i].userFirstName
		};
		entryData.push(entry);
	}

	return (
		<MaterialTable
			title="Basic Filtering Preview"
			columns={[
				{ title: 'Name', field: 'name' },
				{ title: 'Last Name', field: 'lastname' },
				{ title: 'Birth Year', field: 'birthYear', type: 'numeric' },
				{
					title: 'Birth Place',
					field: 'birthCity',
					lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' }
				}
			]}
			data={entryData}
			options={{
				filtering: true
			}}
		/>
	);
};

export default EntryReport;
