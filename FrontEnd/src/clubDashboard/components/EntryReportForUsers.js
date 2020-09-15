import React, { useContext, useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const EntryReportForUsers = props => {
	let displayName = props.location.state.displayName;
	let eventName = props.location.state.eventName;
	let eventId = props.location.state.eventId;

	const userAuthContext = useContext(UserAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [entryList, setEntryList] = useState([]);

	useEffect(() => {
		const fetchEntries = async () => {
			try {
				let responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/events/entryreportforusers/${eventId}`,
					'POST',
					JSON.stringify({ displayName: displayName }),
					{
						'Content-type': 'application/json',
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);

				let entryData = [];
				let entries = responseData.entries;
				for (var i = 0; i < entries.length; ++i) {
					let entry;
					if (displayName) {
						entry = {
							lastname: entries[i].userLastName,
							firstname: entries[i].userFirstName[0] + '.',
							carnumber: entries[i].carnumber,
							raceClass: entries[i].raceClass,
							car: entries[i].car
						};
					} else {
						entry = {
							username: entries[i].username,
							carnumber: entries[i].carnumber,
							raceClass: entries[i].raceClass,
							car: entries[i].car
						};
					}
					entryData.push(entry);
				}
				setEntryList(entryData);
			} catch (err) {}
		};
		fetchEntries();
	}, [sendRequest, setEntryList]);

	const classLookup = {
		0: 'SS',
		1: 'AS',
		2: 'BS',
		3: 'SSP',
		4: 'SSR'
	};
	const runGroupLookup = { 0: '1', 1: '2', 2: '3', 3: '4' };
	const workerGroupLookup = {
		0: 'Course1',
		1: 'Course2',
		2: 'Course3',
		3: 'Course4'
	};
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{displayName && (
				<MaterialTable
					title={{ eventName } + 'Entry List'}
					columns={[
						{ title: 'Last Name', field: 'lastname' },
						{ title: 'First Name', field: 'firstname' },
						{ title: 'Car Number', field: 'carnumber' },
						{ title: 'Car', field: 'car', filtering: false },
						{
							title: 'Class',
							field: 'class',
							lookup: { classLookup }
						},
						{
							title: 'Run Group',
							field: 'run',
							lookup: { runGroupLookup }
						},

						{
							title: 'Worker Group',
							field: 'worker',
							lookup: { workerGroupLookup }
						}
					]}
					data={entryList}
					options={{
						filtering: true,
						exportButton: true
					}}
				/>
			)}
			{!displayName && (
				<MaterialTable
					title={{ eventName } + 'Entry List'}
					columns={[
						{ title: 'User Name', field: 'username' },
						{ title: 'Car Number', field: 'carnumber' },
						{ title: 'Car', field: 'car', filtering: false },
						{
							title: 'Class',
							field: 'class',
							lookup: { classLookup }
						},
						{
							title: 'Run Group',
							field: 'run',
							lookup: { runGroupLookup }
						},

						{
							title: 'Worker Group',
							field: 'worker',
							lookup: { workerGroupLookup }
						}
					]}
					data={entryList}
					options={{
						filtering: true,
						exportButton: true
					}}
				/>
			)}
		</React.Fragment>
	);
};

export default EntryReportForUsers;
